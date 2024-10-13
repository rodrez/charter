import React, { useMemo, useEffect, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { LineChartProps } from "@/lib/types/line-chart";
import styles from './line-chart.module.css';

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
  dataLineColors = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF"],
  showHorizontalGridLines = true,
  horizontalGridLineColor = "#e0e0e0",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: width * 0.5, // Adjust this ratio as needed
        });
      }
    };

    handleResize(); // Initial size

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const width = dimensions.width - margin.left - margin.right;
  const height = dimensions.height - margin.top - margin.bottom;

  const controls = useAnimation();

  // Modify dataSeries to include labelComponent
  interface DataSeries {
    data: number[];
    label?: string;
    labelComponent?: React.ReactNode;
    labelPosition?: string;
    labelBackgroundColor?: string;
    animationDuration?: number;
    title?: string;
  }

  // Update the type of dataSeries
  const updatedDataSeries = dataSeries as DataSeries[];

  // Generate the path data and find overall yMax
  const { pathDataArray, yMax } = useMemo(() => {
    if (!updatedDataSeries || updatedDataSeries.length === 0)
      return { pathDataArray: [], yMax: 0 };

    const xStep = width / (updatedDataSeries[0].data.length - 1);
    const yMax = Math.max(
      ...updatedDataSeries.flatMap((series) =>
        series.data.filter((value) => !skipZeroes || value !== 0)
      )
    );
    const yScale = height / yMax;

    const pathDataArray = updatedDataSeries.map((series, index) => {
      const points = series.data
        .map((value, index) => ({
          x: index * xStep,
          y: value === 0 ? null : height - value * yScale,
        }))
        .filter((point) => point.y !== null);

      const pathData = points.reduce((path, point, index, array) => {
        if (index === 0 || (index > 0 && array[index - 1].y === null)) {
          return `${path} M ${point.x} ${point.y}`;
        }

        if (curved) {
          const prevPoint = array[index - 1];
          const midX = (prevPoint.x + point.x) / 2;
          return `${path} C ${midX} ${prevPoint.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
        } else {
          return `${path} L ${point.x} ${point.y}`;
        }
      }, "");

      return {
        ...series,
        pathData,
        startPoint: points[0],
        endPoint: points[points.length - 1],
        color: dataLineColors[index % dataLineColors.length], // Use color from dataLineColors
      };
    });

    return { pathDataArray, yMax };
  }, [updatedDataSeries, width, height, curved, skipZeroes, dataLineColors]);

  // Generate y-axis ticks
  const yAxisTicks = useMemo(() => {
    const tickCount = 5;
    return Array.from({ length: tickCount }, (_, i) => {
      const value = (yMax / (tickCount - 1)) * i;
      const y = height - (value / yMax) * height;
      return { value: Math.round(value), y };
    });
  }, [yMax, height]);

  const pathRefs = useRef([]);
  const [animationProgress, setAnimationProgress] = useState(
    Array(updatedDataSeries.length).fill(0),
  );

  const getPointAtLength = (path, length) => {
    const point = path.getPointAtLength(length);
    return { x: point.x, y: point.y };
  };

  useEffect(() => {
    const animateLines = async () => {
      if (staggered) {
        for (let i = 0; i < pathDataArray.length; i++) {
          await controls.start(i.toString());
          if (i < pathDataArray.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          }
        }
      } else {
        await controls.start("all");
      }
    };

    animateLines();
  }, [controls, pathDataArray, staggered, delay]);


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
            <text x="-10" y={y} dy="0.32em" textAnchor="end" fontSize="12" fill={axisColor}>
              {value}
            </text>

            {/* Render horizontal grid lines if the prop is true */}
            {showHorizontalGridLines && (
              <line
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke={horizontalGridLineColor}
                strokeDasharray="5,5" // Optional: makes the grid lines dashed
              />
            )}
          </g>
        ))}
      </>
    );
  }, [height, width, axisColor, yAxisTicks, showHorizontalGridLines, horizontalGridLineColor]);

  const [labelDimensions, setLabelDimensions] = useState<{ [key: number]: { width: number, height: number } }>({});

  useEffect(() => {
    // Calculate label dimensions after the component mounts
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);
    
    const dimensions = {};
    pathDataArray.forEach((series, index) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = series.label;
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

  const [focusedSeries, setFocusedSeries] = useState<number | null>(null);

  const handleLegendClick = (index: number) => {
    setFocusedSeries(focusedSeries === index ? null : index);
  };

  // Sort the pathDataArray to bring the focused series to the end (top)
  const sortedPathDataArray = useMemo(() => {
    if (focusedSeries === null) return pathDataArray;
    return [
      ...pathDataArray.filter((_, index) => index !== focusedSeries),
      pathDataArray[focusedSeries]
    ];
  }, [pathDataArray, focusedSeries]);

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x="0"
          y="0"
          width={dimensions.width}
          height={dimensions.height}
          fill={chartBackgroundColor}
        />
        <g transform={`translate(${margin.left},${margin.top})`}>
          {axisElements}

          {/* Chart lines and labels */}
          {sortedPathDataArray.map((series, index) => {
            const originalIndex = pathDataArray.indexOf(series);
            return (
              <g 
                key={originalIndex} 
                className={focusedSeries === null || focusedSeries === originalIndex ? '' : styles.unfocused}
              >
                <motion.path
                  ref={(el) => (pathRefs.current[originalIndex] = el)}
                  d={series.pathData}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={controls}
                  variants={{
                    all: { pathLength: 1 },
                    [originalIndex.toString()]: { pathLength: 1 },
                  }}
                  transition={{
                    duration: series.animationDuration || 4,
                    ease: "easeInOut",
                  }}
                  onUpdate={(latest) => {
                    setAnimationProgress((prev) => {
                      const newProgress = [...prev];
                      newProgress[originalIndex] = latest.pathLength;
                      return newProgress;
                    });
                  }}
                />
                {pathRefs.current[originalIndex] && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {(() => {
                      const path = pathRefs.current[originalIndex];
                      const progress = animationProgress[originalIndex];
                      const { x, y } = getPointAtLength(
                        path,
                        progress * path.getTotalLength(),
                      );

                      // Only render the label if there's progress
                      if (progress > 0) {
                        let labelX = x;
                        let labelY = y;
                        const labelDim = labelDimensions[originalIndex] || { width: 60, height: 20 };
                        const padding = 6;
                        const boxWidth = labelDim.width + padding * 2;
                        const boxHeight = labelDim.height + padding * 2;

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
                                fill={series.labelBackgroundColor || labelBackgroundColor}
                              />
                              {/* Render the labelComponent if provided */}
                              {series.labelComponent ? (
                                <foreignObject
                                  x={-boxWidth / 2 + padding}
                                  y={-boxHeight / 2 + padding}
                                  width={boxWidth - padding * 1.5}
                                  height={boxHeight - padding * 1.5}
                                >
                                  <div
                                    xmlns="http://www.w3.org/1999/xhtml"
                                    style={{ textAlign: 'center' }}
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
                                  {series.label}
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
                transform={`translate(${width - 100}, 0)`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x="-10"
                  y="-5"
                  width="110"
                  height={pathDataArray.length * 20 + 10}
                  fill={legendBackgroundColor}
                  rx="5"
                  ry="5"
                />
                {pathDataArray.map((series, index) => (
                  <g
                    key={index}
                    transform={`translate(0, ${index * 20})`}
                    onClick={() => handleLegendClick(index)}
                    style={{ cursor: "pointer" }}
                    className={focusedSeries === null || focusedSeries === index ? '' : styles.unfocused}
                  >
                    <rect
                      width="10"
                      height="10"
                      fill={series.color}
                    />
                    <text
                      x="15"
                      y="9"
                      fontSize="12"
                      fill={legendTextColor}
                    >
                      {series.title || 'Untitled'}
                    </text>
                  </g>
                ))}
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      </svg>
    </div>
  );
};

export default LineChart;