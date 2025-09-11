import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as THREE from "three";
import gsap from "gsap";

function EnergyDashboard() {
  const [data, setData] = useState(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  // 🌍 Fetch energy data using geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          axios
            .get(
              `https://sustainability-5oz0.onrender.com/api/energy?lat=${latitude}&lon=${longitude}`
            )
            .then((res) => setData(res.data))
            .catch((err) => console.error("❌ Energy fetch error:", err));
        },
        (err) => console.error("Geolocation error:", err)
      );
    } else {
      console.error("Geolocation not supported");
    }
  }, []);

  // 🎨 Setup Three.js background
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      roughness: 0.5,
      metalness: 0.3,
    });

    const spheres = [];
    for (let i = 0; i < 10; i++) {
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
      scene.add(sphere);
      spheres.push(sphere);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      spheres.forEach((s, i) => {
        s.rotation.x += 0.005;
        s.rotation.y += 0.005;
        s.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // ✨ Animate cards when data loads
  useEffect(() => {
    if (data) {
      gsap.fromTo(
        ".card",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100"
    >
      <div className="absolute z-10 w-full max-w-lg p-6">
        <h2 className="text-3xl font-bold text-emerald-700 mb-8 text-center">
          🔋 Renewable Energy Dashboard
        </h2>

        {data ? (
          <div className="grid gap-6">
            <div className="card bg-white rounded-2xl shadow-lg p-6 backdrop-blur-md hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">Solar Generation</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {data.solar_kw} kW
              </p>
            </div>
            <div className="card bg-white rounded-2xl shadow-lg p-6 backdrop-blur-md hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">Usage</p>
              <p className="text-2xl font-semibold text-amber-600">
                {data.usage_kw} kW
              </p>
            </div>
            <div className="card bg-white rounded-2xl shadow-lg p-6 backdrop-blur-md hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">CO₂ Saved</p>
              <p className="text-2xl font-semibold text-green-600">
                {data.co2_saved} kg
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 animate-pulse">
            Loading energy data...
          </p>
        )}
      </div>
    </div>
  );
}

export default EnergyDashboard;
