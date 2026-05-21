import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapView } from '../../src/components/MapView';

export default function MapaView() {
    const router = useRouter();
    const params = useLocalSearchParams<{ lat: string; lng: string; name?: string }>();

    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);

    if (isNaN(lat) || isNaN(lng)) {
        return null;
    }

    return (
        <MapView
        lugarLat={lat}
        lugarLng={lng}
        lugarName={params.name}
        onClose={() => router.back()}
        />
    );
}
