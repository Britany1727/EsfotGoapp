import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LeafletMap } from './LeafletMap';
import { useLocation } from '../hooks/useLocation';
import { useEffect, useMemo } from 'react';
import { getDistance } from 'geolib';
import { theme } from '@/core/styles/theme';

interface MapViewProps {
  lugarLat: number;
  lugarLng: number;
  lugarName?: string;
  onClose?: () => void;
}

export function MapView({ lugarLat, lugarLng, lugarName, onClose }: MapViewProps) {
  const { location, getPosition, loading } = useLocation();

  useEffect(() => {
    getPosition();
  }, []);

  const distance = useMemo(() => {
    if (!location) return null;
    return getDistance(location, { latitude: lugarLat, longitude: lugarLng });
  }, [location, lugarLat, lugarLng]);

  return (
    <View style={styles.container}>
      {onClose && (
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Ubicación del lugar</Text>
            {lugarName && (
              <Text style={styles.headerSubtitle}>{lugarName}</Text>
            )}
          </View>
        </View>
      )}

      <LeafletMap
        centerLat={lugarLat}
        centerLng={lugarLng}
        markerLat={lugarLat}
        markerLng={lugarLng}
        userLat={location?.latitude}
        userLng={location?.longitude}
        distanceMeters={distance}
        lugarName={lugarName}
        zoom={15}
      />

      {location && (
        <View style={styles.infoBox}>
          <Ionicons name="location" size={16} color={theme.colors.accent} />
          <Text style={styles.infoText}>
            {lugarLat.toFixed(6)}, {lugarLng.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: theme.colors.primary,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 2,
  },
  infoBox: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    color: theme.colors.textMid,
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
