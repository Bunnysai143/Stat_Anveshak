import React, { useState, useRef } from 'react';
import { jStat } from 'jstat';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, registerables } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin, ...registerables);



const DistributionDisplay = () => {
  const [selectedDistribution, setSelectedDistribution] = useState('Normal');
  const [parameters, setParameters] = useState({
    mean: 0,
    stddev: 1,
    lambda: 1,
    n: 10,
    p: 0.5,
    min: 0,
    max: 1,
    rate: 1,
    scale: 1,
    alpha: 1,
    beta: 1,
    shape: 1,
    scaleGamma: 1,
  });

  const chartRef = useRef(null);

  const handleReset = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };
  const maxPoints = 100; // Maximum number of points for smoother chart display and memory efficiency.

  // Distribution info descriptions for educational purposes
  const distributionsInfo = {
    Normal: 'The Normal distribution (also known as Gaussian distribution) is a continuous probability distribution. It is often used to represent natural phenomena such as height, weight, or test scores. The distribution is symmetric, with its shape resembling a bell curve, characterized by its mean (average) and standard deviation (spread). Example: Heights of people in a population.',
    Poisson: 'The Poisson distribution models the number of times an event occurs in a fixed interval of time or space. It is often used to model rare events, such as the number of accidents at an intersection or the number of emails received in an hour. The distribution is characterized by the rate (lambda) of occurrence. Example: Number of phone calls received in a call center in an hour.',
    Binomial: 'The Binomial distribution describes the number of successes in a fixed number of independent trials, each with the same probability of success. It is commonly used in situations like flipping a coin or taking a test with multiple-choice questions. Example: Number of heads when flipping a coin 10 times.',
    Uniform: 'The Uniform distribution is a type of distribution where every outcome is equally likely within a specified range. For example, rolling a fair die or selecting a random number between 1 and 10 follows a uniform distribution. Example: Rolling a fair die.',
    Exponential: 'The Exponential distribution models the time between events in a Poisson process, where events happen at a constant average rate. It is used in scenarios like the time between arrivals at a queue or the lifespan of an electronic device. Example: Time between arrivals of customers at a bank.',
    Geometric: 'The Geometric distribution models the number of trials required to achieve the first success in a sequence of independent and identically distributed Bernoulli trials. It\'s useful in situations like determining how many times you need to flip a coin until you get heads. Example: Number of coin flips to get the first heads.',
    Cauchy: 'The Cauchy distribution is a continuous probability distribution with heavy tails, often used in physics. Unlike the normal distribution, it has undefined mean and variance due to its heavy tails. Example: Measurement errors in physical systems.',
    LogNormal: 'The Log-Normal distribution is used when the logarithm of a random variable follows a normal distribution. It is commonly used in financial markets, where prices of stocks or assets often follow log-normal distributions. Example: Prices of stocks in financial markets.',
    Beta: 'The Beta distribution is a continuous probability distribution defined on the interval [0, 1]. It is often used in Bayesian statistics to model distributions of probabilities, and it\'s useful for modeling random variables that are constrained between 0 and 1, like percentages or proportions. Example: Probability of success in a test.',
    Gamma: 'The Gamma distribution is a continuous probability distribution with two parameters: shape (α) and scale (β). It is often used to model waiting times or the time until a certain number of events occur, such as the time until the third car arrives at a toll booth. Example: Time to complete a task or service.'
  };

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
      case 'Exponential':
        setParameters({ rate: 1 });
        break;
      case 'Geometric':
        setParameters({ p: 0.5 });
        break;
      case 'Cauchy':
        setParameters({ mean: 0, scale: 1 });
        break;
      case 'LogNormal':
        setParameters({ mean: 0, stddev: 1 });
        break;
      case 'Beta':
        setParameters({ alpha: 1, beta: 1 });
        break;
      case 'Gamma':
        setParameters({ shape: 1, scaleGamma: 1 });
        break;
      default:
        break;
    }
  };

  const generateData = () => {
    let xValues = [];
    let yValues = [];

    try {
      const rangeLimit = {
        Normal: 10,
        Poisson: parameters.lambda + 10,
        Binomial: parameters.n,
        Uniform: parameters.max - parameters.min,
        Exponential: 10,
        Geometric: 20,
        Cauchy: 20,
        LogNormal: 5,
        Beta: 1,
        Gamma: 20,
      };

      const range = rangeLimit[selectedDistribution] || 10;
      const step = range / maxPoints;

      switch (selectedDistribution) {
        case 'Normal':
          if (parameters.stddev <= 0) {
            alert('Standard deviation must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = -range; x <= range; x += step) {
            xValues.push(x / 2);
            yValues.push(jStat.normal.pdf(x, parameters.mean, parameters.stddev));
          }
          break;

        case 'Poisson':
          if (parameters.lambda <= 0) {
            alert('Lambda must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = 0; x <= range; x += 1) {
            xValues.push(x);
            yValues.push(jStat.poisson.pdf(x, parameters.lambda));
          }
          break;

        case 'Binomial':
          if (parameters.n <= 0) {
            alert('Number of trials (n) must be greater than 0.');
            return { xValues, yValues };
          }
          if (parameters.p < 0 || parameters.p > 1) {
            alert('Probability p must be between 0 and 1.');
            return { xValues, yValues };
          }
          for (let x = 0; x <= parameters.n; x += 1) {
            xValues.push(x);
            yValues.push(jStat.binomial.pdf(x, parameters.n, parameters.p));
          }
          break;

        case 'Uniform':
          if (parameters.min >= parameters.max) {
            alert('Min must be less than Max.');
            return { xValues, yValues };
          }
          for (let x = parameters.min; x <= parameters.max; x += step) {
            xValues.push(x);
            yValues.push(jStat.uniform.pdf(x, parameters.min, parameters.max));
          }
          break;

        case 'Exponential':
          if (parameters.rate <= 0) {
            alert('Rate must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = 0; x <= range; x += step) {
            xValues.push(x);
            yValues.push(jStat.exponential.pdf(x, parameters.rate));
          }
          break;

        case 'Geometric':
          if (parameters.p <= 0 || parameters.p >= 1) {
            alert('Probability p must be between 0 and 1.');
            return { xValues, yValues };
          }
          for (let x = 1; x <= range; x++) {
            xValues.push(x);
            const pdf = Math.pow(1 - parameters.p, x - 1) * parameters.p;
            yValues.push(pdf);
          }
          break;

        case 'Cauchy':
          if (parameters.scale <= 0) {
            alert('Scale must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = -range; x <= range; x += step) {
            xValues.push(x);
            yValues.push(jStat.cauchy.pdf(x, parameters.mean, parameters.scale));
          }
          break;

        case 'LogNormal':
          if (parameters.stddev <= 0) {
            alert('Standard deviation must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = 0; x <= range; x += step) {
            xValues.push(x);
            yValues.push(jStat.lognormal.pdf(x, parameters.mean, parameters.stddev));
          }
          break;

        case 'Beta':
          if (parameters.alpha <= 0 || parameters.beta <= 0) {
            alert('Alpha and Beta must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = 0; x <= range; x += step) {
            xValues.push(x);
            yValues.push(jStat.beta.pdf(x, parameters.alpha, parameters.beta));
          }
          break;

        case 'Gamma':
          if (parameters.shape <= 0 || parameters.scaleGamma <= 0) {
            alert('Shape and Scale must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = 0; x <= range; x += step) {
            xValues.push(x);
            yValues.push(jStat.gamma.pdf(x, parameters.shape, parameters.scaleGamma));
          }
          break;

        default:
          alert(`Unsupported distribution: ${selectedDistribution}`);
          return { xValues, yValues };
      }
    } catch (error) {
      alert('An error occurred: ' + error.message);
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
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            Probability Distribution Explorer
          </h2>
        </div>

        <div className="p-8 space-y-8">
          {/* Distribution Selection */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <label className="text-lg font-semibold text-gray-700 w-full sm:w-auto">
              Select Distribution:
            </label>
            <select
              value={selectedDistribution}
              onChange={handleDistributionChange}
              className="w-full sm:w-72 p-3 bg-white border-2 border-blue-200 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-400 
              transition duration-300 ease-in-out hover:border-blue-300
              text-gray-700 font-medium"
            >
              {Object.keys(distributionsInfo).map((dist) => (
                <option
                  key={dist}
                  value={dist}
                  className="hover:bg-blue-100 p-2"
                >
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Parameter Inputs with Enhanced Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-xl">
            {selectedDistribution === 'Normal' && (
              <>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Mean
                    <span className="text-sm text-gray-500 ml-2">
                      (Central tendency)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="mean"
                    value={parameters.mean}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 
                    transition duration-300 ease-in-out"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Standard Deviation
                    <span className="text-sm text-gray-500 ml-2">
                      (Spread of data)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="stddev"
                    value={parameters.stddev}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 
                    transition duration-300 ease-in-out"
                  />
                </div>
              </>
            )}
            {selectedDistribution === 'Poisson' && (
              <div className="col-span-full space-y-2">
                <label className="block text-md font-medium text-gray-700">
                  Lambda (Rate)
                  <span className="text-sm text-gray-500 ml-2">
                    (Average number of events)
                  </span>
                </label>
                <input
                  type="number"
                  name="lambda"
                  value={parameters.lambda}
                  onChange={handleParamChange}
                  className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-400 
                  transition duration-300 ease-in-out"
                />
              </div>
            )}
            {selectedDistribution === 'Binomial' && (
              <>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Number of Trials (n)
                    <span className="text-sm text-gray-500 ml-2">
                      (Total attempts)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="n"
                    value={parameters.n}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 
                    transition duration-300 ease-in-out"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Probability of Success (p)
                    <span className="text-sm text-gray-500 ml-2">
                      (0-1 range)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="p"
                    value={parameters.p}
                    onChange={handleParamChange}
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 
                    transition duration-300 ease-in-out"
                  />
                </div>
              </>
            )}
            {selectedDistribution === 'Uniform' && (
              <>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Minimum Value
                    <span className="text-sm text-gray-500 ml-2">
                      (Lower bound)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="min"
                    value={parameters.min}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 
                    transition duration-300 ease-in-out"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Maximum Value
                    <span className="text-sm text-gray-500 ml-2">
                      (Upper bound)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="max"
                    value={parameters.max}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 
                    transition duration-300 ease-in-out"
                  />
                </div>
              </>
            )}
            {selectedDistribution === 'Exponential' && (
              <div className="col-span-full space-y-2">
                <label className="block text-md font-medium text-gray-700">
                  Rate
                  <span className="text-sm text-gray-500 ml-2">
                    (Average rate of events)
                  </span>
                </label>
                <input
                  type="number"
                  name="rate"
                  value={parameters.rate}
                  onChange={handleParamChange}
                  className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
      focus:outline-none focus:ring-2 focus:ring-blue-400 
      transition duration-300 ease-in-out"
                />
              </div>
            )}

            {selectedDistribution === 'Geometric' && (
              <div className="col-span-full space-y-2">
                <label className="block text-md font-medium text-gray-700">
                  Probability of Success (p)
                  <span className="text-sm text-gray-500 ml-2">
                    (Probability of success in each trial)
                  </span>
                </label>
                <input
                  type="number"
                  name="p"
                  value={parameters.p}
                  onChange={handleParamChange}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
      focus:outline-none focus:ring-2 focus:ring-blue-400 
      transition duration-300 ease-in-out"
                />
              </div>
            )}

            {selectedDistribution === 'Cauchy' && (
              <>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Location (Mean)
                    <span className="text-sm text-gray-500 ml-2">
                      (Center of distribution)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="mean"
                    value={parameters.mean}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Scale
                    <span className="text-sm text-gray-500 ml-2">
                      (Width of distribution)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="scale"
                    value={parameters.scale}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
              </>
            )}

            {selectedDistribution === 'LogNormal' && (
              <>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Mean
                    <span className="text-sm text-gray-500 ml-2">
                      (Log-transformed mean)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="mean"
                    value={parameters.mean}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Standard Deviation
                    <span className="text-sm text-gray-500 ml-2">
                      (Log-transformed standard deviation)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="stddev"
                    value={parameters.stddev}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
              </>
            )}

            {selectedDistribution === 'Beta' && (
              <>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Alpha
                    <span className="text-sm text-gray-500 ml-2">
                      (First shape parameter)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="alpha"
                    value={parameters.alpha}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Beta
                    <span className="text-sm text-gray-500 ml-2">
                      (Second shape parameter)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="beta"
                    value={parameters.beta}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
              </>
            )}

            {selectedDistribution === 'Gamma' && (
              <>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Shape
                    <span className="text-sm text-gray-500 ml-2">
                      (Shape parameter)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="shape"
                    value={parameters.shape}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-md font-medium text-gray-700">
                    Scale
                    <span className="text-sm text-gray-500 ml-2">
                      (Scale parameter)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="scaleGamma"
                    value={parameters.scaleGamma}
                    onChange={handleParamChange}
                    className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition duration-300 ease-in-out"
                  />
                </div>
              </>
            )}
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 relative max-w-full mx-auto">
            {/* Chart with Zoom and Pan */}
            <div className="chart-container mb-4 sm:mb-6">
              <Line
                id="chart-id"
                data={chartData}
                ref={chartRef}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: `${selectedDistribution} Distribution Visualization`,
                      font: {
                        size: 18,
                        weight: 'bold',
                      },
                      color: '#2c3e50',
                    },
                    zoom: {
                      pan: {
                        enabled: true,
                        mode: 'x',
                      },
                      zoom: {
                        wheel: {
                          enabled: true,
                        },
                        pinch: {
                          enabled: true,
                        },
                        mode: 'x',
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Value',
                        color: '#7f8c8d',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Probability Density',
                        color: '#7f8c8d',
                      },
                    },
                  },
                }}
                height={500} // Adjusted for responsiveness
              />
            </div>

            {/* Control Buttons */}
            <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              {/* Reset Zoom Button */}
              <button
                onClick={handleReset}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full sm:w-auto text-center mb-2 sm:mb-0"
              >
                Reset Zoom
              </button>

              {/* Download Button */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto text-center"
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = 'chart.png';
                    link.click();
                  }
                }}
              >
                Download
              </button>
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 
          border-l-4 border-blue-400 p-6 rounded-r-xl space-y-4 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Distribution Insights
            </h3>
            <p className="text-md text-gray-700 leading-relaxed">
              {distributionsInfo[selectedDistribution]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionDisplay;