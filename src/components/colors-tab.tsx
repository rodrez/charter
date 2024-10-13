import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorsTabProps {
  chartBackgroundColor: string;
  axisColor: string;
  labelColor: string;
  labelBackgroundColor: string;
  legendBackgroundColor: string;
  legendTextColor: string;
  dataLineColors: string[];
  setChartBackgroundColor: (color: string) => void;
  setAxisColor: (color: string) => void;
  setLabelColor: (color: string) => void;
  setLabelBackgroundColor: (color: string) => void;
  setLegendBackgroundColor: (color: string) => void;
  setLegendTextColor: (color: string) => void;
  setDataLineColors: (colors: string[]) => void;
}

const ColorsTab: React.FC<ColorsTabProps> = ({
  chartBackgroundColor,
  axisColor,
  labelColor,
  labelBackgroundColor,
  legendBackgroundColor,
  legendTextColor,
  dataLineColors,
  setChartBackgroundColor,
  setAxisColor,
  setLabelColor,
  setLabelBackgroundColor,
  setLegendBackgroundColor,
  setLegendTextColor,
  setDataLineColors,
}) => {
  return (
    <Tabs defaultValue="chart">
      <TabsList>
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="legend">Legend</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>
      <TabsContent value="chart">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="chart-bg-color">Background:</Label>
            <Input
              id="chart-bg-color"
              type="color"
              value={chartBackgroundColor}
              onChange={(e) => setChartBackgroundColor(e.target.value)}
              className="h-10 w-14"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="axis-color">Axis:</Label>
            <Input
              id="axis-color"
              type="color"
              value={axisColor}
              onChange={(e) => setAxisColor(e.target.value)}
              className="h-10 w-14"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="label-color">Labels:</Label>
            <Input
              id="label-color"
              type="color"
              value={labelColor}
              onChange={(e) => setLabelColor(e.target.value)}
              className="h-10 w-14"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="label-bg-color">Label Background:</Label>
            <Input
              id="label-bg-color"
              type="color"
              value={labelBackgroundColor}
              onChange={(e) => setLabelBackgroundColor(e.target.value)}
              className="h-10 w-14"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="legend">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="legend-bg-color">Background:</Label>
            <Input
              id="legend-bg-color"
              type="color"
              value={legendBackgroundColor}
              onChange={(e) => setLegendBackgroundColor(e.target.value)}
              className="h-10 w-14"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="legend-text-color">Text:</Label>
            <Input
              id="legend-text-color"
              type="color"
              value={legendTextColor}
              onChange={(e) => setLegendTextColor(e.target.value)}
              className="h-10 w-14"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="data">
        <div className="grid grid-cols-3 gap-4">
          {dataLineColors.map((color, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Label htmlFor={`data-color-${index}`}>Line {index + 1}:</Label>
              <Input
                id={`data-color-${index}`}
                type="color"
                value={color}
                onChange={(e) => {
                  const newColors = [...dataLineColors];
                  newColors[index] = e.target.value;
                  setDataLineColors(newColors);
                }}
                className="h-10 w-14"
              />
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ColorsTab;
