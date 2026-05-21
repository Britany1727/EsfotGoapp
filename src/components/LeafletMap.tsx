import { WebView } from 'react-native-webview';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRef, useState } from 'react';

interface LeafletMapProps {
    centerLat: number;
    centerLng: number;
    markerLat?: number;
    markerLng?: number;
    userLat?: number;
    userLng?: number;
    selectable?: boolean;
    onLocationSelect?: (lat: number, lng: number) => void;
    zoom?: number;
    style?: any;
    distanceMeters?: number | null;
    lugarName?: string;
}

export function LeafletMap({
    centerLat,
    centerLng,
    markerLat,
    markerLng,
    userLat,
    userLng,
    selectable = false,
    onLocationSelect,
    zoom = 15,
    style,
    distanceMeters,
    lugarName,
    }: LeafletMapProps) {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);

    const mlat = markerLat ?? centerLat;
    const mlng = markerLng ?? centerLng;

    const popupContent = (() => {
        if (selectable) return 'Arrastra para ajustar';
        const name = lugarName ?? 'Ubicación del Lugar';
        let html = `📍 ${name}`;
        if (distanceMeters !== undefined && distanceMeters !== null) {
            const d = distanceMeters < 1000
                ? `${distanceMeters} m`
                : `${(distanceMeters / 1000).toFixed(1)} km`;
            html += `<br/><span style="font-size:13px;color:#38bdf8;">Distancia: ${d}</span>`;
        }
        return html;
    })();

    const escapedPopup = popupContent.replace(/`/g, '\\`').replace(/\${/g, '\\${');

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { margin: 0; padding: 0; }
            html, body { height: 100%; width: 100%; }
            #map { height: 100%; width: 100%; }
        </style>
        </head>
        <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoom});

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            var platoMarker = L.marker([${mlat}, ${mlng}], {
            draggable: ${selectable}
            }).addTo(map);

            platoMarker.bindPopup('${escapedPopup}').openPopup();

            ${selectable ? `
            function sendCoords(lat, lng) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
            }
            }

            map.on('click', function(e) {
            platoMarker.setLatLng(e.latlng);
            sendCoords(e.latlng.lat, e.latlng.lng);
            });

            platoMarker.on('dragend', function(e) {
            var pos = e.target.getLatLng();
            sendCoords(pos.lat, pos.lng);
            });

            sendCoords(${mlat}, ${mlng});
            ` : ''}

            ${(userLat !== undefined && userLng !== undefined && userLat !== null && userLng !== null) ? `
            var userMarker = L.circleMarker([${userLat}, ${userLng}], {
            color: '#3b82f6',
            radius: 8,
            fillColor: '#60a5fa',
            fillOpacity: 0.8
            }).addTo(map);
            userMarker.bindPopup('Tu ubicación');

            var line = L.polyline([[${userLat}, ${userLng}], [${mlat}, ${mlng}]], {
            color: '#ef4444',
            weight: 2,
            dashArray: '8, 8'
            }).addTo(map);

            map.fitBounds(line.getBounds(), { padding: [50, 50] });
            ` : ''}
        </script>
        </body>
        </html>
    `;

    return (
        <View style={[styles.container, style]}>
        {loading && (
            <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#2563EB"
            />
        )}
        <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.webview}
            onLoad={() => setLoading(false)}
            onMessage={selectable ? (event) => {
            try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.lat !== undefined && data.lng !== undefined) {
                onLocationSelect?.(data.lat, data.lng);
                }
            } catch {}
            } : undefined}
            javaScriptEnabled
            domStorageEnabled
        />
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 12,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
});
