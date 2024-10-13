import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLineChart } from './line-chart-context';

export const LineChartLegend: React.FC = () => {
  const { showLegend, width, pathDataArray, legendBackgroundColor, legendTextColor } = useLineChart();

  if (!showLegend) return null;

  return (
    <AnimatePresence>
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
          <g key={index} transform={`translate(0, ${index * 20})`}>
            <rect width="10" height="10" fill={series.color} />
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
    </AnimatePresence>
  );
};
