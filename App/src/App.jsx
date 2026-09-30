import React, { useState } from 'react';
import './index.css';
import Layout from './components/Layout';
import Screen01 from './screens/Screen01';
import Screen02 from './screens/Screen02';
import Screen03 from './screens/Screen03';
import Screen04 from './screens/Screen04';
import Screen05 from './screens/Screen05';

const STEPS = [
  { id: 'event-district',    num: '01', label: 'Event / District' },
  { id: 'forecast-diagnosis',num: '02', label: 'Forecast Diagnosis' },
  { id: 'before-after',      num: '03', label: 'Before / After' },
  { id: 'district-product',  num: '04', label: 'District Product' },
  { id: 'verification',      num: '05', label: 'Verification' },
];

const SCREENS = {
  'event-district':    Screen01,
  'forecast-diagnosis':Screen02,
  'before-after':      Screen03,
  'district-product':  Screen04,
  'verification':      Screen05,
};

export default function App() {
  const [activeStep, setActiveStep] = useState('event-district');
  const ActiveScreen = SCREENS[activeStep];

  return (
    <Layout steps={STEPS} activeStep={activeStep} onNavigate={setActiveStep}>
      <ActiveScreen onNavigate={setActiveStep} />
    </Layout>
  );
}
