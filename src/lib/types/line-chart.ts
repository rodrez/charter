import type { ReactNode } from 'react';

export interface DataSeries {
  title: string;
  color: string;
  data: { x: number; y: number }[];
  label: string | ReactNode;
  animationDuration: number;
  labelPosition?: "top" | "bottom" | "left" | "right" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  labelBackgroundColor?: string;
}

export interface LineChartProps {
  children?: React.ReactNode;
  maxValueAxis: 'x' | 'y';
  dataSeries: DataSeries[];
  staggered?: boolean;
  delay?: number;
  sortDelay?: number;
  curved?: boolean;
  showLegend?: boolean;
  axisColor?: string;
  labelColor?: string;
  skipZeroes?: boolean;
  labelBackgroundColor?: string;
  chartBackgroundColor?: string;
  legendBackgroundColor?: string;
  legendTextColor?: string;
  dataLineColors?: string[];
  showHorizontalGridLines?: boolean;
  horizontalGridLineColor?: string;
  useFirstColumnAsX?: boolean;
  showDecimals?: boolean;
  decimalPlaces?: number;
  yAxisPadding?: number;
  xAxisPadding?: number;
  strokeWidth?: number;
  onAnimationComplete?: (maxValues: { id: string; name: string; value: number }) => void;
  isZoomed?: boolean;
  aspectRatio?: number;
  minHeight?: number | string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  axisTitleColor?: string;
}
