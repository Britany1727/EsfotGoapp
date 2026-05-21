import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LeafletMap } from './LeafletMap';
import { useLocation } from '../hooks/useLocation';
import { useEffect, useState } from 'react';
import { theme } from '@/core/styles/theme';

interface MapSelectorProps {
    onLocationSelected: (lat: number, lng: number) => void;
    onClose: () => void;
    initialLat?: number;
    initialLng?: number;
    }

    export function MapSelector({
    onLocationSelected,
    onClose,
    initialLat,
    initialLng,
    }: MapSelectorProps) {
    const { location, getPosition, loading: locLoading } = useLocation();
    const [selectedLat, setSelectedLat] = useState(initialLat ?? location?.latitude ?? -12.0464);
    const [selectedLng, setSelectedLng] = useState(initialLng ?? location?.longitude ?? -77.0428);
    const [useMyLocation, setUseMyLocation] = useState(false);

    useEffect(() => {
        getPosition();
    }, []);

    useEffect(() => {
        if (location && useMyLocation) {
        setSelectedLat(location.latitude);
        setSelectedLng(location.longitude);
        setUseMyLocation(false);
        }
    }, [location, useMyLocation]);

    const handleLocationSelect = (lat: number, lng: number) => {
        setSelectedLat(lat);
        setSelectedLng(lng);
    };

    const handleConfirm = () => {
        onLocationSelected(selectedLat, selectedLng);
    };

    const centerLat = initialLat ?? location?.latitude ?? -12.0464;
    const centerLng = initialLng ?? location?.longitude ?? -77.0428;

    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text style={styles.title}>Seleccionar ubicación</Text>
            <View style={styles.spacer} />
        </View>

        <View style={styles.mapContainer}>
            <LeafletMap
            centerLat={centerLat}
            centerLng={centerLng}
            markerLat={selectedLat}
            markerLng={selectedLng}
            selectable
            onLocationSelect={handleLocationSelect}
            />
        </View>

        <View style={styles.footer}>
            <View style={styles.coordsBox}>
            <Ionicons name="location" size={16} color={theme.colors.accent} />
            <Text style={styles.coordsText}>
                {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
            </Text>
            </View>

            <Pressable
            onPress={() => setUseMyLocation(true)}
            disabled={locLoading}
            style={styles.actionBtn}
            >
            {locLoading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                style={styles.gradientBtn}
                >
                <Ionicons name="navigate" size={18} color="white" />
                <Text style={styles.btnText}>Mi ubicación</Text>
                </LinearGradient>
            )}
            </Pressable>

            <Pressable onPress={handleConfirm} style={styles.actionBtn}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.gradientBtn}
            >
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.btnText}>Confirmar</Text>
            </LinearGradient>
            </Pressable>
        </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: theme.colors.primary,
    },
    backButton: {
        padding: 8,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    spacer: {
        width: 40,
    },
    mapContainer: {
        flex: 1,
    },
    footer: {
        padding: 16,
        gap: 10,
        backgroundColor: theme.colors.card,
    },
    coordsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
    },
    coordsText: {
        color: theme.colors.text,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    actionBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    gradientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
    },
    btnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
});
