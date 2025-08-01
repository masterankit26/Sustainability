import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function MapPicker({ onSubmit }) {
  const [latValue, setLatValue] = useState('');
  const [lonValue, setLonValue] = useState('');
  const [latDir, setLatDir] = useState('N');
  const [lonDir, setLonDir] = useState('E');
  const boxRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      boxRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
    );
  }, []);

  const handleSubmit = () => {
    const latRaw = parseFloat(latValue);
    const lonRaw = parseFloat(lonValue);

    if (isNaN(latRaw) || isNaN(lonRaw)) {
      alert('❗Please enter valid numeric coordinates.');
      return;
    }

    const lat = latDir === 'S' ? -Math.abs(latRaw) : Math.abs(latRaw);
    const lon = lonDir === 'W' ? -Math.abs(lonRaw) : Math.abs(lonRaw);

    // 👉 No display, no log, just internal pass
    typeof onSubmit === 'function' && onSubmit({ lat, lon });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawLat = position.coords.latitude;
        const rawLon = position.coords.longitude;

        setLatValue(Math.abs(rawLat).toFixed(5));
        setLonValue(Math.abs(rawLon).toFixed(5));
        setLatDir(rawLat >= 0 ? 'N' : 'S');
        setLonDir(rawLon >= 0 ? 'E' : 'W');

        // 👉 Still no output, just silent handoff
        typeof onSubmit === 'function' && onSubmit({ lat: rawLat, lon: rawLon });
      },
      () => {
        alert('❌ Unable to retrieve your location.');
      }
    );
  };

  return (
    <div
      ref={boxRef}
      className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 mt-6 border border-green-100"
    >
      <h3 className="text-xl font-bold text-green-700 mb-4">📍 Select Farm Location</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Latitude</label>
          <input
            type="text"
            value={latValue}
            onChange={(e) => setLatValue(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="e.g. 22.5726"
          />
          <select
            value={latDir}
            onChange={(e) => setLatDir(e.target.value)}
            className="mt-2 w-full border rounded px-2 py-1"
          >
            <option value="N">North</option>
            <option value="S">South</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Longitude</label>
          <input
            type="text"
            value={lonValue}
            onChange={(e) => setLonValue(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="e.g. 88.3639"
          />
          <select
            value={lonDir}
            onChange={(e) => setLonDir(e.target.value)}
            className="mt-2 w-full border rounded px-2 py-1"
          >
            <option value="E">East</option>
            <option value="W">West</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Submit Coordinates
        </button>
        <button
          onClick={handleUseLocation}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition"
        >
          📡 Use My Current Location
        </button>
      </div>
    </div>
  );
}

export default MapPicker;