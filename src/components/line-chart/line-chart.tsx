import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { LineChartProps } from "@/lib/types/line-chart";
import styles from './line-chart.module.css';
import { useDebounceResize } from '@/lib/hooks/useDebounceResize';
import { useAnimationStore } from "@/lib/store";

const MARGIN = { top: 20, right: 40, bottom: 50, left: 60 }; // Moved outside the component

const LineChart: React.FC<LineChartProps> = ({
  dataSeries,
  staggered = false,
  delay = 0.5,
  curved = false,
  showLegend = true,
  axisColor = "black",
  labelColor = "white",
  skipZeroes = false,
  labelBackgroundColor = 'rgba(0, 0, 0, 0.6)',
  chartBackgroundColor = "white",
  legendBackgroundColor = "white",
  legendTextColor = "black",
  dataLineColors = ["#0074D9", "#000000", "#2ECC40", "#FF4136", "#7FDBFF"],
  showHorizontalGridLines = true,
  horizontalGridLineColor = "#e0e0e0",
  useFirstColumnAsX = false,
  showDecimals: initialShowDecimals = false,
  decimalPlaces: initialDecimalPlaces = 2,
  yAxisPadding = 0.1,
  xAxisPadding = 0.05,
  strokeWidth = 2,
  onAnimationComplete,
  isZoomed,
  aspectRatio = 16 / 6,
  minHeight = 400,
  xAxisTitle = "X Axis",
  yAxisTitle = "Y Axis",
  axisTitleColor = "black",
  maxValueAxis = 'y',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth, height: windowHeight } = useDebounceResize();
  const [showDecimals, setShowDecimals] = useState(initialShowDecimals);
  const [decimalPlaces, setDecimalPlaces] = useState(initialDecimalPlaces);
  const [focusedSeries, setFocusedSeries] = useState<number | null>(null);
  const [currentlyAnimatingSeries, setCurrentlyAnimatingSeries] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const onAnimationCompleteRef = useRef(onAnimationComplete);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    console.log('Window dimensions:', { windowWidth, windowHeight });
  }, [windowWidth, windowHeight]);

  const dimensions = useMemo(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      console.log('Container width:', width);
      let height: number;

      if (typeof minHeight === 'string' && minHeight.endsWith('%')) {
        const percentage = parseFloat(minHeight) / 100;
        height = Math.max((width / aspectRatio) * 0.6, windowHeight * percentage);
      } else {
        const minHeightNumber = typeof minHeight === 'string' ? parseFloat(minHeight) : minHeight;
        height = Math.max((width / aspectRatio) * 0.6, minHeightNumber);
      }

      console.log('Calculated dimensions before adjustment:', { width, height });

      return { 
        width: Math.max(1, width), // Ensure minimum width of 1
        height: Math.max(1, height + MARGIN.top + MARGIN.bottom) // Ensure minimum height of 1
      };
    }
    return { width: 1, height: 1 }; // Default to 1x1 if container not available
  }, [windowWidth, windowHeight, aspectRatio, minHeight]);

  useEffect(() => {
    console.log('Final dimensions:', dimensions);
  }, [dimensions]);

  const safeWidth = Math.max(1, dimensions.width);
  const safeHeight = Math.max(1, dimensions.height);

  useEffect(() => {
    console.log('Safe dimensions:', { width: safeWidth, height: safeHeight });
  }, [safeWidth, safeHeight]);

  const width = dimensions.width - MARGIN.left - MARGIN.right;
  const height = dimensions.height - MARGIN.top - MARGIN.bottom;

  const controls = useAnimation();

  // Update the DataSeries interface
  interface DataSeries {
    data: { x: number; y: number }[];
    label?: string;
    labelComponent?: React.ReactNode;
    labelPosition?: string;
    labelBackgroundColor?: string;
    animationDuration?: number;
    title?: string;
  }

  // Update the type of dataSeries
  const updatedDataSeries = useMemo(() => dataSeries as DataSeries[], [dataSeries]);

  // Modify the formatAxisValue function to use the state values
  const formatAxisValue = useCallback((value: number): string => {
    if (!showDecimals && Number.isInteger(value)) {
      return value.toString();
    } else {
      return value.toFixed(decimalPlaces);
    }
  }, [showDecimals, decimalPlaces]);

  // Modify the useMemo hook for pathDataArray, yMax, xMin, and xMax
  const { pathDataArray, yMin, yMax, xMin, xMax } = useMemo(() => {
    if (!updatedDataSeries || updatedDataSeries.length === 0)
      return { pathDataArray: [], yMin: 0, yMax: 0, xMin: 0, xMax: 0 };

    const allXValues = updatedDataSeries.flatMap(series => series.data.map(point => point.x));
    const allYValues = updatedDataSeries.flatMap(series => series.data.map(point => point.y));

    let xMin = Math.min(...allXValues);
    let xMax = Math.max(...allXValues);
    let yMin = Math.min(...allYValues.filter(value => !skipZeroes || value !== 0));
    let yMax = Math.max(...allYValues.filter(value => !skipZeroes || value !== 0));

    // Add padding to yMin and yMax if zoomed
    if (isZoomed) {
      const yRange = yMax - yMin;
      yMin = yMin - yRange * yAxisPadding;
      yMax = yMax + yRange * yAxisPadding;
    } else {
      yMin = 0; // Reset to 0 for full view
      yMax = yMax * (1 + yAxisPadding);
    }

    // Add padding to xMin and xMax
    const xRange = xMax - xMin;
    xMin = xMin - xRange * xAxisPadding;
    xMax = xMax + xRange * xAxisPadding;

    const xScale = width / (xMax - xMin);
    const yScale = height / (yMax - yMin);

    const pathDataArray = updatedDataSeries.map((series, index) => {
      const points = series.data
        .filter(point => !skipZeroes || point.y !== 0)
        .map(point => ({
          x: (point.x - xMin) * xScale,
          y: height - (point.y - yMin) * yScale,
        }));

      const pathData = points.reduce((path, point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        }

        if (curved && index > 0) {
          const prevPoint = points[index - 1];
          if (prevPoint) {
            const midX = (prevPoint.x + point.x) / 2;
            return `${path} C ${midX} ${prevPoint.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
          }
        }
        return `${path} L ${point.x} ${point.y}`;
      }, "");

      return {
        ...series,
        pathData,
        startPoint: points[0],
        endPoint: points[points.length - 1],
        color: dataLineColors[index % dataLineColors.length],
      };
    });

    return { pathDataArray, yMin, yMax, xMin, xMax };
  }, [updatedDataSeries, width, height, curved, skipZeroes, dataLineColors, yAxisPadding, xAxisPadding, isZoomed]);

  // Update the yAxisTicks generation
  const yAxisTicks = useMemo(() => {
    const tickCount = 5;
    return Array.from({ length: tickCount }, (_, i) => {
      const value = yMin + ((yMax - yMin) / (tickCount - 1)) * i;
      const y = height - ((value - yMin) / (yMax - yMin)) * height;
      return { value, y };
    });
  }, [yMin, yMax, height ]);

  // Update the xAxisTicks generation
  const xAxisTicks = useMemo(() => {
    const tickCount = 5;
    return Array.from({ length: tickCount }, (_, i) => {
      const value = xMin + ((xMax - xMin) / (tickCount - 1)) * i;
      const x = ((value - xMin) / (xMax - xMin)) * width;
      return { value, x };
    });
  }, [xMin, xMax, width]);

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [animationProgress, setAnimationProgress] = useState<number[]>(
    Array(updatedDataSeries.length).fill(0),
  );

  const getPointAtLength = (path: SVGPathElement, length: number) => {
    const point = path.getPointAtLength(length);
    return { x: point.x, y: point.y };
  };

  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const animateLines = async () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
  
      console.log('Animation started in LineChart');
      setIsAnimating(true);
  
      if (staggered) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
  
        for (let i = 0; i < pathDataArray.length; i++) {
          setCurrentlyAnimatingSeries(i);
          setFocusedSeries(i);
          useAnimationStore.setState({ focusedSeries: i });
  
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve, 2500));
          }
  
          useAnimationStore.setState({ isLineBeingAnimated: true });
          await controls.start(i.toString());
  
          if (pathDataArray[i]) {
            onAnimationCompleteRef.current?.({
              id: `series-${i}`,
              name: pathDataArray[i]?.title ?? `Series ${i + 1}`,
              value: Math.max(...(pathDataArray[i]?.data?.map((point) => point[maxValueAxis]) ?? [])),
            });
          }
  
          useAnimationStore.setState({ isLineBeingAnimated: false });
  
          if (i < pathDataArray.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } else {
        setCurrentlyAnimatingSeries(null);
        await controls.start("all");
        useAnimationStore.setState({ isLineBeingAnimated: false });
      }
  
      setCurrentlyAnimatingSeries(null);
      setIsAnimating(false);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      isAnimatingRef.current = false;
      setFocusedSeries(null);
      useAnimationStore.setState({ focusedSeries: null });
      useAnimationStore.setState({ isLineBeingAnimated: false });
    };
  
    if (pathDataArray.length > 0 && !isAnimatingRef.current) {
      void animateLines();
    }
  
    // Remove or adjust the cleanup function
    // return () => {
    //   isAnimatingRef.current = false;
    // };
  }, [pathDataArray, staggered, delay, controls, maxValueAxis]);
  


  // Memoize the axis elements
  const axisElements = useMemo(() => {
    return (
      <>
        {/* X-axis */}
        <line x1="0" y1={height} x2={width} y2={height} stroke={axisColor} />

        {/* Y-axis */}
        <line x1="0" y1="0" x2="0" y2={height} stroke={axisColor} />

        {/* Y-axis ticks and labels */}
        {yAxisTicks.map(({ value, y }) => (
          <g key={value}>
            <line x1="-5" y1={y} x2="0" y2={y} stroke={axisColor} />
            <motion.text 
              x="-10" 
              y={y} 
              dominantBaseline="middle" 
              textAnchor="end" 
              fontSize="12" 
              fill={axisColor}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              key={`${value}-${showDecimals}-${decimalPlaces}`}
            >
              {formatAxisValue(value)}
            </motion.text>

            {/* Render horizontal grid lines if the prop is true */}
            {showHorizontalGridLines && (
              <line
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke={horizontalGridLineColor}
                strokeDasharray="5,5"
              />
            )}
          </g>
        ))}

        {/* X-axis title */}
        <text
          x={width / 2}
          y={height + MARGIN.bottom - 10} // Adjusted position
          textAnchor="middle"
          fill={axisTitleColor}
          fontSize="14"
          
        >
          {xAxisTitle}
        </text>

        {/* Y-axis title */}
        <text
          x={-height / 2}
          y={-MARGIN.left + 15}
          textAnchor="middle"
          fill={axisTitleColor}
          fontSize="14"
          transform={`rotate(-90) translate(0, -5)`}
        >
          {yAxisTitle}
        </text>
      </>
    );
  }, [height, width, axisColor, yAxisTicks, showHorizontalGridLines, horizontalGridLineColor, formatAxisValue, xAxisTitle, yAxisTitle, axisTitleColor, MARGIN.bottom, MARGIN.left, showDecimals, decimalPlaces]);

  const [labelDimensions, setLabelDimensions] = useState<Record<number, { width: number, height: number }>>({});

  useEffect(() => {
    // Calculate label dimensions after the component mounts
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);
    
    const dimensions: Record<number, { width: number, height: number }> = {};
    pathDataArray.forEach((series, index) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = series.label ?? ''; // Use empty string as fallback
      text.setAttribute('font-size', '12px');
      svg.appendChild(text);
      const bbox = text.getBBox();
      dimensions[index] = { width: bbox.width, height: bbox.height };
      svg.removeChild(text);
    });
    
    document.body.removeChild(svg);
    setLabelDimensions(dimensions);
  }, [pathDataArray]);

  const adjustLabelPosition = (labelX: number, labelY: number, boxWidth: number, boxHeight: number) => {
    const padding = 5; // Padding from chart edges
    
    // Adjust X position
    if (labelX - boxWidth / 2 < padding) {
      labelX = boxWidth / 2 + padding;
    } else if (labelX + boxWidth / 2 > width - padding) {
      labelX = width - boxWidth / 2 - padding;
    }
    
    // Adjust Y position
    if (labelY - boxHeight / 2 < padding) {
      labelY = boxHeight / 2 + padding;
    } else if (labelY + boxHeight / 2 > height - padding) {
      labelY = height - boxHeight / 2 - padding;
    }
    
    return { labelX, labelY };
  };

  const handleLegendClick = (index: number) => {
    if (!isAnimating) {
      setFocusedSeries(focusedSeries === index ? null : index);
    }
  };

  // Modify the sortedPathDataArray to consider both focusedSeries and currentlyAnimatingSeries
  const sortedPathDataArray = useMemo(() => {
    if (focusedSeries === null && currentlyAnimatingSeries === null) return pathDataArray;
    const activeIndex = currentlyAnimatingSeries ?? focusedSeries;
    return [
      ...pathDataArray.filter((_, index) => index !== activeIndex),
      ...(activeIndex !== null && activeIndex < pathDataArray.length ? [pathDataArray[activeIndex]] : [])
    ];
  }, [pathDataArray, focusedSeries, currentlyAnimatingSeries]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${safeHeight}px` }}>
      <svg
        width={safeWidth}
        height={safeHeight}
        viewBox={`0 0 ${safeWidth} ${safeHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x="0"
          y="0"
          width={safeWidth}
          height={safeHeight}
          fill={chartBackgroundColor}
        />
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {axisElements}
          {useFirstColumnAsX && xAxisTicks.map(({ value, x }) => (
            <g key={value} transform={`translate(${x}, ${height})`}>
              <line y2="5" stroke={axisColor} />
              <motion.text 
                y="20" 
                textAnchor="middle" 
                fontSize="12" 
                fill={axisColor}
                transform={`translate(0, ${showDecimals || !Number.isInteger(value) ? 5 : 0})`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                key={`${value}-${showDecimals}-${decimalPlaces}`}
              >
                {formatAxisValue(value)}
              </motion.text>
            </g>
          ))}

          {/* Chart lines and labels */}
          {sortedPathDataArray.map((series) => {
            const originalIndex = pathDataArray.findIndex(s => s === series);
            if (originalIndex === -1 || !series) return null; 
            return (
              <g key={originalIndex}>
                <motion.path
                  ref={(el) => {
                    if (el) pathRefs.current[originalIndex] = el;
                  }}
                  d={series.pathData}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={strokeWidth}
                  initial={{ pathLength: 0 }}
                  animate={controls}
                  variants={{
                    all: { pathLength: 1 },
                    [originalIndex.toString()]: { pathLength: 1 },
                  }}
                  transition={{
                    duration: series.animationDuration ?? 4,
                    ease: "easeInOut",
                  }}
                  onUpdate={(latest) => {
                    setAnimationProgress((prev: number[]): number[] => {
                      const newProgress = [...prev];
                      newProgress[originalIndex] = latest.pathLength as number;
                      return newProgress;
                    });
                  }}
                  className={
                    (focusedSeries === null && currentlyAnimatingSeries === null) || 
                    focusedSeries === originalIndex || 
                    currentlyAnimatingSeries === originalIndex 
                      ? '' 
                      : styles.unfocused
                  }
                />
                {pathRefs.current[originalIndex] && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={
                      (focusedSeries === null && currentlyAnimatingSeries === null) || 
                      focusedSeries === originalIndex || 
                      currentlyAnimatingSeries === originalIndex 
                        ? '' 
                        : styles.unfocused
                    }
                  >
                    {(() => {
                      const path = pathRefs.current[originalIndex];
                      if (!path) return null;

                      const progress = animationProgress[originalIndex] ?? 0;
                      const { x, y } = getPointAtLength(
                        path,
                        progress * path.getTotalLength(),
                      );

                      // Only render the label if there's progress
                      if (progress > 0) {
                        let labelX = x;
                        let labelY = y;
                        const labelDim = labelDimensions[originalIndex] ?? { width: 60, height: 20 };
                        const padding = 6;
                        const boxWidth = Math.max(labelDim.width, 100) + padding * 2;
                        const boxHeight = Math.max(labelDim.height, 40) + padding * 2;

                        switch (series.labelPosition) {
                          case "top":
                            labelY -= boxHeight / 2 + 10;
                            break;
                          case "bottom":
                            labelY += boxHeight / 2 + 10;
                            break;
                          case "left":
                            labelX -= boxWidth / 2 + 10;
                            break;
                          case "right":
                            labelX += boxWidth / 2 + 10;
                            break;
                          case "topLeft":
                            labelX -= boxWidth / 2 + 5;
                            labelY -= boxHeight / 2 + 5;
                            break;
                          case "topRight":
                            labelX += boxWidth / 2 + 5;
                            labelY -= boxHeight / 2 + 5;
                            break;
                          case "bottomLeft":
                            labelX -= boxWidth / 2 + 5;
                            labelY += boxHeight / 2 + 5;
                            break;
                          case "bottomRight":
                            labelX += boxWidth / 2 + 5;
                            labelY += boxHeight / 2 + 5;
                            break;
                        }

                        // Adjust label position to stay within chart boundaries
                        ({ labelX, labelY } = adjustLabelPosition(labelX, labelY, boxWidth, boxHeight));

                        return (
                          <>
                            <circle cx={x} cy={y} r="4" fill={series.color} />
                            <g transform={`translate(${labelX}, ${labelY})`}>
                              <rect
                                x={-boxWidth / 2}
                                y={-boxHeight / 2}
                                width={boxWidth}
                                height={boxHeight}
                                rx="4"
                                ry="4"
                                fill={series.labelBackgroundColor ?? labelBackgroundColor}
                              />
                              {/* Render the labelComponent if provided */}
                              {series.labelComponent ? (
                                <foreignObject
                                  x={-boxWidth / 2}
                                  y={-boxHeight / 2}
                                  width={boxWidth}
                                  height={boxHeight}
                                >
                                  <div
                                    className={
                                      (focusedSeries === null && currentlyAnimatingSeries === null) || 
                                      focusedSeries === originalIndex || 
                                      currentlyAnimatingSeries === originalIndex 
                                        ? '' 
                                        : styles.unfocused
                                    }
                                  >
                                    {series.labelComponent}
                                  </div>
                                </foreignObject>
                              ) : (
                                <text
                                  x="0"
                                  y="0"
                                  dy="0.35em"
                                  textAnchor="middle"
                                  fontSize="12"
                                  fill={labelColor}
                                >
                                  {series.label ?? ''}
                                </text>
                              )}
                            </g>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </motion.g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <AnimatePresence>
            {showLegend && (
              <motion.g
                transform={`translate(${width / 2}, 10)`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={-width / 2 + MARGIN.left}
                  y="-25"
                  width={width - MARGIN.left - MARGIN.right}
                  height="40"
                  fill={legendBackgroundColor}
                  rx="5"
                  ry="5"
                />
                {pathDataArray.map((series, index) => {
                  const itemWidth = Math.min(150, (width - MARGIN.left - MARGIN.right) / pathDataArray.length);
                  const totalWidth = pathDataArray.length * itemWidth;
                  const startX = -totalWidth / 2;
                  return (
                    <g
                      key={index}
                      transform={`translate(${startX + index * itemWidth}, 0)`}
                      onClick={() => handleLegendClick(index)}
                      style={{ cursor: !isAnimating ? "pointer" : "default" }}
                      className={
                        (focusedSeries === null && !isAnimating) || 
                        focusedSeries === index || 
                        currentlyAnimatingSeries === index 
                          ? '' 
                          : styles.unfocused
                      }
                    >
                      <rect
                        width="10"
                        height="10"
                        fill={series.color}
                        rx="2"
                        ry="2"
                      />
                      <text
                        x="15"
                        y="9"
                        fontSize="12"
                        fill={legendTextColor}
                      >
                        {(series.title ?? 'Untitled').length > 15 
                          ? (series.title ?? 'Untitled').substring(0, 15) + '...' 
                          : (series.title ?? 'Untitled')}
                      </text>
                    </g>
                  );
                })}
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      </svg>
    </div>
  );
};

export default LineChart;
