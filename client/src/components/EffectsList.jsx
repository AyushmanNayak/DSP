import React from 'react';

const EffectsList = ({ selectedEffects, setSelectedEffects }) => {
  const handleEffectChange = (effect) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  const effects = [
    'reverb', 'delay', 'filterLowPass', 'filterHighPass'
    , 'chorus', 'distortion', 'pingPongDelay', 'phaser', 
    'autoWah', 'bitCrusher', 'chebyshev', 'convolver', 'wet', 'pitchShift',
    'tremolo', 'vibrato'
  ];

  return (
    <div>
      <h2>Effects</h2>
      {effects.map(effect => (
        <label key={effect}>
          <input
            type="checkbox"
            checked={selectedEffects.includes(effect)}
            onChange={() => handleEffectChange(effect)}
          />
          {effect.charAt(0).toUpperCase() + effect.slice(1)}
        </label>
      ))}
    </div>
  );
};

export default EffectsList;
