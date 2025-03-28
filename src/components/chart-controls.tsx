import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTab from './data-tab';
import PreviewTab from './preview-tab';
import ColorsTab from './colors-tab';
import OptionsTab from './options-tab';
import type { DataSeries } from '@/lib/types/line-chart';

interface ChartControlsProps {
  importFromJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxValueAxis: 'x' | 'y';
  setMaxValueAxis: (axis: 'x' | 'y') => void;
  data: DataSeries[];
  rawData: string[][];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  chartBackgroundColor: string;
  axisColor: string;
  labelColor: string;
  labelBackgroundColor: string;
  legendBackgroundColor: string;
  legendTextColor: string;
  dataLineColors: string[];
  showLegend: boolean;
  skipZeroes: boolean;
  setChartBackgroundColor: (color: string) => void;
  setAxisColor: (color: string) => void;
  setLabelColor: (color: string) => void;
  setLabelBackgroundColor: (color: string) => void;
  setLegendBackgroundColor: (color: string) => void;
  setLegendTextColor: (color: string) => void;
  setDataLineColors: (colors: string[]) => void;
  setShowLegend: (show: boolean) => void;
  setSkipZeroes: (skip: boolean) => void;
  showDecimals: boolean;
  decimalPlaces: number;
  setShowDecimals: (show: boolean) => void;
  setDecimalPlaces: (places: number) => void;
  staggered: boolean;
  delay: number;
  curved: boolean;
  setStaggered: (staggered: boolean) => void;
  setDelay: (delay: number) => void;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
  setCurved: (curved: boolean) => void;
  showHorizontalGridLines: boolean;
  setShowHorizontalGridLines: (show: boolean) => void;
  horizontalGridLineColor: string;
  setHorizontalGridLineColor: (color: string) => void;
  yAxisPadding: number;
  xAxisPadding: number;
  setYAxisPadding: (padding: number) => void;
  setXAxisPadding: (padding: number) => void;
  useFirstColumnAsX: boolean;
  setUseFirstColumnAsX: (use: boolean) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  xAxisTitle: string;
  yAxisTitle: string;
  axisTitleColor: string;
  setXAxisTitle: (title: string) => void;
  setYAxisTitle: (title: string) => void;
  setAxisTitleColor: (color: string) => void;
  sortDelay: number;
  setSortDelay: (delay: number) => void;
  lowerIsBetter: boolean;
  setLowerIsBetter: (lower: boolean) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  maxValueAxis,
  setMaxValueAxis,
  isZoomed,
  setIsZoomed,
  yAxisPadding,
  xAxisPadding,
  setYAxisPadding,
  setXAxisPadding,
  data,
  rawData,
  staggered,
  delay,
  curved,
  handleFileUpload,
  importFromJson,
  chartBackgroundColor,
  axisColor,
  labelColor,
  labelBackgroundColor,
  legendBackgroundColor,
  legendTextColor,
  dataLineColors,
  showLegend,
  skipZeroes,
  setChartBackgroundColor,
  setAxisColor,
  setLabelColor,
  setLabelBackgroundColor,
  setLegendBackgroundColor,
  setLegendTextColor,
  setDataLineColors,
  setShowLegend,
  setSkipZeroes,
  setStaggered,
  setDelay,
  setCurved,
  showHorizontalGridLines,
  setShowHorizontalGridLines,
  horizontalGridLineColor,
  setHorizontalGridLineColor,
  useFirstColumnAsX,
  setUseFirstColumnAsX,
  showDecimals,
  decimalPlaces,
  setShowDecimals,
  setDecimalPlaces,
  strokeWidth,
  setStrokeWidth,
  xAxisTitle,
  yAxisTitle,
  axisTitleColor,
  setXAxisTitle,
  setYAxisTitle,
  setAxisTitleColor,
  sortDelay,
  setSortDelay,
  lowerIsBetter,
  setLowerIsBetter,
}) => {
  return (
    <Card className="mb-8" style={{ backgroundColor: chartBackgroundColor }}>
      <CardHeader>
        <CardTitle>Chart Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>
          <TabsContent value="data">
            <DataTab data={data} handleFileUpload={handleFileUpload} importFromJson={importFromJson} />
            
          </TabsContent>
          <TabsContent value="preview">
            <PreviewTab rawData={rawData} />
          </TabsContent>
          <TabsContent value="colors">
            <ColorsTab
              chartBackgroundColor={chartBackgroundColor}
              axisTitleColor={axisTitleColor}
              setAxisTitleColor={setAxisTitleColor}
              axisColor={axisColor}
              labelColor={labelColor}
              labelBackgroundColor={labelBackgroundColor}
              legendBackgroundColor={legendBackgroundColor}
              legendTextColor={legendTextColor}
              dataLineColors={dataLineColors}
              horizontalGridLineColor={horizontalGridLineColor}
              setChartBackgroundColor={setChartBackgroundColor}
              setAxisColor={setAxisColor}
              setLabelColor={setLabelColor}
              setLabelBackgroundColor={setLabelBackgroundColor}
              setLegendBackgroundColor={setLegendBackgroundColor}
              setLegendTextColor={setLegendTextColor}
              setDataLineColors={setDataLineColors}
              setHorizontalGridLineColor={setHorizontalGridLineColor}
            />
          </TabsContent>
          <TabsContent value="options">
            <OptionsTab
              xAxisTitle={xAxisTitle}
              yAxisTitle={yAxisTitle}
              setXAxisTitle={setXAxisTitle}
              setYAxisTitle={setYAxisTitle}
              yAxisPadding={yAxisPadding}
              xAxisPadding={xAxisPadding}
              showLegend={showLegend}
              staggered={staggered}
              delay={delay}
              skipZeroes={skipZeroes}
              showHorizontalGridLines={showHorizontalGridLines}
              setShowLegend={setShowLegend}
              isZoomed={isZoomed}
              setIsZoomed={setIsZoomed}
              setSkipZeroes={setSkipZeroes}
              setStaggered={setStaggered}
              setDelay={setDelay}
              setCurved={setCurved}
              curved={curved}
              setShowHorizontalGridLines={setShowHorizontalGridLines}
              useFirstColumnAsX={useFirstColumnAsX}
              setUseFirstColumnAsX={setUseFirstColumnAsX}
              showDecimals={showDecimals}
              decimalPlaces={decimalPlaces}
              setShowDecimals={setShowDecimals}
              setDecimalPlaces={setDecimalPlaces}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              setYAxisPadding={setYAxisPadding}
              setXAxisPadding={setXAxisPadding}
              maxValueAxis={maxValueAxis}
              setMaxValueAxis={setMaxValueAxis}
              sortDelay={sortDelay}
              setSortDelay={setSortDelay}
              lowerIsBetter={lowerIsBetter}
              setLowerIsBetter={setLowerIsBetter}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChartControls;
