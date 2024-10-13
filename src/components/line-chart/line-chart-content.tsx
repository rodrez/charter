import React from 'react';
import { useLineChart } from './line-chart-context';

export const LineChartContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { margin } = useLineChart();

  return (
    <g transform={`translate(${margin.left},${margin.top})`}>
      {children}
    </g>
  );
};
