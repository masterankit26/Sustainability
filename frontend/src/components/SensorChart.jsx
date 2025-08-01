import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler // ✅ Added Filler plugin
} from 'chart.js';
import axios from 'axios';
import { gsap } from 'gsap';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler // ✅ Registered for fill support
);

function SensorChart({ location }) {
  const [dataList, setDataList] = useState([]);
  const chartRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!location?.lat || !location?.lon) return;

    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=soil_moisture_0_1cm&timezone=auto`
      );

      const moistureArray = res.data?.hourly?.soil_moisture_0_1cm;
      const timeArray = res.data?.hourly?.time;

      if (!moistureArray?.length || !timeArray?.length) return;

      const latestIndex = moistureArray.length - 1;
      const moistureRaw = moistureArray[latestIndex];
      const moisture = parseFloat((moistureRaw * 100).toFixed(2));

      const now = new Date();
      const timeLabel = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      setDataList((prev) => [...prev.slice(-11), { time: timeLabel, moisture }]);
    } catch (err) {
      console.error('❌ Soil moisture fetch failed:', err);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  useEffect(() => {
    if (chartRef.current && dataList.length > 0) {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [dataList]);

  const chartData = {
    labels: dataList.map((d) => d.time),
    datasets: [
      {
        label: 'Soil Moisture (%)',
        data: dataList.map((d) => d.moisture),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true, // ✅ Works now with Filler
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    animation: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#065f46',
          font: { size: 14, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: '🌿 Live Soil Moisture Chart',
        font: { size: 18 },
        color: '#047857'
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#4b5563',
          font: { size: 12 }
        }
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
          color: '#4b5563',
          font: { size: 12 }
        },
        title: {
          display: true,
          text: 'Soil Moisture (%)',
          color: '#047857',
          font: { size: 14, weight: 'bold' }
        }
      }
    }
  };

  return (
    <div
      ref={chartRef}
      className="max-w-3xl mx-auto bg-white border border-green-100 shadow-lg rounded-xl p-6 mt-6"
    >
      {dataList.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p className="text-center text-gray-500">⏳ Waiting for live data...</p>
      )}
    </div>
  );
}

export default SensorChart;