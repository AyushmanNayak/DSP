import React from 'react';

const EffectsList = ({ selectedEffects, setSelectedEffects }) => {
  const handleEffectChange = (effect) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  return (
    <div>
      <h2>Effects</h2>
      <label>
        <input type="checkbox" checked={selectedEffects.includes('reverb')} onChange={() => handleEffectChange('reverb')} />
        Reverb
      </label>
      <label>
        <input type="checkbox" checked={selectedEffects.includes('delay')} onChange={() => handleEffectChange('delay')} />
        Delay
      </label>
      <label>
        <input type="checkbox" checked={selectedEffects.includes('filter')} onChange={() => handleEffectChange('filter')} />
        Filter
      </label>
      <label>
        <input type="checkbox" checked={selectedEffects.includes('chorus')} onChange={() => handleEffectChange('chorus')} />
        Chorus
      </label>
      <label>
        <input type="checkbox" checked={selectedEffects.includes('distortion')} onChange={() => handleEffectChange('distortion')} />
        Distortion
      </label>
      <label>
        <input type="checkbox" checked={selectedEffects.includes('pingPongDelay')} onChange={() => handleEffectChange('pingPongDelay')} />
        Ping Pong Delay
      </label>
      <label>
        <input type="checkbox" checked={selectedEffects.includes('phaser')} onChange={() => handleEffectChange('phaser')} />
        Phaser
      </label>

      <label>
        <input type="checkbox" checked={selectedEffects.includes('AutoWah')} onChange={() => handleEffectChange('AutoWah')} />
        AutoWah
      </label>

    </div>
  );
};

export default EffectsList;
