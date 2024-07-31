import React, { useState } from 'react';
import * as Tone from 'tone';

const AudioUploader = ({ setAudioBuffer, selectedEffects }) => {
  const [file, setFile] = useState(null);
  const [audioBuffer, setAudioBufferState] = useState(null);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      console.log("No file selected");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        console.log('Array buffer:', arrayBuffer);

        // Decode the ArrayBuffer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert AudioBuffer to Float32Array
        const channelData = [];
        for (let i = 0; i < decodedAudioBuffer.numberOfChannels; i++) {
          channelData.push(decodedAudioBuffer.getChannelData(i));
        }

        // Create a ToneAudioBuffer from the Float32Array
        const toneAudioBuffer = Tone.ToneAudioBuffer.fromArray(channelData);
        console.log('Decoded ToneAudioBuffer:', toneAudioBuffer);

        // Create a Tone Player
        const player = new Tone.Player(toneAudioBuffer);

        // Apply selected effects and chain them
        let effectChain = player;
        selectedEffects.forEach(effect => {
          let effectNode;
          switch (effect) {
            case 'reverb':
              effectNode = new Tone.Reverb();
              console.log('Applying reverb effect');
              break;
            case 'delay':
              effectNode = new Tone.FeedbackDelay("4n", 0.5);
              console.log('Applying delay effect');
              break;
            case 'filter':
              effectNode = new Tone.Filter();
              console.log('Applying filter effect');
              break;
            case 'chorus':
              effectNode = new Tone.Chorus();
              console.log('Applying chorus effect');
              break;
            case 'distortion':
              effectNode = new Tone.Distortion();
              console.log('Applying distortion effect');
              break;
            case 'phaser':
              effectNode = new Tone.Phaser();
              console.log('Applying phaser effect');
              break;
            case 'pingPongDelay':
              effectNode = new Tone.PingPongDelay();
              console.log('Applying ping pong delay effect');
              break;
            case 'AutoWah':
                effectNode = new Tone.AutoWah();
                console.log('Applying waah waah');
                break;
            default:
              return; // Skip unsupported effects
          }

          if (effectNode) {
            effectChain.chain(effectNode);
            effectChain = effectNode; // Update the effect chain to include the new effect
          }
        });

        // Connect the final output to the destination
        effectChain.toDestination();

        // Update the audio buffer state
        setAudioBufferState(toneAudioBuffer);
        setAudioBuffer(toneAudioBuffer); // Pass the decoded buffer to the parent component
        setPlayer(player); // Save the player instance
        console.log('Audio buffer state after decoding:', toneAudioBuffer);
      } catch (error) {
        console.error('Error during file processing:', error);
        setError(error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handlePlay = () => {
    if (!player) {
      console.log('No player available for playback');
      return;
    }

    console.log('Player in handlePlay:', player);
    player.start();
    console.log('Player started');
  };

  const handleStop= () => {
    if(!player){
      console.log("No player"); return;
    }
    player.stop();
    console.log('Player Stopeed');
  }
 
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Process</button>
      {error && <p>Error: {error.message}</p>}
      {player && 
      <>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handleStop}>Stop</button>
      </>
      }
    </div>
  );
};

export default AudioUploader;
