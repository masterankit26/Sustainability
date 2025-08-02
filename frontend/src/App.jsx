import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MapPicker from './components/MapPicker';
import InsightPanel from './components/InsightPanel';
import SensorChart from './components/SensorChart';
import WeatherTimeline from './components/WeatherTimeline';
import IrrigationAdvisor from './components/IrrigationAdvisor';
import SetupGuide from './components/SetupGuide';
import SmartIrrigationOverview from './components/SmartIrrigationOverview';

function App() {
  const [location, setLocation] = useState({ lat: null, lon: null });

  const isValid = (val) => typeof val === 'number' && !isNaN(val);
  const isLocationValid = isValid(location.lat) && isValid(location.lon);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <Navbar />
      <MapPicker onSubmit={setLocation} />
      <SetupGuide />

      {isLocationValid && (
        <>
          <IrrigationAdvisor
            areaSize={500}             // m²
            environment={location}
            location={location}        // For weather fetch if needed
          />
          <InsightPanel location={location} />
          <SensorChart location={location} />
          <WeatherTimeline location={location} />
          
          <SmartIrrigationOverview />
        
        </>
      )}
    </div>
  );
}

export default App;
