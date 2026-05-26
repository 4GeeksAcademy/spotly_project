import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

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

  const { store, dispatch } = useGlobalReducer();

  const [userPosition, setUserPosition] = useState(null);

  const [myImages, setMyImages] = useState([]);

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/upload", {
        method: "POST",
        body: formData
      })
      const data = await response.json();
      uploadedUrls.push(data);
    }
    setMyImages((prev) => [...prev, ...uploadedUrls]);
  };


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
    <div className="min-h-screen bg-gray-100 flex justify-center p-4 sm:p-6 md:p-10">

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-[1400px] border border-gray-200">

        <div className="p-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Crear Spot
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Comparte tu ubicación y una foto
          </p>
        </div>

        <div className="p-4">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <div
              className="w-full"
              style={{
                height: "clamp(300px, 50vh, 600px)"
              }}
            >
              <MapContainer
                center={userPosition || [20.6767, -101.3563]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={userPosition || [20.6767, -101.3563]}
                >
                  <Popup>
                    Tu ubicación
                  </Popup>
                </Marker>

              </MapContainer>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">

          <input
            type="text"
            placeholder="Nombre del spot"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />

          <textarea
            placeholder="Describe este lugar..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black resize-none h-24"
          />

          <label className="block">
            <span className="text-sm text-gray-600">
              Subir fotos
            </span>

            <input
              type="file"
              multiple
              onChange={uploadImages}
              className="mt-2 block w-full text-sm text-gray-600"
            />
            {myImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {myImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`foto ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                ))}
              </div>
            )}
          </label>

          <button
            className="w-full text-white py-3 rounded-full font-semibold transition shadow-lg hover:scale-[1.01] hover:opacity-95 active:scale-[0.99]"
            style={{ backgroundColor: "#ff5a5f" }}
          >
            Crear Spot
          </button>

        </div>

      </div>

    </div>
  );
};