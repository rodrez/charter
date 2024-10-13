import React, { useRef, useEffect, useCallback } from 'react';
import { useLineChart } from './line-chart-context';

export const LineChartFrame = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    const { dimensions, setDimensions, chartBackgroundColor, pathDataArray, yAxisTicks } = useLineChart();
    const containerRef = useRef<HTMLDivElement>(null);

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
    }, [setDimensions]);

    return (
      <div ref={ref} className={className}>
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
            {/* Chart elements */}
            <g transform={`translate(${margin.left},${margin.top})`}>
              {/* Y-axis */}
              {yAxisTicks.map((tick, index) => (
                <g key={index} transform={`translate(0,${tick.y})`}>
                  <line x2={width} stroke="#e0e0e0" />
                  <text x="-5" y="0" dy=".32em" textAnchor="end">{tick.value.toFixed(1)}</text>
                </g>
              ))}
              
              {/* X-axis */}
              <line y1={height} y2={height} x2={width} stroke="#e0e0e0" />
              
              {/* Data lines */}
              {pathDataArray.map((data, index) => (
                <path
                  key={index}
                  d={data.path}
                  fill="none"
                  stroke={data.color}
                  strokeWidth={2}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    );
  }
);
LineChartFrame.displayName = "LineChartFrame";
