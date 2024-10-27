import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChartState {
  chartBackgroundColor: string;
  axisColor: string;
  labelColor: string;
  labelBackgroundColor: string;
  legendBackgroundColor: string;
  legendTextColor: string;
  dataLineColors: string[];
  showLegend: boolean;
  skipZeroes: boolean;
  staggered: boolean;
  delay: number;
  curved: boolean;
  showHorizontalGridLines: boolean;
  horizontalGridLineColor: string;
  useFirstColumnAsX: boolean;
  showDecimals: boolean;
  decimalPlaces: number;
  yAxisPadding: number;
  xAxisPadding: number;
  strokeWidth: number;
  xAxisTitle: string;
  yAxisTitle: string;
  axisTitleColor: string;
  isZoomed: boolean;
  maxValueAxis: 'x' | 'y';
  setChartState: (state: Partial<ChartState>) => void;
}

export const useChartStore = create(
  persist<ChartState>(
    (set) => ({
      chartBackgroundColor: "#ffffff",
      axisColor: "#000000",
      labelColor: "#000000",
      labelBackgroundColor: "rgba(255, 255, 255, 0.7)",
      legendBackgroundColor: "rgba(255, 255, 255, 0)",
      legendTextColor: "#000000",
      // ["#0074D9", "#000000", "#2ECC40", "#FF4136", "#7FDBFF"],
      dataLineColors: ["#FFD700", "#000000", "#f26122", "#1E90FF", "#104E8B", "#3CB371"],
      showLegend: true,
      skipZeroes: false,
      staggered: true,
      delay: 1,
      curved: false,
      showHorizontalGridLines: true,
      horizontalGridLineColor: "#e0e0e0",
      useFirstColumnAsX: false,
      showDecimals: false,
      decimalPlaces: 2,
      yAxisPadding: 0.1,
      xAxisPadding: 0.05,
      strokeWidth: 2,
      xAxisTitle: "X Axis",
      yAxisTitle: "Y Axis",
      axisTitleColor: "#000000",
      isZoomed: false,
      maxValueAxis: 'x',
      setChartState: (state) => set(state),
    }),
    {
      name: 'chart-storage',
    }
  )
);

// Store to track the animation state
export const useAnimationStore = create<{
  isLineBeingAnimated: boolean;
  setIsLineBeingAnimated: (state: boolean) => void;
  focusedSeries: number | null;
  setFocusedSeries: (series: number | null) => void;
}>((set) => ({
  // We want to know if a line is being animated
  isLineBeingAnimated: false,
  focusedSeries: null,
  setIsLineBeingAnimated: (state: boolean) => set({ isLineBeingAnimated: state }),
  setFocusedSeries: (series: number | null) => set({ focusedSeries: series }),
}));
