import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import type { FC } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { LineChartProps } from "@/lib/types/line-chart";
import styles from './line-chart.module.css';
import { useDebounceResize } from '@/lib/hooks/useDebounceResize';
import { useAnimationStore } from "@/lib/store";
import Watermark from "../watermark";
import { cn } from "@/lib/utils";

const MARGIN = { top: 20, right: 40, bottom: 50, left: 60 }; // Moved outside the component

const LineChart: FC<LineChartProps> = ({
  dataSeries,
  staggered = false,
  delay = 0.5,
  curved = false,
  showLegend = true,
  axisColor = "black",
  labelColor = "white",
  skipZeroes = false,
  labelBackgroundColor = 'rgba(0, 0, 0, 0.6)',
  // chartBackgroundColor = "white",
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
  // const [showDecimals, setShowDecimals] = useState(initialShowDecimals);
  // const [decimalPlaces, setDecimalPlaces] = useState(initialDecimalPlaces);
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
        const percentage = Number.parseFloat(minHeight) / 100;
        height = Math.max((width / aspectRatio) * 0.6, windowHeight * percentage);
      } else {
        const minHeightNumber = typeof minHeight === 'string' ? Number.parseFloat(minHeight) : minHeight;
        height = Math.max((width / aspectRatio) * 0.6, minHeightNumber);
      }

      console.log('Calculated dimensions before adjustment:', { width, height });

      return { 
        width: Math.max(1, width), // Ensure minimum width of 1
        height: Math.max(1, height + MARGIN.top + MARGIN.bottom) // Ensure minimum height of 1
      };
    }
    return { width: 1, height: 1 }; // Default to 1x1 if container not available
  }, [windowHeight, aspectRatio, minHeight]);

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
  const updatedDataSeries = useMemo(() => {
    console.log('Raw dataSeries:', dataSeries);
    return dataSeries as DataSeries[];
  }, [dataSeries]);

  // Update the formatAxisValue function to use the prop values directly
  const formatAxisValue = useCallback((value: number) => {
    if (!initialShowDecimals && Number.isInteger(value)) {
      return value.toString();
    } 
    
    return value.toFixed(initialDecimalPlaces);
  }, [initialShowDecimals, initialDecimalPlaces]);

  // Modify the useMemo hook for pathDataArray, yMax, xMin, and xMax
  const { pathDataArray, yMin, yMax, xMin, xMax } = useMemo(() => {
    if (!updatedDataSeries || updatedDataSeries.length === 0) {
      console.log('No data series available');
      return { pathDataArray: [], yMin: 0, yMax: 0, xMin: 0, xMax: 0 };
    }

    const allXValues = updatedDataSeries.flatMap(series => series.data.map(point => point.x));
    const allYValues = updatedDataSeries.flatMap(series => series.data.map(point => point.y));
    
    console.log('Data points:', { xValues: allXValues, yValues: allYValues });

    let xMin = Math.min(...allXValues);
    let xMax = Math.max(...allXValues);
    let yMin = Math.min(...allYValues.filter(value => !skipZeroes || value !== 0));
    let yMax = Math.max(...allYValues.filter(value => !skipZeroes || value !== 0));

    // Ensure xMin and yMin don't go below 0
    xMin = Math.max(0, xMin);
    yMin = Math.max(0, yMin);

    // Add padding to yMin and yMax if zoomed
    if (isZoomed) {
      const yRange = yMax - yMin;
      yMin = Math.max(0, yMin - yRange * yAxisPadding);
      yMax = yMax + yRange * yAxisPadding;
    } else {
      yMax = yMax * (1 + yAxisPadding);
    }

    // Add padding to xMin and xMax
    const xRange = xMax - xMin;
    xMin = Math.max(0, xMin - xRange * xAxisPadding);
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
  
  // Initialize path refs array when data changes
  useEffect(() => {
    pathRefs.current = Array(updatedDataSeries.length).fill(null);
  }, [updatedDataSeries.length]);

  const getPointAtLength = (path: SVGPathElement | null, length: number) => {
    if (!path) return { x: 0, y: 0 };
    const point = path.getPointAtLength(length);
    return { x: point.x, y: point.y };
  };

  const isAnimatingRef = useRef(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      // Ensure proper cleanup on unmount
      isAnimatingRef.current = false;
      isMountedRef.current = false;
      
      // Clean up animation state
      setFocusedSeries(null);
      setCurrentlyAnimatingSeries(null);
      setIsAnimating(false);
      setAnimationProgress(Array(updatedDataSeries.length).fill(0));
      
      // Ensure Framer Motion animation is properly cancelled
      controls.stop();
      
      // Reset global animation state
      useAnimationStore.setState({ 
        focusedSeries: null,
        isLineBeingAnimated: false
      });
    };
  }, [controls, updatedDataSeries.length]);

  useEffect(() => {
    const animateLines = async () => {
      if (isAnimatingRef.current || !isMountedRef.current) return;
      
      console.log('Animation started in LineChart. Path data array:', pathDataArray);
      
      // Set animation state
      isAnimatingRef.current = true;
      setIsAnimating(true);
      
      // Simple delay function
      const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      try {
        if (staggered) {
          // Animate each line one by one with timeout protection
          for (let i = 0; i < pathDataArray.length; i++) {
            if (!isMountedRef.current) break;
            
            console.log(`Animating series ${i}`);
            setCurrentlyAnimatingSeries(i);
            setFocusedSeries(i);
            useAnimationStore.setState({ 
              focusedSeries: i,
              isLineBeingAnimated: true 
            });
            
            // Use direct setState approach instead of framer-motion for more reliability
            setAnimationProgress((prev) => {
              const newProgress = [...prev];
              // Start with progress 0
              newProgress[i] = 0;
              return newProgress;
            });
            
            // Manually animate the path using timeouts instead of Framer Motion
            const steps = 20; // Number of animation steps
            const stepDuration = 100; // Duration of each step in ms
            const totalDuration = steps * stepDuration;
            
            console.log(`Starting manual animation of series ${i}`);
            
            // Manual animation loop with timeout protection
            for (let step = 1; step <= steps; step++) {
              if (!isMountedRef.current) break;
              
              const progress = step / steps;
              console.log(`Series ${i} animation progress: ${progress.toFixed(2)}`);
              
              setAnimationProgress((prev) => {
                const newProgress = [...prev];
                newProgress[i] = progress;
                return newProgress;
              });
              
              await waitMs(stepDuration);
            }
            
            // Ensure final state is set
            if (isMountedRef.current) {
              setAnimationProgress((prev) => {
                const newProgress = [...prev];
                newProgress[i] = 1;
                return newProgress;
              });
              
              // Report animation completion
              console.log(`Completed animation for series ${i}`);
              if (pathDataArray[i]) {
                onAnimationCompleteRef.current?.({
                  id: `series-${i}`,
                  name: pathDataArray[i]?.title ?? `Series ${i + 1}`,
                  value: Math.max(...(pathDataArray[i]?.data?.map((point) => point[maxValueAxis]) ?? [])),
                });
              }
            }
            
            // Wait before starting the next line
            if (i < pathDataArray.length - 1) {
              await waitMs(delay * 1000);
            }
          }
        } else {
          // Animate all lines simultaneously
          setCurrentlyAnimatingSeries(null);
          useAnimationStore.setState({ isLineBeingAnimated: true });
          
          console.log('Animating all lines simultaneously');
          
          // Manual animation for all lines simultaneously
          const steps = 20; // Number of animation steps
          const stepDuration = 100; // Duration of each step in ms
          
          // Reset all progress
          setAnimationProgress(Array(pathDataArray.length).fill(0));
          
          // Manual animation loop
          for (let step = 1; step <= steps; step++) {
            if (!isMountedRef.current) break;
            
            const progress = step / steps;
            console.log(`All series animation progress: ${progress.toFixed(2)}`);
            
            setAnimationProgress(Array(pathDataArray.length).fill(progress));
            
            await waitMs(stepDuration);
          }
          
          // Ensure final state
          if (isMountedRef.current) {
            setAnimationProgress(Array(pathDataArray.length).fill(1));
            
            // Report completion for all lines
            pathDataArray.forEach((series, i) => {
              if (isMountedRef.current) {
                onAnimationCompleteRef.current?.({
                  id: `series-${i}`,
                  name: series?.title ?? `Series ${i + 1}`,
                  value: Math.max(...(series?.data?.map((point) => point[maxValueAxis]) ?? [])),
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Animation error:', error);
      } finally {
        // Clean up animation state
        if (isMountedRef.current) {
          setCurrentlyAnimatingSeries(null);
          setIsAnimating(false);
          setFocusedSeries(null);
          useAnimationStore.setState({ 
            focusedSeries: null,
            isLineBeingAnimated: false 
          });
          isAnimatingRef.current = false;
          
          console.log('Animation complete, all states reset');
        }
      }
    };
    
    // Only run animation if component is mounted and data exists
    if (pathDataArray.length > 0 && !isAnimatingRef.current && isMountedRef.current) {
      console.log('Starting animation with pathDataArray:', pathDataArray.length);
      
      // Allow time for DOM to update before starting animation
      setTimeout(() => {
        void animateLines();
      }, 100);
    } else {
      console.log('Animation conditions not met:', {
        pathsExist: pathDataArray.length > 0,
        notAnimating: !isAnimatingRef.current,
        isMounted: isMountedRef.current
      });
    }
  }, [pathDataArray, staggered, delay, maxValueAxis]);
  


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
            <text 
              x="-10" 
              y={y} 
              dominantBaseline="middle" 
              textAnchor="end" 
              fontSize="12" 
              fill={axisColor}
              key={`${value}-${initialShowDecimals}-${initialDecimalPlaces}`}
            >
              {formatAxisValue(value)}
            </text>

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
          transform="rotate(-90) translate(0, -5)"
        >
          {yAxisTitle}
        </text>
      </>
    );
  }, [height, width, axisColor, yAxisTicks, showHorizontalGridLines, horizontalGridLineColor, formatAxisValue, xAxisTitle, yAxisTitle, axisTitleColor, initialShowDecimals, initialDecimalPlaces]);

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
    let adjustedLabelX = labelX;
    let adjustedLabelY = labelY;
    
    // Adjust X position
    if (adjustedLabelX - boxWidth / 2 < padding) {
      adjustedLabelX = boxWidth / 2 + padding;
    } else if (adjustedLabelX + boxWidth / 2 > width - padding) {
      adjustedLabelX = width - boxWidth / 2 - padding;
    }
    
    // Adjust Y position
    if (adjustedLabelY - boxHeight / 2 < padding) {
      adjustedLabelY = boxHeight / 2 + padding;
    } else if (adjustedLabelY + boxHeight / 2 > height - padding) {
      adjustedLabelY = height - boxHeight / 2 - padding;
    }
    
    return { labelX: adjustedLabelX, labelY: adjustedLabelY };
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
    <div
      className={cn(styles.lineChartContainer, 'bg-white')}
      ref={containerRef}
      style={{ width: "100%", aspectRatio: `${aspectRatio}` }}
    >
      <svg
        viewBox={`0 0 ${safeWidth} ${safeHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
        aria-label="Line chart visualization"
      >
        <title>Line Chart Visualization</title>
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Debug view */}
          {isAnimating && (
            <text x="10" y="-10" fontSize="12" fill="red">
              Animation Running: {currentlyAnimatingSeries !== null ? `Series ${currentlyAnimatingSeries}` : 'All'}
            </text>
          )}
        
          {axisElements}
          {useFirstColumnAsX && xAxisTicks.map(({ value, x }) => (
            <g key={value} transform={`translate(${x}, ${height})`}>
              <line y2="5" stroke={axisColor} />
              <text 
                y="20" 
                textAnchor="middle" 
                fontSize="12" 
                fill={axisColor}
                key={`${value}-${initialShowDecimals}-${initialDecimalPlaces}`}
              >
                {formatAxisValue(value)}
              </text>
            </g>
          ))}

          {/* Chart lines and labels */}
          {sortedPathDataArray.map((series) => {
            const originalIndex = pathDataArray.findIndex(s => s === series);
            if (originalIndex === -1 || !series) return null; 
            return (
              <g key={originalIndex}>
                <path
                  key={`line-${originalIndex}`}
                  ref={(el) => {
                    if (el) {
                      pathRefs.current[originalIndex] = el as SVGPathElement;
                    }
                  }}
                  d={series.pathData}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={pathRefs.current[originalIndex]?.getTotalLength() || 0}
                  strokeDashoffset={
                    (1 - (animationProgress[originalIndex] || 0)) * 
                    (pathRefs.current[originalIndex]?.getTotalLength() || 0)
                  }
                  className={
                    (focusedSeries === null && currentlyAnimatingSeries === null) || 
                    focusedSeries === originalIndex || 
                    currentlyAnimatingSeries === originalIndex 
                      ? styles.visiblePath 
                      : styles.unfocused
                  }
                />
                {pathRefs.current[originalIndex] && (
                  <g
                    className={
                      (focusedSeries === null && currentlyAnimatingSeries === null) || 
                      focusedSeries === originalIndex || 
                      currentlyAnimatingSeries === originalIndex 
                        ? styles.visiblePath 
                        : styles.unfocused
                    }
                  >
                    {(() => {
                      const path = pathRefs.current[originalIndex];
                      if (!path) return null;

                      const progress = animationProgress[originalIndex] ?? 0;
                      
                      // Only render the label if there's progress
                      if (progress <= 0) return null;
                      
                      const pathLength = path.getTotalLength();
                      const { x, y } = getPointAtLength(
                        path,
                        progress * pathLength,
                      );
                      
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

                      // Ensure boxWidth and boxHeight are positive
                      const safeBoxWidth = Math.max(1, boxWidth);
                      const safeBoxHeight = Math.max(1, boxHeight);

                      return (
                        <>
                          <circle cx={x} cy={y} r="4" fill={series.color} />
                          <g transform={`translate(${labelX}, ${labelY})`}>
                            <rect
                              x={-safeBoxWidth / 2}
                              y={-safeBoxHeight / 2}
                              width={safeBoxWidth}
                              height={safeBoxHeight}
                              rx="4"
                              ry="4"
                              fill={series.labelBackgroundColor ?? labelBackgroundColor}
                            />
                            {/* Render the labelComponent if provided */}
                            {series.labelComponent ? (
                              <foreignObject
                                x={-safeBoxWidth / 2}
                                y={-safeBoxHeight / 2}
                                width={safeBoxWidth}
                                height={safeBoxHeight}
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
                    })()}
                  </g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          {showLegend && (
            <g
              transform={`translate(${width / 2}, 10)`}
            >
              <rect
                x={-width / 2 + MARGIN.left}
                y="-25"
                width={Math.max(1, width - MARGIN.left - MARGIN.right)}
                height="40"
                fill={legendBackgroundColor}
                rx="5"
                ry="5"
              />
              {pathDataArray.map((series, index) => {
                const availableWidth = Math.max(1, width - MARGIN.left - MARGIN.right);
                const itemWidth = Math.max(1, Math.min(150, availableWidth / Math.max(1, pathDataArray.length)));
                const totalWidth = Math.max(1, pathDataArray.length * itemWidth);
                const startX = -totalWidth / 2;
                const seriesId = series.title ?? `series-${index}`;
                return (
                  <button
                    type="button"
                    key={seriesId}
                    onClick={() => handleLegendClick(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleLegendClick(index);
                        e.preventDefault();
                      }
                    }}
                    aria-label={`Toggle ${series.title ?? 'Untitled'} series`}
                    style={{ 
                      cursor: !isAnimating ? "pointer" : "default",
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      transform: `translate(${startX + index * itemWidth}, 0)`
                    }}
                    className={
                      (focusedSeries === null && !isAnimating) || 
                      focusedSeries === index || 
                      currentlyAnimatingSeries === index 
                        ? '' 
                        : styles.unfocused
                    }
                    disabled={isAnimating}
                  >
                    <svg width="100" height="20" aria-hidden="true">
                      <title>{series.title ?? `Series ${index + 1}`}</title>
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
                        {series.title ?? `Series ${index + 1}`}
                      </text>
                    </svg>
                  </button>
                );
              })}
              <text
                x="10"
                y={height + MARGIN.bottom - 35}
                fill={legendTextColor}
                fontSize="16"
                fontWeight="bold"
              >
                Legend
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default LineChart;
