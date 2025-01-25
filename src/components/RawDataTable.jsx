import React, { useState } from "react";
import { saveAs } from "file-saver"; // Optional for Excel and JSON download (requires file-saver and xlsx libraries)

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
      e.preventDefault();
      e.target.blur();
      handleCellEdit(rowIndex, colIndex, e.target.innerText.trim());
    }
  };

  // Validate cell input based on column type (example: numeric validation)
  const validateInput = (value, colIndex) => {
    // Example: Ensure numeric input for specific columns
    if (columnHeaders[colIndex].toLowerCase().includes("price")) {
      return !isNaN(value) ? value : "Invalid Input";
    }
    return value;
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
    link.click();
  };

  // Export to JSON
  const downloadJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    saveAs(blob, "modified_dataset.json");
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

  // Export to Excel (optional)
  const downloadExcel = () => {
    const XLSX = require("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([columnHeaders, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dataset");
    XLSX.writeFile(wb, "modified_dataset.xlsx");
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Search and Button Container */}
      <div className="flex-none p-4 space-y-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex space-x-2">
          <button
            onClick={downloadCSV}
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Download CSV
          </button>
          <button
            onClick={downloadExcel}
            className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Download Excel
          </button>
          <button
            onClick={downloadJSON}
            className="w-full px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Download JSON
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-grow overflow-auto border rounded-lg">
        <table className="min-w-full border-collapse bg-white text-xs md:text-sm">
          <thead className="sticky top-0 bg-gray-50 shadow-sm">
            <tr>
              {columnHeaders.map((header, colIndex) => (
                <th
                  key={colIndex}
                  className={`px-2 md:px-4 py-2 text-left font-medium text-gray-700 cursor-pointer whitespace-nowrap ${
                    sortConfig.colIndex === colIndex ? "bg-indigo-100" : ""
                  }`}
                  onClick={() => handleSort(colIndex)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    <span className="text-xs">
                      {sortConfig.colIndex === colIndex
                        ? sortConfig.direction === "ascending"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(
                        rowIndex,
                        colIndex,
                        validateInput(e.target.innerText.trim(), colIndex)
                      )
                    }
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    className="px-2 md:px-4 py-2 text-gray-700 cursor-pointer truncate"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawDataTable;
