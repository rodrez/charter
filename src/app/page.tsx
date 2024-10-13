"use client";

import React, { useState, useRef } from "react";
import LineChart from "@/components/line-chart";
import Papa from "papaparse";

function csvToDataFormat(csvFile: string) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      complete: (result) => {
        const colors = [
          "#0074D9",
          "#FF4136",
          "#2ECC40",
          "#FF851B",
          "#7FDBFF",
          "#B10DC9",
          "#FFDC00",
        ];
        const labelPositions: ("top" | "right" | "bottom" | "left")[] = [
          "top",
          "right",
          "bottom",
          "left",
        ];
        const [headers, ...rows] = result.data;

        // Assuming the first column is for names/dates, we'll skip it
        const productNames = headers.slice(1);

        const data = productNames
          .map((product, index) => {
            const productData = rows
              .map((row) => {
                const value = Number(row[index + 1]);
                return isNaN(value) ? null : value;
              })
              .filter((value) => value !== null);

            return {
              title: product,
              color: colors[index % colors.length],
              data: productData,
              label: product,
              animationDuration: 5,
              labelPosition: labelPositions[index % labelPositions.length],
            };
          })
          .filter((product) => product.data.length > 0);

        resolve(data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export default function TestPage() {
  const [data, setData] = useState([]);
  const [showLegend, setShowLegend] = useState(true);
  const [axisColor, setAxisColor] = useState("#333333");
  const [labelColor, setLabelColor] = useState("#666666");
  const [skipZeroes, setSkipZeroes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        csvToDataFormat(csvText)
          .then((formattedData: any) => {
            setData(formattedData);
            console.log(formattedData);
          })
          .catch((error) => console.error("Error:", error));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto mt-20 px-4">
      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mr-2 rounded bg-green-500 px-4 py-2 text-white"
        >
          Import CSV
        </button>
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          {showLegend ? "Hide Legend" : "Show Legend"}
        </button>
      </div>
      <div className="mb-4">
        <label className="mr-2">Axis Color:</label>
        <input
          type="color"
          value={axisColor}
          onChange={(e) => setAxisColor(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="mr-2">Label Color:</label>
        <input
          type="color"
          value={labelColor}
          onChange={(e) => setLabelColor(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={skipZeroes}
            onChange={(e) => setSkipZeroes(e.target.checked)}
            className="mr-2"
          />
          Skip Zero Values
        </label>
      </div>
      <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-4">
        {data.length > 0 ? (
          <LineChart
            dataSeries={data}
            showLegend={showLegend}
            staggered={true}
            delay={1}
            axisColor={axisColor}
            labelColor={labelColor}
            skipZeroes={skipZeroes}
          />
        ) : (
          <p>No data loaded. Please import a CSV file.</p>
        )}
      </div>
    </div>
  );
}
