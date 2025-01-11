import React, { useState } from "react";
import "../styles/RawDataTable.css";

const RawDataTable = ({ data, columnHeaders, setData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ colIndex: null, direction: null });

  // Handle cell edits to update the data
  const handleCellEdit = (rowIndex, colIndex, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][colIndex] = value;
    setData(updatedData); // Update the data state
  };

  // Convert the dataset to CSV format
  const convertToCSV = () => {
    const header = columnHeaders.join(",");
    const rows = data.map((row) => row.join(",")).join("\n");
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
    link.click(); // Trigger the download
  };

  // Sort the data based on a column
  const handleSort = (colIndex) => {
    let direction = "ascending";
    if (sortConfig.colIndex === colIndex && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    const sortedData = [...data].sort((a, b) => {
      if (a[colIndex] < b[colIndex]) return direction === "ascending" ? -1 : 1;
      if (a[colIndex] > b[colIndex]) return direction === "ascending" ? 1 : -1;
      return 0;
    });
    setData(sortedData);
    setSortConfig({ colIndex, direction });
  };

  // Filter data based on the search query
  const filteredData = data.filter((row) =>
    row.some((cell) => cell.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="table-container">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {/* Data Table */}
      <table className="striped responsive-table">
        <thead>
          <tr>
            {columnHeaders.map((header, colIndex) => (
              <th
                key={colIndex}
                className={`sticky-header ${sortConfig.colIndex === colIndex ? sortConfig.direction : ""}`}
                onClick={() => handleSort(colIndex)}
              >
                {header} <span>{sortConfig.colIndex === colIndex ? (sortConfig.direction === "ascending" ? "▲" : "▼") : "↕"}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
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
