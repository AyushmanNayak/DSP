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
              // [Other cases omitted for brevity]
              default:
                return;
            }

            if (effectNode) {
              effectChain.chain(effectNode);
              effectChain = effectNode;
            }
          });

          const recorder = new Tone.Recorder();
          effectChain.connect(recorder);
          setRecorder(recorder);
          
          // Start recording and playing the audio
          await recorder.start();
          player.start();
          
          // Stop recording after a delay (duration of the audio)
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
            setProcessedAudioUrl(uploadRes.data.signed_url); // Assuming the URL is returned in the response

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
