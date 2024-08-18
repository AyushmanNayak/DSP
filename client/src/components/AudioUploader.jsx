import React, { useState } from 'react';
import * as Tone from 'tone';
import axios from 'axios';
import lamejs from 'lamejs';

const AudioUploader = ({ setAudioBuffer, selectedEffects }) => {
  const [file, setFile] = useState(null);
  const [audioBuffer, setAudioBufferState] = useState(null);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);

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
          console.log('Array buffer:', arrayBuffer);

          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const channelData = [];
          for (let i = 0; i < decodedAudioBuffer.numberOfChannels; i++) {
            channelData.push(decodedAudioBuffer.getChannelData(i));
          }

          const toneAudioBuffer = Tone.ToneAudioBuffer.fromArray(channelData);
          console.log('Decoded ToneAudioBuffer:', toneAudioBuffer);

          const player = new Tone.Player(toneAudioBuffer);

          let effectChain = player;
          selectedEffects.forEach(effect => {
            let effectNode;
            switch (effect) {
              case 'reverb':
                effectNode = new Tone.Reverb({ decay: 1.5, preDelay: 0.01 });
                console.log('Applying reverb effect');
                break;
              case 'delay':
                effectNode = new Tone.FeedbackDelay("4n", 0.5);
                console.log('Applying delay effect');
                break;
              case 'filterLowPass':
                effectNode = new Tone.Filter({ frequency: 1000, type: 'lowpass' });
                console.log('Applying low-pass filter effect');
                break;
              case 'filterHighPass':
                effectNode = new Tone.Filter({ frequency: 1000, type: 'highpass' });
                console.log('Applying high-pass filter effect');
                break;
              case 'chorus':
                effectNode = new Tone.Chorus({ rate: 1.5, depth: 0.7 });
                console.log('Applying chorus effect');
                break;
              case 'distortion':
                effectNode = new Tone.Distortion({ distortion: 0.5 });
                console.log('Applying distortion effect');
                break;
              case 'phaser':
                effectNode = new Tone.Phaser({ frequency: 0.5, octaves: 2, stages: 8 });
                console.log('Applying phaser effect');
                break;
              case 'pingPongDelay':
                effectNode = new Tone.PingPongDelay({ delayTime: "4n", feedback: 0.5 });
                console.log('Applying ping pong delay effect');
                break;
              case 'autoWah':
                effectNode = new Tone.AutoWah({ baseFrequency: 400, octaves: 6, Q: 1, gain: 1 });
                console.log('Applying autoWah effect');
                break;
              case 'bitCrusher':
                effectNode = new Tone.BitCrusher({ bits: 4 });
                console.log('Applying bitCrusher effect');
                break;
              case 'chebyshev':
                effectNode = new Tone.Chebyshev({ order: 50 });
                console.log('Applying chebyshev effect');
                break;
              case 'convolver':
                effectNode = new Tone.Convolver();
                console.log('Applying convolver effect');
                break;
              case 'pitchShift':
                effectNode = new Tone.PitchShift({ pitch: 4 });
                console.log('Applying pitchShift effect');
                break;
              case 'tremolo':
                effectNode = new Tone.Tremolo({ frequency: 4, depth: 0.5 }).start();
                console.log('Applying tremolo effect');
                break;
              case 'vibrato':
                effectNode = new Tone.Vibrato({ frequency: 5, depth: 0.5 });
                console.log('Applying vibrato effect');
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
          const wavArrayBuffer = await wavBlob.arrayBuffer();

          const wavView = new DataView(wavArrayBuffer);
          const wavHeader = lamejs.WavHeader.readHeader(wavView);
          const wavSamples = new Int16Array(wavArrayBuffer, wavHeader.dataOffset, wavHeader.dataLen / 2);

          const mp3Blob = wavToMp3(wavHeader.channels, wavHeader.sampleRate, wavSamples);

          const mp3FormData = new FormData();
          mp3FormData.append('audiofile', mp3Blob, 'processed-audio.mp3');
          await axios.post(`http://localhost:5000/upload`, mp3FormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log("Processed audio uploaded");

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

  const audioBufferToWav = (aBuffer) => {
    let numOfChan = aBuffer.numberOfChannels,
        btwLength = aBuffer.length * numOfChan * 2 + 44,
        btwArrBuff = new ArrayBuffer(btwLength),
        btwView = new DataView(btwArrBuff),
        btwChnls = [],
        btwIndex,
        btwSample,
        btwOffset = 0,
        btwPos = 0;
    setUint32(0x46464952); // "RIFF"
    setUint32(btwLength - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(aBuffer.sampleRate);
    setUint32(aBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(btwLength - btwPos - 4); // chunk length

    for (btwIndex = 0; btwIndex < aBuffer.numberOfChannels; btwIndex++)
        btwChnls.push(aBuffer.getChannelData(btwIndex));

    while (btwPos < btwLength) {
        for (btwIndex = 0; btwIndex < numOfChan; btwIndex++) {
            btwSample = Math.max(-1, Math.min(1, btwChnls[btwIndex][btwOffset])); // clamp
            btwSample = (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
            btwView.setInt16(btwPos, btwSample, true); // write 16-bit sample
            btwPos += 2;
        }
        btwOffset++; // next source sample
    }

    function setUint16(data) {
        btwView.setUint16(btwPos, data, true);
        btwPos += 2;
    }

    function setUint32(data) {
        btwView.setUint32(btwPos, data, true);
        btwPos += 4;
    }

    return btwArrBuff;
  };
  const wavToMp3 = (channels, sampleRate, samples) => {
    const buffer = [];
    const mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 256); // Ensure sampleRate is correct
  
    const samplesPerFrame = 1152;
    let remaining = samples.length;
    console.log(remaining);
    for (let i = 0; i < samples.length; i += samplesPerFrame) {
      const left = samples.subarray(i, i + samplesPerFrame);
      let right = null;
  
      if (channels === 2) {
        right = samples.subarray(i, i + samplesPerFrame);
      }
  
      const mp3buf = mp3enc.encodeBuffer(left, right);
      if (mp3buf.length > 0) {
        buffer.push(mp3buf);
      }
  
      remaining -= samplesPerFrame;
    }
  
    const d = mp3enc.flush();
    if (d.length > 0) {
      buffer.push(d);
    }
  
    return new Blob(buffer, { type: 'audio/mp3' });
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

  const handleStop = () => {
    if (!player) {
      console.log("No player available to stop");
      return;
    }
    player.stop();
    console.log('Player stopped');
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Process</button>
      {error && <p>Error: {error.message}</p>}
      {audioBuffer &&
        <>
          <button onClick={handlePlay}>Play</button>
          <button onClick={handleStop}>Stop</button>
        </>
      }
    </div>
  );
};

export default AudioUploader;
