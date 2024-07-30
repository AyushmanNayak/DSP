import React, { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import EffectsList from './components/EffectsList';
import AudioPlayer from './components/AudioPlayer';
import FFTGraph from './components/FFTGraph';
import './App.css';

function App() {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [fftData, setFftData] = useState(null);
  const [selectedEffects, setSelectedEffects] = useState([]);

  return (
    <div className="App">
      <h1>Audio DSP Playground</h1>
      <AudioUploader setAudioBuffer={setAudioBuffer} setFftData={setFftData} selectedEffects={selectedEffects} />
      <EffectsList selectedEffects={selectedEffects} setSelectedEffects={setSelectedEffects} />
      {audioBuffer && <AudioPlayer audioBuffer={audioBuffer} selectedEffects={selectedEffects} />}
      {/* {fftData && <FFTGraph fftData={fftData} />} */} 
      
    </div>
  );
}

export default App;
