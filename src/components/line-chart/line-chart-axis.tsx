import React from 'react';
import { useLineChart } from './line-chart-context';

export const LineChartAxis: React.FC = () => {
  const { width, height, axisColor, yAxisTicks } = useLineChart();

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
        </g>
      ))}
    </>
  );
};
