import React, { useRef, useEffect } from 'react';
import * as Tone from 'tone';

const AudioPlayer = ({ audioBuffer, selectedEffects }) => {
  const playerRef = useRef();

  useEffect(() => {
    if (playerRef.current && audioBuffer) {
      const player = new Tone.Player(audioBuffer).toDestination();

      // Apply effects to the player
      selectedEffects.forEach(effect => {
        let effectNode;
        switch (effect) {
          case 'reverb':
            effectNode = new Tone.Reverb().toDestination();
            break;
          case 'delay':
            effectNode = new Tone.FeedbackDelay().toDestination();
            break;
          case 'filter':
            effectNode = new Tone.Filter().toDestination();
            break;
          default:
            break;
        }
        if (effectNode) {
          player.connect(effectNode);
        }
      });

      playerRef.current = player;
    }
  }, [audioBuffer, selectedEffects]);

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.start();
    }
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
  };

  return (
    <div>
      <h2>Audio Player</h2>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
};

export default AudioPlayer;
