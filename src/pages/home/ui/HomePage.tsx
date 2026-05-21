import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Animated, { 
  FadeIn,
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import { useLugares, useEliminarLugar } from '@/hooks/useLugar';
import { useSession } from '@/features/session/model/useSession';
import { theme } from '@/core/styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 280; // Altura promedio estimada para los cálculos vectoriales

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- TARJETA CON EFECTO TILT 3D Y GLOW INTERNO ---
function LugarListItem({ item, index, onPress, onDelete }: { item: any; index: number; onPress: () => void; onDelete: () => void }) {
  
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const glowX = useSharedValue(CARD_WIDTH / 2);
  const glowY = useSharedValue(CARD_HEIGHT / 2);
  const glowOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const springConfig = { damping: 12, stiffness: 120 };

  const handlePressIn = (e: any) => {
    const x = e.nativeEvent.locationX;
    const y = e.nativeEvent.locationY;
    const px = (x / CARD_WIDTH) - 0.5;
    const py = (y / CARD_HEIGHT) - 0.5;

    rotateX.value = withSpring(interpolate(py, [-0.5, 0.5], [25, -25]), springConfig);
    rotateY.value = withSpring(interpolate(px, [-0.5, 0.5], [-25, 25]), springConfig);
    cardScale.value = withSpring(0.96, springConfig);
    glowX.value = x;
    glowY.value = y;
    glowOpacity.value = withSpring(0.8, springConfig);
  };

  const handlePressOut = () => {
    rotateX.value = withSpring(0, springConfig);
    rotateY.value = withSpring(0, springConfig);
    cardScale.value = withSpring(1, springConfig);
    glowOpacity.value = withSpring(0, springConfig);
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 400 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: cardScale.value }
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: glowY.value - 120,
    left: glowX.value - 120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 80).springify().dampingRatio(0.85)}
      style={styles.cardContainerWrapper}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.lugarCard, animatedCardStyle]}
      >
        {item.photo_uri && (
          <Image source={{ uri: item.photo_uri }} style={styles.lugarImage} />
        )}
        
        <View style={styles.lugarContent}>
          <View style={styles.lugarTitleRow}>
            <Text style={styles.lugarTitle}>{item.name}</Text>
            
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteIconBtn}
            >
              <Entypo name="trash" size={22} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>

          {(item.city || item.country) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={18} color={theme.colors.accent} />
              <Text style={styles.locationText}>
                {[item.city, item.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
          
          {item.latitude && item.longitude && (
            <Text style={styles.coords}>
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        <Animated.View style={animatedGlowStyle} pointerEvents="none" />
      </AnimatedPressable>
    </Animated.View>
  );
}

// --- PANTALLA PRINCIPAL HOMEPAGE ---
export default function HomePage() {
  const router = useRouter();
  const { session, signOut } = useSession();
  const [searchText, setSearchText] = useState('');

  const { data: lugares = [] } = useLugares();
  const eliminarMutation = useEliminarLugar();

  const buttonScale = useSharedValue(1);
  const animatedButtonProps = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const filteredLugares = useMemo(() => {
    if (!searchText.trim()) return lugares;
    const q = searchText.toLowerCase();
    return lugares.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.country?.toLowerCase().includes(q)
    );
  }, [lugares, searchText]);

  const handleEliminar = (id: string) => {
    const lugarName = lugares.find((l) => l.id === id)?.name ?? 'este lugar';
    Alert.alert(
      'Eliminar lugar',
      `¿Seguro que deseas eliminar "${lugarName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            eliminarMutation.mutate(id, {
              onError: (err: any) => {
                Alert.alert('Error', err?.message || 'No se pudo eliminar el lugar.');
              },
            }),
        },
      ]
    );
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* HEADER */}
          <Animated.View entering={FadeInDown.duration(500).delay(100).springify()} style={styles.header}>
            <View>
              <Text style={styles.sessionText}>{session?.user?.email ?? 'Sesión activa'}</Text>
              <Text style={styles.title}>Gestión de Lugares</Text>
            </View>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
            </Pressable>
          </Animated.View>

          {/* SEARCH BAR */}
          <Animated.View entering={FadeInDown.duration(500).delay(200).springify()} style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar lugares..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
              </Pressable>
            )}
          </Animated.View>

          {/* BOTÓN AGREGAR LUGAR */}
          <Animated.View entering={FadeInDown.duration(500).delay(300).springify()}>
            <AnimatedPressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => router.push('/agregar')}
              style={[styles.addButtonWrapper, animatedButtonProps]}
            >
              <View style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.addButtonText}>Agregar lugar</Text>
              </View>
            </AnimatedPressable>
          </Animated.View>

          {/* TÍTULO DE LISTA */}
          <Animated.Text entering={FadeInDown.duration(500).delay(400).springify()} style={styles.listTitle}>
            Lugares registrados
          </Animated.Text>

          {/* LISTA CON ANIMACIÓN TILT INDIVIDUAL */}
          <FlatList
            scrollEnabled={false}
            data={filteredLugares}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 20 }}
            ListEmptyComponent={
              <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.emptyCard}>
                <LottieView
                  source={require('../../../assets/lottie/No Search result.json')} 
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
                <Text style={styles.emptyText}>
                  {searchText.trim() ? 'No se encontraron lugares' : 'Todavía no hay lugares registrados'}
                </Text>
              </Animated.View>
            }
            renderItem={({ item, index }) => (
              <LugarListItem
                item={item}
                index={index}
                onPress={() => router.push(`/Lugar/${item.id}` as any)}
                onDelete={() => handleEliminar(item.id)}
              />
            )}
          />
        </ScrollView>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg, // Restaurado el fondo sólido por defecto
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  sessionText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  title: {
    color: theme.colors.primary,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220,38,38,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- BUSCADOR CON MÁS SOMBRA Y EFECTO AZUL ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.25)', // Haz azul delgado para Android
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    
    // Sombras reforzadas con tono azul para iOS
    shadowColor: '#3b82f6', 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    // Elevación para Android
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
  },

  // --- BOTÓN AGREGAR LUGAR CON SOMBRA AZUL ---
  addButtonWrapper: {
    marginBottom: 28,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)', // Contorno azul sutil

    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
  },
  listTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
  },

  // --- TARJETA VACÍA CON SOMBRA AZUL ---
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',

    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  lottieAnimation: {
    width: 180,
    height: 180,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  cardContainerWrapper: {
    position: 'relative',
    borderRadius: 20,
  },

  // --- TARJETAS DE LUGARES (LISTA) CON CONTORNO Y SOMBRA AZUL ---
  lugarCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    overflow: 'hidden', 
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.2)', // Contorno azul delgado estético

    shadowColor: '#3b82f6', 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
    backfaceVisibility: 'hidden',
  },
  lugarImage: {
    width: '100%',
    height: 160,
  },
  lugarContent: {
    padding: 16,
  },
  lugarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lugarTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  deleteIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239,68,68,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    color: theme.colors.textMid,
    marginLeft: 6,
    fontSize: 14,
  },
  coords: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
});