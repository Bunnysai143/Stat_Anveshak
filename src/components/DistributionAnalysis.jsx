import React, { useState } from 'react';
import { jStat } from 'jstat';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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

  const maxPoints = 50; // Maximum number of points for smoother chart display and memory efficiency.

  // Distribution info descriptions for educational purposes
  const distributionsInfo = {
    Normal: 'The Normal distribution (also known as Gaussian distribution) is a continuous probability distribution. It is often used to represent natural phenomena such as height, weight, or test scores. The distribution is symmetric, with its shape resembling a bell curve, characterized by its mean (average) and standard deviation (spread). Example: Heights of people in a population.',
    Poisson: 'The Poisson distribution models the number of times an event occurs in a fixed interval of time or space. It is often used to model rare events, such as the number of accidents at an intersection or the number of emails received in an hour. The distribution is characterized by the rate (lambda) of occurrence. Example: Number of phone calls received in a call center in an hour.',
    Binomial: 'The Binomial distribution describes the number of successes in a fixed number of independent trials, each with the same probability of success. It is commonly used in situations like flipping a coin or taking a test with multiple-choice questions. Example: Number of heads when flipping a coin 10 times.',
    Uniform: 'The Uniform distribution is a type of distribution where every outcome is equally likely within a specified range. For example, rolling a fair die or selecting a random number between 1 and 10 follows a uniform distribution. Example: Rolling a fair die.',
    Exponential: 'The Exponential distribution models the time between events in a Poisson process, where events happen at a constant average rate. It is used in scenarios like the time between arrivals at a queue or the lifespan of an electronic device. Example: Time between arrivals of customers at a bank.',
    Geometric: 'The Geometric distribution models the number of trials required to achieve the first success in a sequence of independent and identically distributed Bernoulli trials. It’s useful in situations like determining how many times you need to flip a coin until you get heads. Example: Number of coin flips to get the first heads.',
    Cauchy: 'The Cauchy distribution is a continuous probability distribution with heavy tails, often used in physics. Unlike the normal distribution, it has undefined mean and variance due to its heavy tails. Example: Measurement errors in physical systems.',
    LogNormal: 'The Log-Normal distribution is used when the logarithm of a random variable follows a normal distribution. It is commonly used in financial markets, where prices of stocks or assets often follow log-normal distributions. Example: Prices of stocks in financial markets.',
    Beta: 'The Beta distribution is a continuous probability distribution defined on the interval [0, 1]. It is often used in Bayesian statistics to model distributions of probabilities, and it’s useful for modeling random variables that are constrained between 0 and 1, like percentages or proportions. Example: Probability of success in a test.',
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
      const step = range / maxPoints; // Dynamically calculate step size

      switch (selectedDistribution) {
        case 'Normal':
          if (parameters.stddev <= 0) {
            alert('Standard deviation must be greater than 0.');
            return { xValues, yValues };
          }
          for (let x = -range; x <= range; x += step) {
            xValues.push(x/2);
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
          for (let x = 1; x <= range; x++) { // Geometric distribution is defined for x >= 1
            xValues.push(x);
            const pdf = Math.pow(1 - parameters.p, x - 1) * parameters.p; // Calculate PMF manually
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
          for (let x = 0; x <= range; x += step) { // Use 'step' instead of 'stepSize'
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
    <div>
      <h2>Select Distribution</h2>
      <select value={selectedDistribution} onChange={handleDistributionChange}>
        {Object.keys(distributionsInfo).map((dist) => (
          <option key={dist} value={dist}>
            {dist}
          </option>
        ))}
      </select>
      

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
            <label>Number of Trials (n):</label>
            <input type="number" name="n" value={parameters.n} onChange={handleParamChange} />
            <label>Probability of Success (p):</label>
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
        {selectedDistribution === 'Exponential' && (
          <div>
            <label>Rate:</label>
            <input type="number" name="rate" value={parameters.rate} onChange={handleParamChange} />
          </div>
        )}
        {selectedDistribution === 'Geometric' && (
          <div>
            <label>Probability (p):</label>
            <input type="number" name="p" value={parameters.p} onChange={handleParamChange} />
          </div>
        )}
        {selectedDistribution === 'Cauchy' && (
          <div>
            <label>Mean:</label>
            <input type="number" name="mean" value={parameters.mean} onChange={handleParamChange} />
            <label>Scale:</label>
            <input type="number" name="scale" value={parameters.scale} onChange={handleParamChange} />
          </div>
        )}
        {selectedDistribution === 'LogNormal' && (
          <div>
            <label>Mean:</label>
            <input type="number" name="mean" value={parameters.mean} onChange={handleParamChange} />
            <label>Standard Deviation:</label>
            <input type="number" name="stddev" value={parameters.stddev} onChange={handleParamChange} />
          </div>
        )}
        {selectedDistribution === 'Beta' && (
          <div>
            <label>Alpha:</label>
            <input type="number" name="alpha" value={parameters.alpha} onChange={handleParamChange} />
            <label>Beta:</label>
            <input type="number" name="beta" value={parameters.beta} onChange={handleParamChange} />
          </div>
        )}
        {selectedDistribution === 'Gamma' && (
          <div>
            <label>Shape:</label>
            <input type="number" name="shape" value={parameters.shape} onChange={handleParamChange} />
            <label>Scale:</label>
            <input type="number" name="scaleGamma" value={parameters.scaleGamma} onChange={handleParamChange} />
          </div>
        )}
      </div>

      <Line data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: `${selectedDistribution} Distribution` } } }} />
      <p>{distributionsInfo[selectedDistribution]}</p>
    </div>
  );
};

export default DistributionDisplay;
