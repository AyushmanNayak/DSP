import React from 'react';

const EffectsList = ({ selectedEffects, setSelectedEffects }) => {
  const handleEffectChange = (effect) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  const effects = [
    'reverb', 'delay', 'filterLowPass', 'filterHighPass',
    'chorus', 'distortion', 'pingPongDelay', 'phaser',
    'autoWah', 'bitCrusher', 'chebyshev', 'pitchShift',
    'tremolo', 'vibrato'
  ];

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Effects</h2>
      <div className="grid grid-cols-2 gap-4">
        {effects.map(effect => (
          <label key={effect} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedEffects.includes(effect)}
              onChange={() => handleEffectChange(effect)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded-md focus:ring-0"
            />
            <span className="text-sm">{effect.charAt(0).toUpperCase() + effect.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default EffectsList;
