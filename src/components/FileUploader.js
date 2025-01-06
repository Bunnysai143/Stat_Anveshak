// FileUploader.js
import React, { useState } from "react";
import * as XLSX from "xlsx";

const FileUploader = ({ onFileUpload }) => {
  const [fileData, setFileData] = useState(null); // Store file data
  const [data, setData] = useState([]);
  const [columnHeaders, setColumnHeaders] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];  // Get the selected file
    if (!file) {
      console.error("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(new Uint8Array(event.target.result), {
          type: "array",
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];  // Get the first sheet
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });  // Convert the sheet to JSON
        const columnHeaders = rawData[0];  // First row is the column headers
        const data = rawData.slice(1);  // The rest is the actual data

        setData(data);
        setColumnHeaders(columnHeaders);
        setFileData(file);  // Store the original file
        onFileUpload(data, columnHeaders);  // Send data to parent component
      } catch (error) {
        console.error("Error reading the file:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Export modified data as Excel file
  const handleExport = () => {
    const ws = XLSX.utils.aoa_to_sheet([columnHeaders, ...data]); // Create sheet from the modified data
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate and download the Excel file
    XLSX.writeFile(wb, "modified_data.xlsx");
  };

  return (
    <div className="file-upload-container">
      <label htmlFor="file-upload" className="file-upload-link">
        Upload File
      </label>
      <input
        type="file"
        id="file-upload"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      
      {/* Display the upload button */}
      {fileData && (
        <button className="upload-btn" onClick={handleExport}>
          Export Modified Data
        </button>
      )}
    </div>
  );
};

export default FileUploader;
