import React, { useState } from 'react';
import { jStat } from 'jstat';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DistributionDisplay = () => {
  const [selectedDistribution, setSelectedDistribution] = useState('Normal');
  const [parameters, setParameters] = useState({ mean: 0, stddev: 1, lambda: 1, n: 10, p: 0.5, min: 0, max: 1 });

  const handleDistributionChange = (event) => {
    setSelectedDistribution(event.target.value);
    resetParameters(event.target.value);
  };

  const handleParamChange = (event) => {
    setParameters({ ...parameters, [event.target.name]: parseFloat(event.target.value) });
  };

  const resetParameters = (distribution) => {
    switch (distribution) {
      case 'Normal':
        setParameters({ mean: 0, stddev: 1 });
        break;
      case 'Poisson':
        setParameters({ lambda: 1 });
        break;
      case 'Binomial':
        setParameters({ n: 10, p: 0.5 });
        break;
      case 'Uniform':
        setParameters({ min: 0, max: 1 });
        break;
      default:
        break;
    }
  };

  const generateData = () => {
    let xValues = [];
    let yValues = [];

    switch (selectedDistribution) {
      case 'Normal':
        for (let x = -5; x <= 5; x += 0.1) {
          xValues.push(x);
          yValues.push(jStat.normal.pdf(x, parameters.mean, parameters.stddev));
        }
        break;
      case 'Poisson':
        for (let x = 0; x <= 10; x++) {
          xValues.push(x);
          yValues.push(jStat.poisson.pdf(x, parameters.lambda));
        }
        break;
      case 'Binomial':
        for (let x = 0; x <= parameters.n; x++) {
          xValues.push(x);
          yValues.push(jStat.binomial.pdf(x, parameters.n, parameters.p));
        }
        break;
      case 'Uniform':
        for (let x = parameters.min; x <= parameters.max; x += 0.1) {
          xValues.push(x);
          yValues.push(jStat.uniform.pdf(x, parameters.min, parameters.max));
        }
        break;
      default:
        break;
    }

    return { xValues, yValues };
  };

  const { xValues, yValues } = generateData();

  const chartData = {
    labels: xValues,
    datasets: [
      {
        label: `${selectedDistribution} Distribution`,
        data: yValues,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div>
      <h1>Distribution Display</h1>
      <div>
        <label>Select Distribution:</label>
        <select value={selectedDistribution} onChange={handleDistributionChange}>
          <option value="Normal">Normal</option>
          <option value="Poisson">Poisson</option>
          <option value="Binomial">Binomial</option>
          <option value="Uniform">Uniform</option>
        </select>
      </div>

      <div>
        {selectedDistribution === 'Normal' && (
          <div>
            <label>Mean:</label>
            <input type="number" name="mean" value={parameters.mean} onChange={handleParamChange} />
            <label>Standard Deviation:</label>
            <input type="number" name="stddev" value={parameters.stddev} onChange={handleParamChange} />
          </div>
        )}

        {selectedDistribution === 'Poisson' && (
          <div>
            <label>Lambda:</label>
            <input type="number" name="lambda" value={parameters.lambda} onChange={handleParamChange} />
          </div>
        )}

        {selectedDistribution === 'Binomial' && (
          <div>
            <label>Trials (n):</label>
            <input type="number" name="n" value={parameters.n} onChange={handleParamChange} />
            <label>Probability (p):</label>
            <input type="number" name="p" value={parameters.p} onChange={handleParamChange} />
          </div>
        )}

        {selectedDistribution === 'Uniform' && (
          <div>
            <label>Min:</label>
            <input type="number" name="min" value={parameters.min} onChange={handleParamChange} />
            <label>Max:</label>
            <input type="number" name="max" value={parameters.max} onChange={handleParamChange} />
          </div>
        )}
      </div>

      <Line data={chartData} />
    </div>
  );
};

export default DistributionDisplay;
