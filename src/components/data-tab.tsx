import React from 'react';
import { Input } from "@/components/ui/input";

import type { DataSeries } from '@/lib/types/line-chart';

interface DataTabProps {
  data: DataSeries[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  importFromJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DataTab: React.FC<DataTabProps> = ({ data, handleFileUpload, importFromJson }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="csvUpload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Upload CSV
        </label>
        <Input id="csvUpload" type="file" accept=".csv" onChange={handleFileUpload} />
      </div>
      
      <div>
        <label htmlFor="jsonUpload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Import from JSON
        </label>
        <Input id="jsonUpload" type="file" accept=".json" onChange={importFromJson} />
      </div>

      {data.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          {data.length} data series loaded
        </p>
      )}
    </div>
  );
};

export default DataTab;
