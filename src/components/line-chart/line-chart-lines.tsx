import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from "framer-motion";
import { useLineChart } from './line-chart-context';

export const LineChartLines: React.FC = () => {
  const { pathDataArray, staggered, delay, labelColor, labelBackgroundColor, height, width } = useLineChart();
  const controls = useAnimation();
  const pathRefs = useRef([]);
  const [animationProgress, setAnimationProgress] = useState(Array(pathDataArray.length).fill(0));
  const [labelDimensions, setLabelDimensions] = useState<{ [key: number]: { width: number, height: number } }>({});

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

  const getPointAtLength = (path, length) => {
    const point = path.getPointAtLength(length);
    return { x: point.x, y: point.y };
  };

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

  return (
    <>
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
              duration: series.animationDuration || 4,
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
                  const labelDim = labelDimensions[index] || { width: 60, height: 20 };
                  const padding = 6;
                  const boxWidth = labelDim.width + padding * 2;
                  const boxHeight = labelDim.height + padding * 2;

                  // ... (existing label positioning logic)

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
                      </g>
                    </>
                  );
                }
                return null;
              })()}
            </motion.g>
          )}
        </g>
      ))}
    </>
  );
};
