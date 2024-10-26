"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Papa from "papaparse";
import ChartControls from "@/components/chart-controls";
import type { DataSeries } from "@/lib/types/line-chart";
import LineChart from "@/components/line-chart/line-chart";
import Image from "next/image";
import AnimatedTable from "./rank-table";
import { Button } from "@/components/ui/button"; 
import { useAnimationStore, useChartStore } from '@/lib/store';

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

// Create a new component for the render count
const RenderCounter = () => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
  });

  return (
    <div className="fixed top-1 left-1 bg-black/50 rounded-md text-white p-2 z-50">
      Render count: {renderCount.current}
    </div>
  );
};

export default function TestPage() {
  const chartState = useChartStore();
  const [data, setData] = useState<DataSeries[]>([]);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [tableData, setTableData] = useState<{ id: string; name: string; value: number }[]>([]);
  const [completedAnimations, setCompletedAnimations] = useState<Set<string>>(new Set());
  const [loadedData, setLoadedData] = useState<DataSeries[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  const [isExpandedBeforeAnimation, setIsExpandedBeforeAnimation] = useState(false);
  const [activeView, setActiveView] = useState<'both' | 'chart' | 'table'>('chart');
  const renderCount = useRef(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const isLineBeingAnimated = useAnimationStore(state => state.isLineBeingAnimated);
  const focusedSeries = useAnimationStore(state => state.focusedSeries);
  useEffect(() => {
    renderCount.current += 1;
  });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        console.log('Chart container size:', entry.contentRect);
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

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
              const startIndex = chartState.useFirstColumnAsX ? 1 : 0;
              const xAxisLabels = chartState.useFirstColumnAsX ? parsedData.slice(1).map(row => row[0]) : null;
              
              for (let i = startIndex; i < (headers?.length ?? 0); i++) {
                const dataPoints = parsedData.slice(1).map((row: string[], rowIndex: number) => {
                  if (!row || row.length === 0) return null;

                  const x = chartState.useFirstColumnAsX ? parseFloat(row[0] ?? '') : rowIndex;
                  const y = parseFloat(row[i] ?? '');
                  return { 
                    x: isNaN(x) ? rowIndex : x, 
                    y: isNaN(y) || y === 0 ? null : y  // Change here: exclude y values that are 0
                  };
                }).filter((point): point is { x: number; y: number } => point !== null && point.y !== null)  // Change here: ensure y is not null
                
                if (dataPoints.length > 0) {
                  series.push({
                    title: headers?.[i] ?? '',
                    label: headers?.[i] ?? '',
                    labelComponent: <ImageLabelComponent src={`/images/${headers?.[i] ?? ''}.png`}/>,
                    color: chartState.dataLineColors[(i - startIndex) % chartState.dataLineColors.length],
                    data: dataPoints,
                    xAxisLabels: xAxisLabels,
                    animationDuration: 4,
                    labelPosition: "right"
                  } as DataSeries);
                }
              }
            }
            
            setLoadedData(series.filter(s => s.data.length > 0));
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

  const handleExpandBeforeAnimation = () => {
    setIsExpandedBeforeAnimation(true);
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Start animation after a short delay to allow for smooth transition
    setTimeout(() => {
      handleStartAnimation();
    }, 500); // Adjust this delay as needed
  };

  const handleStartAnimation = () => {
    console.log('loadedData', loadedData);
    setData(loadedData);
    // Only reset table data if we're not in table-only view
    if (activeView !== 'table') {
      setTableData([]);
    }
    setIsAnimationStarted(true);
  };

  const handleRestartAnimation = useCallback(() => {
    setIsAnimationStarted(false);
    setData([]);
    // Only reset table data if we're not in table-only view
    if (activeView !== 'table') {
      setTableData([]);
    }
    setCompletedAnimations(new Set());

    requestAnimationFrame(() => {
      setIsAnimationStarted(true);
      setData(loadedData);
    });
  }, [loadedData, activeView]);

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

  useEffect(() => {
    if (isAnimationStarted) {
      // Scroll to the chart when animation starts
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAnimationStarted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveView('both');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleView = () => {
    setActiveView(current => {
      switch (current) {
        case 'chart': return 'both';
        case 'both': return 'table';
        case 'table': return 'chart';
      }
    });
  };

  const exportToJson = () => {
    const jsonString = JSON.stringify(chartState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart_state.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const importedState = JSON.parse(content);
          chartState.setChartState(importedState);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Modify the effect to handle delayed table data population
  useEffect(() => {
    if (isAnimationStarted && activeView === 'table' && loadedData.length > 0) {
      // Reset table data first
      setTableData([]);

      // Wait for 1 second before starting the animation 
      setTimeout(() => {
        // Process and add entries with delay
        loadedData.forEach((series, index) => {
        const lastDataPoint = series.data[series.data.length - 1];
        const entry = {
          id: series.title,
          name: series.title,
          value: lastDataPoint.y
        };
        
        // Use the same delay as the chart animation
        setTimeout(() => {
          setTableData(prev => [...prev, entry]);
        }, index * (chartState.delay * 1000)); // Convert delay to milliseconds
        });
      }, 1000);
    }
  }, [isAnimationStarted, activeView, loadedData, chartState.delay])

  return (
    <div className={`mx-auto ${isExpandedBeforeAnimation || isAnimationStarted ? 'mt-0 px-0' : 'mt-8 px-4'}`}>

      {!isAnimationStarted && (
        <>
          <ChartControls
            importFromJson={importFromJson}
            yAxisPadding={chartState.yAxisPadding}
            xAxisPadding={chartState.xAxisPadding}
            setYAxisPadding={(padding) => chartState.setChartState({ yAxisPadding: padding })}
            setXAxisPadding={(padding) => chartState.setChartState({ xAxisPadding: padding })}
            showHorizontalGridLines={chartState.showHorizontalGridLines}
            horizontalGridLineColor={chartState.horizontalGridLineColor}
            data={data}
            rawData={rawData}
            handleFileUpload={handleFileUpload}
            chartBackgroundColor={chartState.chartBackgroundColor}
            axisColor={chartState.axisColor}
            labelColor={chartState.labelColor}
            labelBackgroundColor={chartState.labelBackgroundColor}
            legendBackgroundColor={chartState.legendBackgroundColor}
            legendTextColor={chartState.legendTextColor}
            dataLineColors={chartState.dataLineColors}
            showLegend={chartState.showLegend}
            skipZeroes={chartState.skipZeroes}
            staggered={chartState.staggered}
            delay={chartState.delay}
            curved={chartState.curved}
            setChartBackgroundColor={(color) => chartState.setChartState({ chartBackgroundColor: color })}
            setAxisColor={(color) => chartState.setChartState({ axisColor: color })}
            setLabelColor={(color) => chartState.setChartState({ labelColor: color })}
            setLabelBackgroundColor={(color) => chartState.setChartState({ labelBackgroundColor: color })}
            setLegendBackgroundColor={(color) => chartState.setChartState({ legendBackgroundColor: color })}
            setLegendTextColor={(color) => chartState.setChartState({ legendTextColor: color })}
            setDataLineColors={(colors) => chartState.setChartState({ dataLineColors: colors })}
            setShowLegend={(show) => chartState.setChartState({ showLegend: show })}
            setSkipZeroes={(skip) => chartState.setChartState({ skipZeroes: skip })}
            setStaggered={(staggered) => chartState.setChartState({ staggered: staggered })}
            setDelay={(delay) => chartState.setChartState({ delay: delay })}
            setCurved={(curved) => chartState.setChartState({ curved: curved })}
            setShowHorizontalGridLines={(show) => chartState.setChartState({ showHorizontalGridLines: show })}
            setHorizontalGridLineColor={(color) => chartState.setChartState({ horizontalGridLineColor: color })}
            useFirstColumnAsX={chartState.useFirstColumnAsX}
            setUseFirstColumnAsX={(use) => chartState.setChartState({ useFirstColumnAsX: use })}
            showDecimals={chartState.showDecimals}
            setShowDecimals={(show) => chartState.setChartState({ showDecimals: show })}
            decimalPlaces={chartState.decimalPlaces}
            setDecimalPlaces={(places) => chartState.setChartState({ decimalPlaces: places })}
            strokeWidth={chartState.strokeWidth}
            setStrokeWidth={(width) => chartState.setChartState({ strokeWidth: width })}
            isZoomed={chartState.isZoomed}
            setIsZoomed={(isZoomed) => chartState.setChartState({ isZoomed: isZoomed })}
            xAxisTitle={chartState.xAxisTitle}
            yAxisTitle={chartState.yAxisTitle}
            axisTitleColor={chartState.axisTitleColor}
            setXAxisTitle={(title) => chartState.setChartState({ xAxisTitle: title })}
            setYAxisTitle={(title) => chartState.setChartState({ yAxisTitle: title })}
            setAxisTitleColor={(color) => chartState.setChartState({ axisTitleColor: color })}
            setMaxValueAxis={(maxValueAxis) => chartState.setChartState({ maxValueAxis: maxValueAxis })}
            maxValueAxis={chartState.maxValueAxis}
          />

          {isDataLoaded && (
            <div className="mb-4 space-x-4">
              <Button onClick={handleExpandBeforeAnimation}>
                Start Animation
              </Button>
              <Button onClick={exportToJson}>
                Export to JSON
              </Button>
            </div>
          )}
        </>
      )}

      {data.length > 0 && data.some(series => series.data.length > 0) ? (
        <div 
          className={`flex flex-col ${isExpandedBeforeAnimation || isAnimationStarted ? 'h-screen w-[99%] mx-auto my-1' : ''}`}
          style={{ minHeight: '400px' }} // Ensure a minimum height
        >
          {isLineBeingAnimated ? (
            <div className="fixed top-1 rounded-md left-40 px-2 py-1 bg-black/50 z-50">
              <p className="text-white text-sm ">Not animating yet</p>
            </div>
          ) : (
            <div className="fixed top-1 rounded-md left-40 px-2 py-1 bg-black/50 z-50">
              <p className="text-white text-sm">Animating...</p>
            </div>
          )}
          {focusedSeries !== null && (
            <div className="fixed top-1 rounded-md left-64 px-2 py-1 bg-black/50 z-50">
              <p className="text-white text-sm">Focused on {focusedSeries}</p>
            </div>
          )}
          {isAnimationStarted && (
            <div className="flex justify-end space-x-2 mb-2">
              <Button onClick={toggleView}>
                {activeView === 'chart' ? 'Show Both' : 
                 activeView === 'both' ? 'Show Table Only' : 
                 'Show Chart Only'}
              </Button>
              <Button onClick={handleRestartAnimation}>
                Restart Animation
              </Button>
            </div>
          )}
          <div className="flex h-[calc(100%-40px)]">
            {activeView !== 'table' && (
              <div 
                ref={chartContainerRef}
                className={`${activeView === 'both' ? 'w-[75%]' : 'w-full'} h-full`}
                style={{ minWidth: '200px', minHeight: '200px' }} // Ensure minimum dimensions
              >
                <RenderCounter />
                <LineChart
                  aspectRatio={activeView === 'both' ? 16/9 : 21/9} // Wider aspect ratio when full screen
                  maxValueAxis={chartState.maxValueAxis}
                  minHeight={activeView === 'both' ? '84%' : '82%'} // Taller when full screen
                  dataSeries={data}
                  showLegend={chartState.showLegend}
                  staggered={chartState.staggered}
                  delay={chartState.delay}
                  axisColor={chartState.axisColor}
                  labelColor={chartState.labelColor}
                  skipZeroes={chartState.skipZeroes}
                  labelBackgroundColor={chartState.labelBackgroundColor}
                  chartBackgroundColor={chartState.chartBackgroundColor}
                  legendBackgroundColor={chartState.legendBackgroundColor}
                  legendTextColor={chartState.legendTextColor}
                  dataLineColors={chartState.dataLineColors}
                  curved={chartState.curved}
                  showHorizontalGridLines={chartState.showHorizontalGridLines}
                  horizontalGridLineColor={chartState.horizontalGridLineColor}
                  useFirstColumnAsX={chartState.useFirstColumnAsX}
                  showDecimals={chartState.showDecimals}
                  decimalPlaces={chartState.decimalPlaces}
                  strokeWidth={chartState.strokeWidth}
                  onAnimationComplete={handleAnimationComplete}
                  isZoomed={chartState.isZoomed}
                  xAxisTitle={chartState.xAxisTitle}
                  yAxisTitle={chartState.yAxisTitle}
                  axisTitleColor={chartState.axisTitleColor}
                  // isExpanded={isExpandedBeforeAnimation || isAnimationStarted}
                />
              </div>
            )}
            
            {isAnimationStarted && activeView !== 'chart' && (
              <div className={`${
                activeView === 'both' ? 'w-[25%]' : 'w-[50%]'
              } h-full overflow-auto mx-auto mt-4`}>
                <AnimatedTable 
                  data={tableData} 
                  decimalPlaces={chartState.decimalPlaces} 
                  lowerIsBetter={true} 
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="h-[90vh]">No valid data to display. Please upload a CSV file with numeric data and click "Start Animation".</p>
      )}
    </div>
  );
}
