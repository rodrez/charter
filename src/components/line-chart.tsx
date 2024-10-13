import React, { useMemo, useEffect, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

interface DataSeries {
  title: string;
  color: string;
  data: number[];
  label: string;
  animationDuration: number;
  labelPosition?: "top" | "bottom" | "left" | "right";
}

interface LineChartProps {
  dataSeries: DataSeries[];
  staggered?: boolean;
  delay?: number;
  curved?: boolean;
  showLegend?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  dataSeries,
  staggered = false,
  delay = 0.5,
  curved = false,
  showLegend = true,
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

  // Generate the path data and find overall yMax
  const { pathDataArray, yMax } = useMemo(() => {
    if (!dataSeries || dataSeries.length === 0)
      return { pathDataArray: [], yMax: 0 };

    const xStep = width / (dataSeries[0].data.length - 1);
    const yMax = Math.max(
      ...dataSeries.flatMap((series) =>
        series.data.filter((value) => value !== 0),
      ),
    );
    const yScale = height / yMax;

    const pathDataArray = dataSeries.map((series) => {
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
      };
    });

    return { pathDataArray, yMax };
  }, [dataSeries, width, height, curved]);

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
    Array(dataSeries.length).fill(0),
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

  const renderLabels = () => {
    return pathDataArray.map((series, index) => {
      const { endPoint, label, color, labelPosition = "right" } = series;
      if (!endPoint) return null;

      let x = endPoint.x;
      let y = endPoint.y;
      let textAnchor: "start" | "end" | "middle" = "start";
      let dy = "0.3em";

      switch (labelPosition) {
        case "top":
          y -= 10;
          textAnchor = "middle";
          dy = "1em";
          break;
        case "bottom":
          y += 10;
          textAnchor = "middle";
          dy = "-0.3em";
          break;
        case "left":
          x -= 10;
          textAnchor = "end";
          break;
        case "right":
        default:
          x += 10;
          break;
      }

      return (
        <text
          key={`label-${index}`}
          x={x}
          y={y}
          fill={color}
          textAnchor={textAnchor}
          dy={dy}
          fontSize="12px"
        >
          {label}
        </text>
      );
    });
  };

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* X-axis */}
          <line x1="0" y1={height} x2={width} y2={height} stroke="black" />

          {/* Y-axis */}
          <line x1="0" y1="0" x2="0" y2={height} stroke="black" />

          {/* Y-axis ticks and labels */}
          {yAxisTicks.map(({ value, y }) => (
            <g key={value}>
              <line x1="-5" y1={y} x2="0" y2={y} stroke="black" />
              <text x="-10" y={y} dy="0.32em" textAnchor="end" fontSize="12">
                {value}
              </text>
            </g>
          ))}

          {/* Chart lines and labels */}
          {pathDataArray.map((series, index) => (
            <g key={index}>
              <motion.path
                ref={(el) => (pathRefs.current[index] = el)}
                d={series.pathData}
                fill="none"
                stroke={series.color}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={controls}
                variants={{
                  all: { pathLength: 1 },
                  [index.toString()]: { pathLength: 1 },
                }}
                transition={{
                  duration: series.animationDuration || 4, // Use series-specific duration or default to 2
                  ease: "easeInOut",
                }}
                onUpdate={(latest) => {
                  setAnimationProgress((prev) => {
                    const newProgress = [...prev];
                    newProgress[index] = latest.pathLength;
                    return newProgress;
                  });
                }}
              />
              {pathRefs.current[index] && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {(() => {
                    const path = pathRefs.current[index];
                    const progress = animationProgress[index];
                    const { x, y } = getPointAtLength(
                      path,
                      progress * path.getTotalLength(),
                    );

                    // Only render the label if there's progress
                    if (progress > 0) {
                      let labelX = x;
                      let labelY = y;
                      let textAnchor: "start" | "end" | "middle" = "start";
                      let dy = "0.3em";

                      switch (series.labelPosition) {
                        case "top":
                          labelY -= 10;
                          textAnchor = "middle";
                          dy = "1em";
                          break;
                        case "bottom":
                          labelY += 10;
                          textAnchor = "middle";
                          dy = "-0.3em";
                          break;
                        case "left":
                          labelX -= 10;
                          textAnchor = "end";
                          break;
                        case "right":
                        default:
                          labelX += 10;
                          break;
                      }

                      return (
                        <>
                          <circle cx={x} cy={y} r="4" fill={series.color} />
                          <text
                            x={labelX}
                            y={labelY}
                            dy={dy}
                            textAnchor={textAnchor}
                            fontSize="12"
                            fill={series.color}
                          >
                            {series.label}
                          </text>
                        </>
                      );
                    }
                    return null;
                  })()}
                </motion.g>
              )}
            </g>
          ))}

          {/* Legend */}
          <AnimatePresence>
            {showLegend && (
              <motion.g
                transform={`translate(${width + 10}, 0)`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {pathDataArray.map((series, index) => (
                  <g key={index} transform={`translate(0, ${index * 20})`}>
                    <rect width="10" height="10" fill={series.color} />
                    <text x="15" y="9" fontSize="12">
                      {series.title}
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
