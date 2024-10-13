import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { LineChartProps } from "@/lib/types/line-chart";

interface LineChartContextType extends LineChartProps {
  dimensions: { width: number; height: number };
  setDimensions: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  margin: { top: number; right: number; bottom: number; left: number };
  width: number;
  height: number;
  yMax: number;
  pathDataArray: any[]; // Replace 'any' with a more specific type if possible
  yAxisTicks: { value: number; y: number }[];
}

const LineChartContext = createContext<LineChartContextType | undefined>(undefined);

export const useLineChart = () => {
  const context = useContext(LineChartContext);
  if (!context) {
    throw new Error('useLineChart must be used within a LineChartProvider');
  }
  return context;
};

export const LineChartProvider: React.FC<LineChartProps> = ({ children, ...props }) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const width = dimensions.width - margin.left - margin.right;
  const height = dimensions.height - margin.top - margin.bottom;

  const { pathDataArray, yMax } = useMemo(() => {
    const { dataSeries, curved, skipZeroes, dataLineColors } = props;
    
    let maxY = 0;
    const pathData = dataSeries.map((series, index) => {
      const lineData = series.data
        .map((point, i) => {
          if (skipZeroes && point.y === 0) return null;
          maxY = Math.max(maxY, point.y);
          return { x: (i / (series.data.length - 1)) * width, y: point.y };
        })
        .filter((point): point is { x: number; y: number } => point !== null);

      const path = curved
        ? // Implement curved path logic here
          `M ${lineData.map(d => `${d.x},${height - (d.y / maxY) * height}`).join(' L ')}`
        : // Implement straight path logic here
          `M ${lineData.map(d => `${d.x},${height - (d.y / maxY) * height}`).join(' L ')}`;

      return { path, color: dataLineColors[index] };
    });

    return { pathDataArray: pathData, yMax: maxY };
  }, [props.dataSeries, props.curved, props.skipZeroes, props.dataLineColors, width, height]);

  const yAxisTicks = useMemo(() => {
    const tickCount = 5;
    return Array.from({ length: tickCount }, (_, i) => ({
      value: (i / (tickCount - 1)) * yMax,
      y: height - (i / (tickCount - 1)) * height,
    }));
  }, [yMax, height]);

  const value = {
    ...props,
    dimensions,
    setDimensions,
    margin,
    width,
    height,
    yMax,
    pathDataArray,
    yAxisTicks,
  };

  return <LineChartContext.Provider value={value}>{children}</LineChartContext.Provider>;
};
