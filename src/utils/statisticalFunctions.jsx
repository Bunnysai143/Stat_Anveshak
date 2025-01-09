// Generate data for Normal distribution
export const generateNormalData = (mean, stdDev, count) => {
    let data = [];
    for (let i = 0; i < count; i++) {
      const randomValue = mean + stdDev * Math.random();
      data.push(randomValue);
    }
    return data;
  };
  
  // Generate data for Binomial distribution
  export const generateBinomialData = (probability, count) => {
    let data = [];
    for (let i = 0; i < count; i++) {
      const randomValue = Math.random() < probability ? 1 : 0;
      data.push(randomValue);
    }
    return data;
  };
  
  // Generate data for Uniform distribution
  export const generateUniformData = (min, max, count) => {
    let data = [];
    for (let i = 0; i < count; i++) {
      const randomValue = Math.random() * (max - min) + min;
      data.push(randomValue);
    }
    return data;
  };
  