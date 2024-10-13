export interface DataSeries {
  title: string;
  color: string;
  data: number[];
  label: string;
  animationDuration: number;
  labelPosition?: "top" | "bottom" | "left" | "right" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  labelBackgroundColor?: string; // New property for custom background color
}

export interface LineChartProps {
  dataSeries: DataSeries[];
  staggered?: boolean;
  delay?: number;
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
}