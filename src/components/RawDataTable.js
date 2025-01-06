import React from "react";

const RawDataTable = ({ data, columnHeaders, setData }) => {
  // Handle cell edits to update the data
  const handleCellEdit = (rowIndex, colIndex, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][colIndex] = value;
    setData(updatedData);  // Update the data state
  };

  return (
    <table className="striped responsive-table">
      <thead>
        <tr>
          {columnHeaders.map((header, colIndex) => (
            <th key={colIndex}>{header}</th>
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
  );
};

export default RawDataTable;
