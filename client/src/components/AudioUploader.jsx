import React, { useState } from 'react';
import * as Tone from 'tone';
import axios from 'axios'

//FLOW : UPLOAD AUDIO --> CREATE AN ARRAY BUFFER --> CREATE AN AUDIO CONTEXT --> DECODE THE ARRAY BUFFER AND CONVERT INTO AN AUDIO BUFFER --> CONVERT THE NATIVE AUDIO BUFFER INTO TONE.JS AUDIO BUFFER --> TONE AUDIO BUFFER ([0]--[0])

const AudioUploader = ({ setAudioBuffer, selectedEffects }) => {
  const [file, setFile] = useState(null);
  const [audioBuffer, setAudioBufferState] = useState(null);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile  = e.target.files[0];
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

    //uploading file to s3 :
    const formData = new FormData();
    formData.append('audiofile', file);
    try {
      const res =  await axios.post(`http://localhost:5000/upload`, formData, {
        headers : {
          'Content-Type' : 'multipart/form-data',
        },
      });
      console.log("File uploaded", res.data);
      

      
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        console.log('Array buffer:', arrayBuffer);

        // Decode the ArrayBuffer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        //the audio context is the entry point for usinf the webAudio API. can be used to deconde audio, create audio nodes and yeah, ofc, control processing

        //in this step, we convert the arrayBuffer into an audioBuffer
        const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // An AudioBuffer is a structured representation of audio data that can be processed by the Web Audio API. await is used cuz it is an async operation

        // Convert AudioBuffer to Float32Array
        const channelData = []; //this is to hold the audio data for the left and right channels
        for (let i = 0; i < decodedAudioBuffer.numberOfChannels; i++) {
          channelData.push(decodedAudioBuffer.getChannelData(i));
        }


        //printed channelData for the geeks:
        // console.log("channelData for both the channels");
        // for(let  i = 0; i<channelData.length; i++){
        //   console.log(channelData[i]);
        // }

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
              effectNode = new Tone.Reverb({
                decay: 1.5, // Example parameter for reverb
                preDelay: 0.01
              });
              console.log('Applying reverb effect');
              break;
            case 'delay':
              effectNode = new Tone.FeedbackDelay("4n", 0.5);
              console.log('Applying delay effect');
              break;
            case 'filterLowPass':
              effectNode = new Tone.Filter({
                frequency: 1000, // Example parameter for low-pass filter frequency
                type: 'lowpass'
              });
              console.log('Applying low-pass filter effect');
              break;
            case 'filterHighPass':
              effectNode = new Tone.Filter({
                frequency: 1000, // Example parameter for high-pass filter frequency
                type: 'highpass'
              });
              console.log('Applying high-pass filter effect');
              break;
            case 'chorus':
              effectNode = new Tone.Chorus({
                rate: 1.5, // Example parameter for chorus rate
                depth: 0.7
              });
              console.log('Applying chorus effect');
              break;
            case 'distortion':
              effectNode = new Tone.Distortion({
                distortion: 0.5 // Example parameter for distortion amount
              });
              console.log('Applying distortion effect');
              break;
            case 'phaser':
              effectNode = new Tone.Phaser({
                frequency: 0.5, // Example parameter for phaser frequency
                octaves: 2,
                stages: 8
              });
              console.log('Applying phaser effect');
              break;
            case 'pingPongDelay':
              effectNode = new Tone.PingPongDelay({
                delayTime: "4n", // Example parameter for delay time
                feedback: 0.5
              });
              console.log('Applying ping pong delay effect');
              break;
            case 'autoWah':
              effectNode = new Tone.AutoWah({
                baseFrequency: 400, // Example parameter for base frequency
                octaves: 6,
                Q: 1,
                gain: 1
              });
              console.log('Applying autoWah effect');
              break;
            case 'bitCrusher':
              effectNode = new Tone.BitCrusher({
                bits: 4 // Example parameter for bit depth
              });
              console.log('Applying bitCrusher effect');
              break;
            case 'chebyshev':
              effectNode = new Tone.Chebyshev({
                order: 50 // Example parameter for Chebyshev filter order
              });
              console.log('Applying chebyshev effect');
              break;
            case 'convolver':
              effectNode = new Tone.Convolver({
                // Example: You might need to load an impulse response for convolver
                // This is usually done by setting `effectNode.buffer` to an `AudioBuffer`
              });
              console.log('Applying convolver effect');
              break;
           
            case 'pitchShift':
              effectNode = new Tone.PitchShift({
                pitch: 4 // Example parameter for pitch shift amount in semitones
              });
              console.log('Applying pitchShift effect');
              break;
            case 'tremolo':
              effectNode = new Tone.Tremolo({
                frequency: 4, // Example parameter for tremolo frequency
                depth: 0.5
              }).start();
              console.log('Applying tremolo effect');
              break;
            case 'vibrato':
              effectNode = new Tone.Vibrato({
                frequency: 5, // Example parameter for vibrato frequency
                depth: 0.5
              });
              console.log('Applying vibrato effect');
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
    }
    reader.readAsArrayBuffer(file);
    }


    catch(err) {
      console.log("error occured", error);
    }

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
