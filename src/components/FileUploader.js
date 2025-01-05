import React from "react";
import * as XLSX from "xlsx";

const FileUploader = ({ onFileUpload }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];  // Get the selected file
    
    if (!file) {
      // If no file is selected, display an alert or log a message
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

        // Call the parent function to update data and column headers
        onFileUpload(data, columnHeaders);
      } catch (error) {
        console.error("Error reading the file:", error);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <label className="file-upload-link">
        Upload File
        <input type="file" onChange={handleFileUpload} />
      </label>
    </div>
  );
};

export default FileUploader;
