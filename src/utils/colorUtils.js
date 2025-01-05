// utils/colorUtils.js
export const getWeb3Color = (index) => {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6", "#1ABC9C"
    ]; // Customize the color array as needed
    return colors[index % colors.length]; // Cycle through colors
  };
  