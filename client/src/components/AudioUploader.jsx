import React, { useState } from 'react';
import * as Tone from 'tone';
import axios from 'axios';

const AudioUploader = ({ setAudioBuffer, selectedEffects }) => {
  const [file, setFile] = useState(null);
  const [audioBuffer, setAudioBufferState] = useState(null);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile.type === 'audio/mpeg') {
      setFile(selectedFile);
    } else {
      alert("Only .mp3 files allowed");
      setFile(null);
      setError('Only MP3 files are allowed.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.log("No file selected");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append('audiofile', file);

    try {
      const res = await axios.post(`http://localhost:5000/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("File uploaded", res.data);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const channelData = [];
          for (let i = 0; i < decodedAudioBuffer.numberOfChannels; i++) {
            channelData.push(decodedAudioBuffer.getChannelData(i));
          }

          const toneAudioBuffer = Tone.ToneAudioBuffer.fromArray(channelData);
          const player = new Tone.Player(toneAudioBuffer).toDestination();

          let effectChain = player;
          selectedEffects.forEach(effect => {
            let effectNode;
            switch (effect) {
              case 'reverb':
                effectNode = new Tone.Reverb({ decay: 1.5, preDelay: 0.01 });
                break;
              case 'delay':
                effectNode = new Tone.FeedbackDelay("4n", 0.5);
                break;
              case 'filterLowPass':
                effectNode = new Tone.Filter({ frequency: 1000, type: 'lowpass' });
                break;
              case 'filterHighPass':
                effectNode = new Tone.Filter({ frequency: 1000, type: 'highpass' });
                break;
              case 'chorus':
                effectNode = new Tone.Chorus({ rate: 1.5, depth: 0.7 });
                break;
              case 'distortion':
                effectNode = new Tone.Distortion({ distortion: 0.5 });
                break;
              case 'phaser':
                effectNode = new Tone.Phaser({ frequency: 0.5, octaves: 2, stages: 8 });
                break;
              case 'pingPongDelay':
                effectNode = new Tone.PingPongDelay({ delayTime: "4n", feedback: 0.5 });
                break;
              case 'autoWah':
                effectNode = new Tone.AutoWah({ baseFrequency: 400, octaves: 6, Q: 1, gain: 1 });
                break;
              case 'bitCrusher':
                effectNode = new Tone.BitCrusher({ bits: 4 });
                break;
              case 'chebyshev':
                effectNode = new Tone.Chebyshev({ order: 50 });
                break;
              case 'convolver':
                effectNode = new Tone.Convolver();
                break;
              case 'pitchShift':
                effectNode = new Tone.PitchShift({ pitch: 4 });
                break;
              case 'tremolo':
                effectNode = new Tone.Tremolo({ frequency: 4, depth: 0.5 }).start();
                break;
              case 'vibrato':
                effectNode = new Tone.Vibrato({ frequency: 5, depth: 0.5 });
                break;
              default:
                return;
            }

            if (effectNode) {
              effectChain.chain(effectNode);
              effectChain = effectNode;
            }
          });
  
          effectChain.toDestination();
  
          setAudioBufferState(toneAudioBuffer);
          setAudioBuffer(toneAudioBuffer);
          setPlayer(player);
  
          const wavData = audioBufferToWav(decodedAudioBuffer);
          const wavBlob = new Blob([wavData], { type: 'audio/wav' });
  
          const wavFormData = new FormData();
          wavFormData.append('audiofile', wavBlob, 'processed-audio.wav');
  
          await axios.post(`http://localhost:5000/upload`, wavFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
          console.log("Processed WAV audio uploaded");
  
        } catch (error) {
          console.error('Error during file processing:', error);
          setError(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.log("Error occurred", err);
      setError(err);
    }
  };

  const audioBufferToWav = (audioBuffer) => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    let offset = 0;

    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, 36 + audioBuffer.length * numOfChannels * 2, true); offset += 4;
    writeString(view, offset, 'WAVE'); offset += 4;
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numOfChannels, true); offset += 2;
    view.setUint32(offset, audioBuffer.sampleRate, true); offset += 4;
    view.setUint32(offset, audioBuffer.sampleRate * 4, true); offset += 4;
    view.setUint16(offset, numOfChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, audioBuffer.length * numOfChannels * 2, true); offset += 4;

    const channels = [];
    for (let i = 0; i < numOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    let pos = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            pos += 2;
        }
    }

    return new Uint8Array(buffer);  // Return a Uint8Array instead of ArrayBuffer
  };

  const handlePlay = () => {
    if (player) {
      player.start();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (player) {
      player.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".mp3" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {error && <div>Error: {error.message}</div>}
      <div>
        <button onClick={handlePlay} disabled={isPlaying}>Play</button>
        <button onClick={handleStop} disabled={!isPlaying}>Stop</button>
      </div>
    </div>
  );
};

export default AudioUploader;
