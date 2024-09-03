import React, { useState } from 'react';
import * as Tone from 'tone';
import axios from 'axios';

const AudioUploader = ({ setAudioBuffer, selectedEffects }) => {
  const [file, setFile] = useState(null);
  const [audioBuffer, setAudioBufferState] = useState(null);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState(null);

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
              // [Add all effect cases here, similar to your existing code]
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

             // Chain the effect to the current node and update the current node
             if (effectNode) {
              effectChain.connect(effectNode);
              effectChain = effectNode;
            }
          });

          // Connect the last effect in the chain to the destination
          effectChain.toDestination();

          // Setup recorder
          const recorder = new Tone.Recorder();
          effectChain.connect(recorder);

          // Start recording and playing the audio
          await recorder.start();
          player.start();

          // Stop recording after the duration of the audio
          setTimeout(async () => {
            const recordedAudio = await recorder.stop();
            const blob = new Blob([recordedAudio], { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audiofile', blob, 'processed-audio.wav');

            // Upload the recorded audio and get the URL back
            const uploadRes = await axios.post('http://localhost:5000/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log("Processed audio uploaded");
            setProcessedAudioUrl(uploadRes.data.signed_url);

          }, toneAudioBuffer.duration * 1000);

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

  return (
    <div>
      <input type="file" accept=".mp3" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {error && <div>Error: {error.message}</div>}
      
      {processedAudioUrl && (
        <div>
          <a href={processedAudioUrl} download="processed-audio.wav">
            Download Processed Audio
          </a>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
