import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';

// Importamos componentes animados
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useAgregarLugar } from '@/hooks/useLugar';
import { MapSelector } from '@/components/MapSelector';
import { useSession } from '@/features/session/model/useSession';
import { theme } from '@/core/styles/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AgregarPage() {
  const router = useRouter();
  const { session } = useSession();

  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);

  const agregarMutation = useAgregarLugar();

  // Animación del botón Registrar
  const buttonScale = useSharedValue(1);
  const animatedButtonProps = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.97, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const pickImage = (useCamera: boolean) => async () => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso para usar imágenes.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Foto del plato', 'Selecciona una opción', [
      { text: '📷 Cámara', onPress: pickImage(true) },
      { text: '🖼 Galería', onPress: pickImage(false) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const agregar = async () => {
    setError(null);

    if (!session?.user?.id) return;

    if (!nombre.trim() || !ciudad.trim() || !pais.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const locationPermission = await Location.requestForegroundPermissionsAsync();

    let latitude: number | null = manualLat;
    let longitude: number | null = manualLng;

    if (latitude === null || longitude === null) {
      if (locationPermission.granted) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    }

    if (latitude === null || longitude === null) {
      setError('No se pudo obtener la ubicación. Selecciona una en el mapa o activa el GPS.');
      return;
    }

    agregarMutation.mutate(
      {
        user_id: session.user.id,
        name: nombre.trim(),
        photo_uri: photoUri,
        city: ciudad.trim(),
        country: pais.trim(),
        latitude,
        longitude,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (err: any) => {
          setError(err?.message || 'Error al registrar el lugar. Intenta de nuevo.');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text style={styles.title}>Nuevo Lugar</Text>
          </View>
        </View>

        {/* CARD CONTENEDORA DE FORMULARIO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <LottieView
                source={require('../../../assets/lottie/Parking Spots.json')}
                autoPlay
                loop
                style={styles.headerLottie}
              />
            </View>
            <View>
              <Text style={styles.cardTitle}>Nuevo Lugar</Text>
              <Text style={styles.cardSubtitle}>Completa la información</Text>
            </View>
          </View>

          {/* FOTO */}
          <Pressable onPress={showPhotoOptions} style={styles.imagePicker}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <LottieView
                  source={require('../../../assets/lottie/Camera Pop-Up.json')}
                  autoPlay
                  loop
                  style={[styles.headerLottie, { width: 120, height: 120 }]} 
                />
                <Text style={styles.imageText}>Seleccionar foto</Text>
              </View>
            )}
          </Pressable>

          {/* INPUTS */}
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="fastfood" size={24} color={theme.colors.accent} />
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del lugar"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <FontAwesome5 name="city" size={24} color={theme.colors.accent} />
              <TextInput
                value={ciudad}
                onChangeText={setCiudad}
                placeholder="Ciudad"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Fontisto name="world" size={20} color={theme.colors.accent} />
              <TextInput
                value={pais}
                onChangeText={setPais}
                placeholder="País"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          {/* UBICACIÓN MANUAL */}
          <Pressable
            onPress={() => setShowMapSelector(true)}
            style={styles.locationBtn}
          >
            <View style={styles.locationBtnInner}>
              <Ionicons
                name={manualLat ? 'location' : 'map-outline'}
                size={20}
                color={manualLat ? 'white' : theme.colors.textMuted}
              />
              <Text style={[styles.locationBtnText, manualLat ? { color: 'white' } : undefined]}>
                {manualLat
                  ? `Ubicación: ${manualLat.toFixed(4)}, ${manualLng!.toFixed(4)}`
                  : 'Seleccionar ubicación en mapa'}
              </Text>
              {manualLat && (
                <Pressable
                  onPress={() => { setManualLat(null); setManualLng(null); }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
                </Pressable>
              )}
            </View>
          </Pressable>

          {/* ERROR */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* BUTTON CON EFECTO DE ESCALA SPRING */}
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={agregar}
            disabled={agregarMutation.isPending}
            style={[styles.buttonWrapper, animatedButtonProps]}
          >
            <View style={styles.button}>
              {agregarMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Registrar lugar</Text>
                </>
              )}
            </View>
          </AnimatedPressable>
        </View>
      </ScrollView>

      {/* MAP SELECTOR MODAL */}
      <Modal visible={showMapSelector} animationType="slide" presentationStyle="fullScreen">
        <MapSelector
          onLocationSelected={(lat, lng) => {
            setManualLat(lat);
            setManualLng(lng);
            setShowMapSelector(false);
          }}
          onClose={() => setShowMapSelector(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    ...theme.shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(37,99,235,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerLottie: {
    width: 36,
    height: 36,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  imagePicker: {
    height: 190,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    overflow: 'hidden',
    backgroundColor: theme.colors.inputBg,
    marginBottom: 22,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: theme.colors.textMuted,
    marginTop: 12,
    fontWeight: '600',
  },
  inputsContainer: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonWrapper: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
  },
  locationBtn: {
    marginTop: 18,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  locationBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.inputBg,
  },
  locationBtnText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
});