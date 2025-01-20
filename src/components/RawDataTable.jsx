import React, { useState } from "react";

const RawDataTable = ({ data, columnHeaders, setData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ colIndex: null, direction: null });

  // Handle cell edits to update the data
  const handleCellEdit = (rowIndex, colIndex, value) => {
    const updatedData = [...data];

    if (Array.isArray(updatedData[rowIndex])) {
      updatedData[rowIndex][colIndex] = value;
    } else {
      const key = columnHeaders[colIndex];
      updatedData[rowIndex][key] = value;
    }

    setData(updatedData);
  };

  // Prevent "Enter" from adding a new line
  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent newline
      e.target.blur(); // Trigger blur to save changes
      handleCellEdit(rowIndex, colIndex, e.target.innerText.trim());
    }
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
    Object.values(row).some((cell) =>
      cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="max-w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* Data Table */}
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            {columnHeaders.map((header, colIndex) => (
              <th
                key={colIndex}
                className={`px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer ${
                  sortConfig.colIndex === colIndex ? "bg-indigo-100" : "bg-gray-50"
                }`}
                onClick={() => handleSort(colIndex)}
              >
                {header}{" "}
                <span className="text-xs">
                  {sortConfig.colIndex === colIndex
                    ? sortConfig.direction === "ascending"
                      ? "▲"
                      : "▼"
                    : "↕"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t hover:bg-gray-100">
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  contentEditable
                  onBlur={(e) => handleCellEdit(rowIndex, colIndex, e.target.innerText.trim())}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Button to download the modified dataset */}
      <button
        onClick={downloadCSV}
        className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Download Modified Dataset
      </button>
    </div>
  );
};

export default RawDataTable;
