import React, { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import EffectsList from './components/EffectsList';
import FFTGraph from './components/FFTGraph';
import './App.css';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function App() {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [fftData, setFftData] = useState(null);
  const [selectedEffects, setSelectedEffects] = useState([]);

  return (
    <div className="App">
      <h1>Audio DSP Playground</h1>
      
      {/* Authentication handling */}
      {/* <SignedIn>
        <UserButton /> */}
        <AudioUploader setAudioBuffer={setAudioBuffer} setFftData={setFftData} selectedEffects={selectedEffects} />
        <EffectsList selectedEffects={selectedEffects} setSelectedEffects={setSelectedEffects} />
        {/* {audioBuffer && <AudioPlayer audioBuffer={audioBuffer} selectedEffects={selectedEffects} />} */}
        {/* {fftData && <FFTGraph fftData={fftData} />} */}
        
      {/* </SignedIn> */}
      
      {/* <SignedOut>
        <SignInButton />
      </SignedOut> */}
      
    </div>
  );
}

export default App;
