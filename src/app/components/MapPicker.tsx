"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
    value?: string;
    onChange: (coords: string) => void;
}

const ICON_URL = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const ICON_2X = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const SHADOW_URL = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];
const DEFAULT_ZOOM = 13;

function parseCoords(raw?: string): [number, number] | null {
    if (!raw) return null;
    const [a, b] = raw.split(",").map((s) => parseFloat(s.trim()));
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    if (Math.abs(a) > 90 || Math.abs(b) > 180) return null;
    return [a, b];
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const resizeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    // stable callback ref so the effect doesn't re-run
    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    const emitCoords = useCallback((lat: number, lng: number) => {
        onChangeRef.current(`${lat.toFixed(6)},${lng.toFixed(6)}`);
    }, []);

    /* ── single mount / unmount ── */
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const mod = await import("leaflet");
                const L = (mod as any).default ?? mod;
                if (cancelled || !containerRef.current) return;

                // fix default marker icons in bundlers
                L.Icon.Default.mergeOptions({
                    iconUrl: ICON_URL,
                    iconRetinaUrl: ICON_2X,
                    shadowUrl: SHADOW_URL,
                });

                const start = parseCoords(value) ?? DEFAULT_CENTER;

                const map = L.map(containerRef.current, {
                    center: start,
                    zoom: DEFAULT_ZOOM,
                    zoomControl: true,
                    scrollWheelZoom: true,
                    dragging: true,
                    touchZoom: true,
                    doubleClickZoom: true,
                });
                mapInstance.current = map;

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "&copy; OpenStreetMap contributors",
                    maxZoom: 19,
                }).addTo(map);

                const marker = L.marker(start, { draggable: true }).addTo(map);
                markerInstance.current = marker;

                marker.on("dragend", () => {
                    const { lat, lng } = marker.getLatLng();
                    emitCoords(lat, lng);
                });

                map.on("click", (e: any) => {
                    const { lat, lng } = e.latlng;
                    marker.setLatLng([lat, lng]);
                    emitCoords(lat, lng);
                });

                // emit initial coords
                emitCoords(start[0], start[1]);

                // responsive: debounced invalidateSize on window resize
                const onResize = () => {
                    clearTimeout(resizeTimer.current);
                    resizeTimer.current = setTimeout(() => {
                        if (mapInstance.current?._container && mapInstance.current._loaded) {
                            mapInstance.current.invalidateSize();
                        }
                    }, 150);
                };
                window.addEventListener("resize", onResize);

                // initial size fix after first paint
                requestAnimationFrame(() => {
                    if (mapInstance.current?._container) {
                        mapInstance.current.invalidateSize();
                    }
                });

                // store for cleanup
                (map as any).__onResize = onResize;
            } catch (err) {
                if (cancelled) return;
                console.error("[MapPicker]", err);
                setError("Map failed to load — please refresh the page.");
            }
        })();

        return () => {
            cancelled = true;
            clearTimeout(resizeTimer.current);

            const map = mapInstance.current;
            if (map) {
                if ((map as any).__onResize) {
                    window.removeEventListener("resize", (map as any).__onResize);
                }
                map.remove();
            }
            mapInstance.current = null;
            markerInstance.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // mount once — never re-create

    return (
        <div className="map-picker">
            <div
                ref={containerRef}
                className="map-container"
                role="application"
                aria-label="Interactive map — click or drag the pin to choose a location"
            />
            {error && <p className="error-message" role="alert">{error}</p>}
            <p className="map-hint">
                Click or drag the pin to set the exact location. Uses free OpenStreetMap tiles.
            </p>
        </div>
    );
}
