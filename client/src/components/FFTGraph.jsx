import React from 'react';
import { Line } from 'react-chartjs-2';

const FFTGraph = ({ fftData }) => {
  const data = {
    labels: Array.from({ length: fftData.length / 2 }, (_, i) => i),
    datasets: [
      {
        label: 'FFT',
        data: fftData.slice(0, fftData.length / 2),
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <h2>FFT Graph</h2>
      <Line data={data} />
    </div>
  );
};

export default FFTGraph;
