import React from "react";
import "../styles/RawDataTable.css";

const RawDataTable = ({ data, columnHeaders, setData }) => {
  // Handle cell edits to update the data
  const handleCellEdit = (rowIndex, colIndex, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][colIndex] = value;
    setData(updatedData);  // Update the data state
  };

  // Convert the dataset to CSV format
  const convertToCSV = () => {
    // Combine column headers with data rows
    const header = columnHeaders.join(",");
    const rows = data.map(row => row.join(",")).join("\n");
    return `${header}\n${rows}`;
  };

  // Download the CSV file
  const downloadCSV = () => {
    const csvContent = convertToCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modified_dataset.csv");
    link.click();  // Trigger the download
  };

  return (
    <div className="table-container">
      <table className="striped responsive-table">
        <thead>
          <tr>
            {columnHeaders.map((header, colIndex) => (
              <th key={colIndex} className="sticky-header">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  contentEditable
                  onBlur={(e) => handleCellEdit(rowIndex, colIndex, e.target.innerText)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Button to download the modified dataset */}
      <button className="download-btn" onClick={downloadCSV}>
        Download Modified Dataset
      </button>
    </div>
  );
};

export default RawDataTable;
