import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTab from './data-tab';
import PreviewTab from './preview-tab';
import ColorsTab from './colors-tab';
import OptionsTab from './options-tab';

interface ChartControlsProps {
  data: any[];
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
}

const ChartControls: React.FC<ChartControlsProps> = ({
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
            <DataTab data={data} handleFileUpload={handleFileUpload} />
          </TabsContent>
          <TabsContent value="preview">
            <PreviewTab rawData={rawData} />
          </TabsContent>
          <TabsContent value="colors">
            <ColorsTab
              chartBackgroundColor={chartBackgroundColor}
              axisColor={axisColor}
              labelColor={labelColor}
              labelBackgroundColor={labelBackgroundColor}
              legendBackgroundColor={legendBackgroundColor}
              legendTextColor={legendTextColor}
              dataLineColors={dataLineColors}
              setChartBackgroundColor={setChartBackgroundColor}
              setAxisColor={setAxisColor}
              horizontalGridLineColor={horizontalGridLineColor}
              setHorizontalGridLineColor={setHorizontalGridLineColor}
              setLabelColor={setLabelColor}
              setLabelBackgroundColor={setLabelBackgroundColor}
              setLegendBackgroundColor={setLegendBackgroundColor}
              setLegendTextColor={setLegendTextColor}
              setDataLineColors={setDataLineColors}
            />
          </TabsContent>
          <TabsContent value="options">
            <OptionsTab
              yAxisPadding={yAxisPadding}
              xAxisPadding={xAxisPadding}
              showLegend={showLegend}
              staggered={staggered}
              delay={delay}
              curved={curved}
              skipZeroes={skipZeroes}
              showHorizontalGridLines={showHorizontalGridLines}
              setShowLegend={setShowLegend}
              isZoomed={isZoomed}
              setIsZoomed={setIsZoomed}
              setSkipZeroes={setSkipZeroes}
              setStaggered={setStaggered}
              setDelay={setDelay}
              setCurved={setCurved}
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
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChartControls;
