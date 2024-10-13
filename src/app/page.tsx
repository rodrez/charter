"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import ChartControls from "@/components/chart-controls";
import type { DataSeries } from "@/lib/types/line-chart";
import LineChart from "@/components/line-chart/line-chart";

export default function TestPage() {
  const [data, setData] = useState<DataSeries[]>([]);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [chartBackgroundColor, setChartBackgroundColor] = useState("#ffffff");
  const [axisColor, setAxisColor] = useState("#000000");
  const [labelColor, setLabelColor] = useState("#000000");
  const [labelBackgroundColor, setLabelBackgroundColor] = useState("rgba(255, 255, 255, 0.7)");
  const [legendBackgroundColor, setLegendBackgroundColor] = useState("#ffffff");
  const [legendTextColor, setLegendTextColor] = useState("#000000");
  const [dataLineColors, setDataLineColors] = useState(["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF", "#B10DC9"]);
  const [showLegend, setShowLegend] = useState(true);
  const [skipZeroes, setSkipZeroes] = useState(false);
  const [staggered, setStaggered] = useState(true);
  const [delay, setDelay] = useState(1);
  const [curved, setCurved] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        console.log("CSV Text:", csvText); // Log the raw CSV text
        Papa.parse(csvText, {
          complete: (result) => {
            console.log("Raw parsed data:", result.data);
            setRawData(result.data as string[][]);
            const parsedData = result.data as string[][];
            const series: DataSeries[] = [];
            
            if (parsedData.length > 1) {
              console.log('parsedData', parsedData);
              console.log('parsedData length:', parsedData.length);
              console.log('parsedData[0]:', parsedData[0]);
              
              // Assuming the first row is the header
              const headers = parsedData[0];
              console.log('Headers:', headers);
              
              // Assuming the first column is for x-axis labels
              const xAxisLabels = parsedData.slice(1).map(row => row[0]);
              console.log('xAxisLabels:', xAxisLabels);
              
              for (let i = 0; i < headers.length; i++) {
                console.log(`Processing column ${i}: ${headers[i]}`);
                const dataPoints = parsedData.slice(1).map(row => {
                  const value = parseFloat(row[i] || '0');
                  return isNaN(value) ? 0 : value;
                });
                console.log(`Data points for series ${i}:`, dataPoints);
                series.push({
                  title: headers[i],
                  label: headers[i],
                  color: dataLineColors[(i - 1) % dataLineColors.length],
                  data: dataPoints,
                  xAxisLabels: xAxisLabels,
                  animationDuration: 4, // This are seconds
                  labelPosition: "top"
                } as DataSeries);
              }
            } else {
              console.log('Parsed data has insufficient rows');
            }
            
            console.log("Final series data:", series);
            setData(series);
          },
          error: (error: any) => console.error("Error:", error),
          header: false, // Changed to false
          dynamicTyping: false,
          skipEmptyLines: true,
          delimiter: ",", // Explicitly set the delimiter
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <ChartControls
        data={data}
        rawData={rawData}
        handleFileUpload={handleFileUpload}
        chartBackgroundColor={chartBackgroundColor}
        axisColor={axisColor}
        labelColor={labelColor}
        labelBackgroundColor={labelBackgroundColor}
        legendBackgroundColor={legendBackgroundColor}
        legendTextColor={legendTextColor}
        dataLineColors={dataLineColors}
        showLegend={showLegend}
        skipZeroes={skipZeroes}
        staggered={staggered}
        delay={delay}
        curved={curved}
        setChartBackgroundColor={setChartBackgroundColor}
        setAxisColor={setAxisColor}
        setLabelColor={setLabelColor}
        setLabelBackgroundColor={setLabelBackgroundColor}
        setLegendBackgroundColor={setLegendBackgroundColor}
        setLegendTextColor={setLegendTextColor}
        setDataLineColors={setDataLineColors}
        setShowLegend={setShowLegend}
        setSkipZeroes={setSkipZeroes}
        setStaggered={setStaggered}
        setDelay={setDelay}
        setCurved={setCurved}
      />
      {data.length > 0 && data.some(series => series.data.length > 0) ? (
        <LineChart
          dataSeries={data}
          showLegend={showLegend}
          staggered={staggered}
          delay={delay}
          axisColor={axisColor}
          labelColor={labelColor}
          skipZeroes={skipZeroes}
          labelBackgroundColor={labelBackgroundColor}
          chartBackgroundColor={chartBackgroundColor}
          legendBackgroundColor={legendBackgroundColor}
          legendTextColor={legendTextColor}
          dataLineColors={dataLineColors}
          curved={curved}
        />
      ) : (
        <p>No valid data to display. Please upload a CSV file with numeric data.</p>
      )}
    </div>
  );
}
