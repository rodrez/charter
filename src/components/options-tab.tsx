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
  horizontalGridLineColor: string;
  setShowLegend: (show: boolean) => void;
  setSkipZeroes: (skip: boolean) => void;
  setShowHorizontalGridLines: (show: boolean) => void;
  setHorizontalGridLineColor: (color: string) => void;
  setStaggered: (staggered: boolean) => void;
  setDelay: (delay: number) => void;
  setCurved: (curved: boolean) => void;
}

const OptionsTab: React.FC<OptionsTabProps> = ({
  showLegend,
  staggered,
  delay,
  curved,
  skipZeroes,
  showHorizontalGridLines,
  horizontalGridLineColor,
  setShowLegend,
  setSkipZeroes,
  setShowHorizontalGridLines,
  setHorizontalGridLineColor,
  setStaggered,
  setDelay,
  setCurved,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="show-legend"
          checked={showLegend}
          onCheckedChange={setShowLegend}
        />
        <Label htmlFor="show-legend">Show Legend</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="skip-zeroes"
          checked={skipZeroes}
          onCheckedChange={setSkipZeroes}
        />
        <Label htmlFor="skip-zeroes">Skip Zero Values</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="curved"
          checked={curved}
          onCheckedChange={setCurved}
        />
        <Label htmlFor="curved">Curved Lines</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="staggered"
          checked={staggered}
          onCheckedChange={setStaggered}
        />
        <Label htmlFor="staggered">Staggered</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="delay">Delay</Label>
        <Input type="number" id="delay" value={delay} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDelay(Number(e.target.value))} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-horizontal-grid-lines"
          checked={showHorizontalGridLines}
          onCheckedChange={setShowHorizontalGridLines}
        />
        <Label htmlFor="show-horizontal-grid-lines">Show Horizontal Grid Lines</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="horizontal-grid-line-color">Horizontal Grid Line Color</Label>
        <Input
          type="color"
          id="horizontal-grid-line-color"
          value={horizontalGridLineColor}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setHorizontalGridLineColor(e.target.value)
          }
        />
      </div>
    </div>
  );
};

export default OptionsTab;
