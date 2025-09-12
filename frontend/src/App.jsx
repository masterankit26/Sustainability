import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MapPicker from './components/MapPicker';
import SimulationTool from './components/SimulationTool';
import InsightPanel from './components/InsightPanel';
import SensorChart from './components/SensorChart';
import EnergyDashboard from "./components/EnergyDashboard";
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

      {isLocationValid ? (
        <div className="space-y-6 px-4 py-6">
          <IrrigationAdvisor
            areaSize={500}
            environment={location}
            location={location}
          />
          <InsightPanel location={location} />
          
          
         
          <SimulationTool location={location} />
           
          <SensorChart location={location} />
          <WeatherTimeline location={location} />
          <EnergyDashboard location={location} />
         
          <SmartIrrigationOverview />
          {/* <ThankYou /> */}
        </div>
      ) : (
        <div className="text-center py-10 text-red-600 font-semibold">
          📍 Please select a valid location to activate smart features.
        </div>
      )}
    </div>
  );
}

export default App;
