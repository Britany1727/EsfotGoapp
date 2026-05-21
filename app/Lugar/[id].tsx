import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { getDistance } from 'geolib';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useLugares, useEliminarLugar } from '@/hooks/useLugar';
import { useLocation } from '@/hooks/useLocation';
import { theme } from '@/core/styles/theme';
import { Lugar } from "../../src/types/Lugar"

function formatDistance(meters: number): { value: string; unit: string } {
  if (meters < 1000) {
    return { value: meters.toString(), unit: 'm' };
  }
  const km = meters / 1000;
  return { value: km.toFixed(1), unit: 'km' };
}

function LiveDot() {
  const style = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(0.8, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return <Animated.View style={[styles.liveDot, style]} />;
}

export default function PlatoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: lugares = [], isLoading } = useLugares();
  const { location, startWatching } = useLocation();

  useEffect(() => {
    startWatching();
  }, []);

  const lugar: Lugar | undefined = lugares.find((l) => l.id === id);

  const distance = useMemo(() => {
    if (!location || !lugar?.latitude || !lugar?.longitude) return null;
    return getDistance(location, {
      latitude: lugar.latitude,
      longitude: lugar.longitude,
    });
  }, [location, lugar?.latitude, lugar?.longitude]);

  const eliminarMutation = useEliminarLugar();

  const handleDelete = () => {
    Alert.alert(
      'Eliminar lugar',
      `¿Estás seguro de eliminar "${lugar?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarMutation.mutate(id, {
              onSuccess: () => router.back(),
              onError: (err: any) => {
                Alert.alert('Error', err?.message || 'No se pudo eliminar el lugar.');
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!lugar) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="sad-outline" size={64} color={theme.colors.textMuted} />
        <Text style={styles.notFoundText}>Lugar no encontrado</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const hasCoords = !!(lugar.latitude && lugar.longitude);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Animated.View
          entering={FadeInDown.duration(500).springify().dampingRatio(0.8)}
          style={styles.card}
        >
          {lugar.photo_uri && (
            <Image source={{ uri: lugar.photo_uri }} style={styles.image} />
          )}

          <Animated.View style={styles.content}>
            <Text style={styles.name}>{lugar.name}</Text>

            {(lugar.city || lugar.country) && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(150).springify()}
                style={styles.row}
              >
                <Ionicons name="location-outline" size={18} color={theme.colors.accent} />
                <Text style={styles.locationText}>
                  {[lugar.city, lugar.country].filter(Boolean).join(', ')}
                </Text>
              </Animated.View>
            )}

            {lugar.created_at && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(250).springify()}
                style={styles.row}
              >
                <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
                <Text style={styles.metaText}>
                  {new Date(lugar.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Animated.View>
            )}

            {hasCoords ? (
              <Animated.View
                entering={FadeInDown.duration(400).delay(350).springify()}
                style={styles.coordsBox}
              >
                <Ionicons name="earth" size={16} color={theme.colors.accent} />
                <Text style={styles.coordsText}>
                  {lugar.latitude!.toFixed(6)}, {lugar.longitude!.toFixed(6)}
                </Text>
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeInDown.duration(400).delay(350).springify()}
                style={styles.coordsBox}
              >
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.warning} />
                <Text style={styles.noCoordsText}>Sin ubicación registrada</Text>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>

        {hasCoords && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(250).springify().dampingRatio(0.8)}
            style={styles.distanceCard}
          >
            <View style={styles.distanceHeader}>
              <LiveDot />
              <Text style={styles.distanceTitle}>Distancia desde tu ubicación</Text>
            </View>

            {distance !== null ? (
              <Animated.View
                entering={FadeInDown.duration(400).delay(400).springify()}
                style={styles.distanceValueRow}
              >
                <Ionicons name="resize" size={28} color={theme.colors.accent} />
                <Text style={styles.distanceValue}>
                  {formatDistance(distance).value}
                </Text>
                <Text style={styles.distanceUnit}>
                  {formatDistance(distance).unit}
                </Text>
              </Animated.View>
            ) : (
              <View style={styles.distanceLoadingRow}>
                <ActivityIndicator size="small" color={theme.colors.accent} />
                <Text style={styles.distanceLoadingText}>
                  Obteniendo ubicación...
                </Text>
              </View>
            )}

            <View style={styles.distanceMetaRow}>
              <Ionicons name="navigate" size={14} color={theme.colors.textMuted} />
              <Text style={styles.distanceMetaText}>
                {location
                  ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : '---'}
              </Text>
            </View>
          </Animated.View>
        )}

        {hasCoords && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(450).springify().dampingRatio(0.8)}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/Mapa/view' as any,
                  params: { lat: lugar.latitude, lng: lugar.longitude, name: lugar.name },
                } as any)
              }
              style={styles.mapBtn}
            >
              <Ionicons name="map-outline" size={22} color="white" />
              <Text style={styles.mapBtnText}>Ver ubicación</Text>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.duration(500).delay(550).springify().dampingRatio(0.8)}
        >
          <Pressable
            onPress={handleDelete}
            disabled={eliminarMutation.isPending}
            style={styles.deleteBtn}
          >
            <Ionicons
              name={eliminarMutation.isPending ? 'hourglass-outline' : 'trash-outline'}
              size={20}
              color="white"
            />
            <Text style={styles.deleteBtnText}>
              {eliminarMutation.isPending ? 'Eliminando...' : 'Eliminar lugar'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: theme.colors.bg,
  },
  notFoundText: {
    color: theme.colors.textMid,
    fontSize: 18,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 12,
  },
  backLinkText: {
    color: theme.colors.accent,
    fontSize: 16,
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  image: {
    width: '100%',
    height: 260,
  },
  content: {
    padding: 24,
    gap: 14,
  },
  name: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    color: theme.colors.textMid,
    fontSize: 16,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  coordsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(37,99,235,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  coordsText: {
    color: theme.colors.accent,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  noCoordsText: {
    color: theme.colors.warning,
    fontSize: 13,
  },
  distanceCard: {
    marginTop: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    ...theme.shadow.card,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  distanceTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  distanceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  distanceValue: {
    color: theme.colors.text,
    fontSize: 48,
    fontWeight: '800',
  },
  distanceUnit: {
    color: theme.colors.accent,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 4,
  },
  distanceLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    paddingVertical: 16,
  },
  distanceLoadingText: {
    color: theme.colors.textMid,
    fontSize: 15,
  },
  distanceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  distanceMetaText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  mapBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  mapBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  deleteBtn: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
