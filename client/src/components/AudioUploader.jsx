import React, { useState } from 'react';
import * as Tone from 'tone';

const AudioUploader = ({ setAudioBuffer, selectedEffects }) => {
  const [file, setFile] = useState(null);
  const [audioBuffer, setLocalAudioBuffer] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    console.log('Reading file...');
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        console.log('File read, decoding audio data...');
        const decodedAudioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
        console.log('Audio data decoded:', decodedAudioBuffer);

        // Create an offline context with the same sample rate
        const offlineContext = new OfflineAudioContext(decodedAudioBuffer.numberOfChannels, decodedAudioBuffer.length, decodedAudioBuffer.sampleRate);
        const source = offlineContext.createBufferSource();
        source.buffer = decodedAudioBuffer;

        let lastNode = source;

        // Apply selected effects using native Web Audio API nodes
        selectedEffects.forEach(effect => {
          let effectNode;
          switch (effect) {
            case 'reverb':
              effectNode = offlineContext.createConvolver();
              console.log('Applying reverb effect');
              break;
            case 'delay':
              effectNode = offlineContext.createDelay();
              console.log('Applying delay effect');
              break;
            case 'filter':
              effectNode = offlineContext.createBiquadFilter();
              console.log('Applying filter effect');
              break;
              case 'distortion':
                effectNode = offlineContext.createPanner();
                console.log('Applying panner effect');
                break;
            default:
              break;
          }
          if (effectNode) {
            lastNode.connect(effectNode);
            lastNode = effectNode;
            console.log(`Effect ${effect} applied`);
          }
        });

        lastNode.connect(offlineContext.destination);
        console.log('All nodes connected, starting offline rendering...');
        source.start(0);

        // Render the audio
        const renderedBuffer = await offlineContext.startRendering();
        console.log('Audio rendering completed:', renderedBuffer);
        setLocalAudioBuffer(renderedBuffer);
        setAudioBuffer(renderedBuffer);
      } catch (error) {
        console.error('Error during file processing:', error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handlePlay = () => {
    if (!audioBuffer) {
      console.log('No audio buffer available for playback');
      return;
    }

    console.log('Playing audio...');
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(0);
    console.log('Audio playback started');
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Process</button>
      <button onClick={handlePlay}>Play</button>
    </div>
  );
};

export default AudioUploader;
