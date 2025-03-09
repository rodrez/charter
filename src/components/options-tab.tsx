import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from './ui/input';

interface OptionsTabProps {
  showLegend: boolean;
  staggered: boolean;
  delay: number;
  curved: boolean;
  skipZeroes: boolean;
  showHorizontalGridLines: boolean;
  yAxisPadding: number;
  xAxisPadding: number;
  sortDelay: number;
  lowerIsBetter: boolean;
  setShowLegend: (show: boolean) => void;
  setSkipZeroes: (skip: boolean) => void;
  setShowHorizontalGridLines: (show: boolean) => void;
  setStaggered: (staggered: boolean) => void;
  setDelay: (delay: number) => void;
  setCurved: (curved: boolean) => void;
  setSortDelay: (delay: number) => void;
  setLowerIsBetter: (lower: boolean) => void;
  useFirstColumnAsX: boolean;
  setUseFirstColumnAsX: (use: boolean) => void;
  showDecimals: boolean;
  decimalPlaces: number;
  setShowDecimals: (show: boolean) => void;
  setDecimalPlaces: (places: number) => void;
  setYAxisPadding: (padding: number) => void;
  setXAxisPadding: (padding: number) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
  xAxisTitle: string;
  yAxisTitle: string;
  setXAxisTitle: (title: string) => void;
  setYAxisTitle: (title: string) => void;
  maxValueAxis: 'x' | 'y';
  setMaxValueAxis: (axis: 'x' | 'y') => void;
}

const OptionsTab: React.FC<OptionsTabProps> = ({
  maxValueAxis,
  setMaxValueAxis,
  isZoomed,
  setIsZoomed,
  showLegend,
  staggered,
  delay,
  curved,
  skipZeroes,
  showHorizontalGridLines,
  setShowLegend,
  setSkipZeroes,
  setShowHorizontalGridLines,
  setStaggered,
  setDelay,
  setCurved,
  useFirstColumnAsX,
  setUseFirstColumnAsX,
  showDecimals,
  decimalPlaces,
  setShowDecimals,
  setDecimalPlaces,
  yAxisPadding,
  xAxisPadding,
  setYAxisPadding,
  setXAxisPadding,
  strokeWidth,
  setStrokeWidth,
  xAxisTitle,
  yAxisTitle,
  setXAxisTitle,
  setYAxisTitle,
  sortDelay,
  setSortDelay,
  lowerIsBetter,
  setLowerIsBetter,
}) => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Chart Display</h3>
        <div className="grid grid-cols-2 gap-4">
          <SwitchOption id="show-legend" checked={showLegend} onCheckedChange={setShowLegend} label="Show Legend" />
          <SwitchOption id="curved" checked={curved} onCheckedChange={setCurved} label="Curved Lines" />
          <SwitchOption id="show-horizontal-grid-lines" checked={showHorizontalGridLines} onCheckedChange={setShowHorizontalGridLines} label="Horizontal Grid Lines" />
          <SwitchOption id="is-zoomed" checked={isZoomed} onCheckedChange={setIsZoomed} label="Zoom to Data" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Handling</h3>
        <div className="grid grid-cols-2 gap-4">
          <SwitchOption id="skip-zeroes" checked={skipZeroes} onCheckedChange={setSkipZeroes} label="Skip Zero Values" />
          <SwitchOption id="use-first-column-as-x" checked={useFirstColumnAsX} onCheckedChange={setUseFirstColumnAsX} label="Use First Column as X" />
          <SwitchOption id="show-decimals" checked={showDecimals} onCheckedChange={setShowDecimals} label="Show Decimals" />
          <NumberInput id="decimal-places" value={decimalPlaces} onChange={setDecimalPlaces} label="Decimal Places" />
          <Input id="x-axis-title" value={xAxisTitle} onChange={(e) => setXAxisTitle(e.target.value)} />
          <Input id="y-axis-title" value={yAxisTitle} onChange={(e) => setYAxisTitle(e.target.value)} />
          <div className="flex items-center space-x-2">
            <Label htmlFor="max-value-axis">Max Value Axis for Table</Label>
            <SwitchOption id="max-value-axis" checked={maxValueAxis === 'x'} onCheckedChange={(checked) => setMaxValueAxis(checked ? 'x' : 'y')} label={maxValueAxis === 'x' ? 'Using X Axis' : 'Using Y Axis'} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Animation</h3>
        <div className="grid grid-cols-2 gap-4">
          <SwitchOption id="staggered" checked={staggered} onCheckedChange={setStaggered} label="Staggered" />
          <NumberInput id="delay" value={delay} onChange={setDelay} label="Delay" />
          <NumberInput id="sort-delay" value={sortDelay} onChange={setSortDelay} label="Table Animation Duration" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Table Options</h3>
        <div className="grid grid-cols-2 gap-4">
          <SwitchOption id="lower-is-better" checked={lowerIsBetter} onCheckedChange={setLowerIsBetter} label="Lower Values Are Better" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Chart Customization</h3>
        <div className="grid grid-cols-2 gap-4">
          <NumberInput id="y-axis-padding" value={yAxisPadding} onChange={setYAxisPadding} label="Y Axis Padding" />
          <NumberInput id="x-axis-padding" value={xAxisPadding} onChange={setXAxisPadding} label="X Axis Padding" />
          <NumberInput id="stroke-width" value={strokeWidth} onChange={setStrokeWidth} label="Stroke Width" />
        </div>
      </div>
    </div>
  );
};

// Helper components
const SwitchOption: React.FC<{ id: string; checked: boolean; onCheckedChange: (checked: boolean) => void; label: string }> = ({ id, checked, onCheckedChange, label }) => (
  <div className="flex items-center space-x-2">
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

const NumberInput: React.FC<{ id: string; value: number; onChange: (value: number) => void; label: string }> = ({ id, value, onChange, label }) => (
  <div className="flex flex-col space-y-1">
    <Label htmlFor={id}>{label}</Label>
    <Input type="number" id={id} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))} />
  </div>
);

export default OptionsTab;
