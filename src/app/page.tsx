"use client";

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import ChartControls from "@/components/chart-controls";
import type { DataSeries } from "@/lib/types/line-chart";
import LineChart from "@/components/line-chart/line-chart";
import Image from "next/image";
import AnimatedTable from "./rank-table";
import { Button } from "@/components/ui/button"; // Add this import


// Custom component that renders an image
const ImageLabelComponent = ({ src }: { src: string}) => (
  <div className="flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
      <Image
        src={src}
        alt="Label"
        width={80}
        height={80}
        style={{ objectFit: 'contain' }}
      />
  </div>
);



export default function TestPage() {
  const [data, setData] = useState<DataSeries[]>([]);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [chartBackgroundColor, setChartBackgroundColor] = useState("#ffffff");
  const [axisColor, setAxisColor] = useState("#000000");
  const [labelColor, setLabelColor] = useState("#000000");
  const [labelBackgroundColor, setLabelBackgroundColor] = useState("rgba(255, 255, 255, 0.7)");
  const [legendBackgroundColor, setLegendBackgroundColor] = useState("rgba(255, 255, 255, 0)");
  const [legendTextColor, setLegendTextColor] = useState("#000000");
  const [dataLineColors, setDataLineColors] = useState(["#FFD700", "#FF4500", "#f26122", "#1E90FF", "#104E8B", "#3CB371"]);
  const [showLegend, setShowLegend] = useState(true);
  const [skipZeroes, setSkipZeroes] = useState(false);
  const [staggered, setStaggered] = useState(true);
  const [delay, setDelay] = useState(1);
  const [curved, setCurved] = useState(false);
  const [showHorizontalGridLines, setShowHorizontalGridLines] = useState(true);
  const [horizontalGridLineColor, setHorizontalGridLineColor] = useState("#e0e0e0");
  const [useFirstColumnAsX, setUseFirstColumnAsX] = useState(false);
  const [showDecimals, setShowDecimals] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [yAxisPadding, setYAxisPadding] = useState(0.1);
  const [xAxisPadding, setXAxisPadding] = useState(0.05);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [xAxisTitle, setXAxisTitle] = useState("X Axis");
  const [yAxisTitle, setYAxisTitle] = useState("Y Axis");
  const [axisTitleColor, setAxisTitleColor] = useState("#000000");
  const [tableData, setTableData] = useState<{ id: string; name: string; value: number }[]>([]);
  const [completedAnimations, setCompletedAnimations] = useState<Set<string>>(new Set());
  const [isZoomed, setIsZoomed] = useState(false);
  const [loadedData, setLoadedData] = useState<DataSeries[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [maxValueAxis, setMaxValueAxis] = useState<'x' | 'y'>('x');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        Papa.parse(csvText, {
          complete: (result) => {
            const parsedData = result.data as string[][];
            setRawData(parsedData);
            const series: DataSeries[] = [];
            
            if (parsedData.length > 1) {
              const headers = parsedData[0];
              const startIndex = useFirstColumnAsX ? 1 : 0;
              const xAxisLabels = useFirstColumnAsX ? parsedData.slice(1).map(row => row[0]) : null;
              
              for (let i = startIndex; i < (headers?.length ?? 0); i++) {
                const dataPoints = parsedData.slice(1).map((row: string[], rowIndex: number) => {
                  if (!row || row.length === 0) return null;

                  const x = useFirstColumnAsX ? parseFloat(row[0] ?? '') : rowIndex;
                  const y = parseFloat(row[i] ?? '');
                  return { 
                    x: isNaN(x) ? rowIndex : x, 
                    y: isNaN(y) ? null : y
                  };
                }).filter((point): point is { x: number; y: number } => point !== null)
                
                if (dataPoints.length > 0) {
                  series.push({
                    title: headers?.[i] ?? '',
                    label: headers?.[i] ?? '',
                    labelComponent: <ImageLabelComponent src={`/images/${headers?.[i] ?? ''}.png`}/>,
                    color: dataLineColors[(i - startIndex) % dataLineColors.length],
                    data: dataPoints,
                    xAxisLabels: xAxisLabels,
                    animationDuration: 4,
                    labelPosition: "top"
                  } as DataSeries);
                }
              }
            }
            
            setLoadedData(series);
            setIsDataLoaded(true);
          },
          error: (error: Error) => console.error("Error:", error),
          header: false,
          dynamicTyping: false,
          skipEmptyLines: true,
          delimiter: ",",
        });
      };
      reader.readAsText(file);
    }
  };

  const handleStartAnimation = () => {
    setData(loadedData);
    setTableData([]);
  };

  const handleRestartAnimation = () => {
    setData([]);
    setTableData([]);
    setTimeout(() => {
      setData(loadedData);
    }, 100);
  };

  const handleAnimationComplete = useCallback((maxValue: { id: string; name: string; value: number }) => {
    setTableData(prevData => {
      // Check if this animation has already been completed
      if (!completedAnimations.has(maxValue.id)) {
        setCompletedAnimations(prev => new Set(prev).add(maxValue.id));
        // Only add the new entry if it doesn't already exist
        if (!prevData.some(item => item.id === maxValue.id)) {
          return [...prevData, maxValue];
        }
      }
      return prevData;
    });
  }, [completedAnimations]);

  return (
    <div className="mx-auto mt-8 px-4">
      <ChartControls
        yAxisPadding={yAxisPadding}
        xAxisPadding={xAxisPadding}
        setYAxisPadding={setYAxisPadding}
        setXAxisPadding={setXAxisPadding}
        showHorizontalGridLines={showHorizontalGridLines}
        horizontalGridLineColor={horizontalGridLineColor}
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
        setShowHorizontalGridLines={setShowHorizontalGridLines}
        setHorizontalGridLineColor={setHorizontalGridLineColor}
        useFirstColumnAsX={useFirstColumnAsX}
        setUseFirstColumnAsX={setUseFirstColumnAsX}
        showDecimals={showDecimals}
        setShowDecimals={setShowDecimals}
        decimalPlaces={decimalPlaces}
        setDecimalPlaces={setDecimalPlaces}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        isZoomed={isZoomed}
        setIsZoomed={setIsZoomed}
        xAxisTitle={xAxisTitle}
        yAxisTitle={yAxisTitle}
        axisTitleColor={axisTitleColor}
        setXAxisTitle={setXAxisTitle}
        setYAxisTitle={setYAxisTitle}
        setAxisTitleColor={setAxisTitleColor}
        setMaxValueAxis={setMaxValueAxis}
        maxValueAxis={maxValueAxis}
      />

      {isDataLoaded && (
        <div className="mb-4 space-x-4">
          <Button onClick={handleStartAnimation}>
            Start Animation
          </Button>
          <Button onClick={handleRestartAnimation}>
            Restart Animation
          </Button>
        </div>
      )}

      {data.length > 0 && data.some(series => series.data.length > 0) ? (
        <div className="flex ">
          <div className="w-[80%]">
            <LineChart
              aspectRatio={16 / 6}
              maxValueAxis={maxValueAxis}
              minHeight={400}
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
              showHorizontalGridLines={showHorizontalGridLines}
              horizontalGridLineColor={horizontalGridLineColor}
              useFirstColumnAsX={useFirstColumnAsX}
              showDecimals={showDecimals}
              decimalPlaces={decimalPlaces}
              strokeWidth={strokeWidth}
              onAnimationComplete={handleAnimationComplete}
              isZoomed={isZoomed}
              xAxisTitle={xAxisTitle}
              yAxisTitle={yAxisTitle}
              axisTitleColor={axisTitleColor}
            />
          </div>
          <div className="w-[20%]">
            <AnimatedTable data={tableData} decimalPlaces={decimalPlaces} lowerIsBetter={true} />
          </div>
        </div>
      ) : (
        <p className="h-[90vh]">No valid data to display. Please upload a CSV file with numeric data and click &quot;Start Animation&quot;.</p>
      )}
    </div>
  );
}
