import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import { useEffect, useState } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});



export const SpotPage = () => {

  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
  const watcher = navigator.geolocation.watchPosition(
    (position) => {
      setUserPosition([
        position.coords.latitude,
        position.coords.longitude,
      ]);
    }
  );

  return () => navigator.geolocation.clearWatch(watcher);
}, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-md">

      <div style={{ height: "300px", width: "100%" }}>
        <MapContainer
          center={[20.6767, -101.3563]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[20.6767, -101.3563]}>
            <Popup>
              Spot en Irapuato
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold">
          Mi Spot
        </h2>

        <p className="text-gray-600">
          Ubicación en tiempo real
        </p>
      </div>

    </div>
  );
};