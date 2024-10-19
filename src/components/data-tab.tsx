import React from 'react';
import { Input } from "@/components/ui/input";

import type { DataSeries } from '@/lib/types/line-chart';

interface DataTabProps {
  data: DataSeries[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DataTab: React.FC<DataTabProps> = ({ data, handleFileUpload }) => {
  return (
    <div>
      <Input type="file" accept=".csv" onChange={handleFileUpload} />
      {data.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          {data.length} data series loaded
        </p>
      )}
    </div>
  );
};

export default DataTab;
