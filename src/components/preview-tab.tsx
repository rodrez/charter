import React, { useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import '@/styles/table.css'; // Import CSS if using the alternative approach

interface PreviewTabProps {
  rawData: string[][];
}

// Define fixed widths for each column (in pixels)
const COLUMN_WIDTHS = [150, 200, 100, 250, 150]; // Adjust based on your data

// Height of each row in pixels
const ROW_HEIGHT = 35;

// Number of rows to display in the viewport
const VISIBLE_ROW_COUNT = 20;

// Row Renderer Component
const RowRenderer = React.memo(
  ({
    index,
    style,
    data,
  }: ListChildComponentProps & { data: string[][] }) => {
    const row = data[index];
    return (
      <TableRow style={style} key={index} className="align-middle">
        {row.map((cell, cellIndex) => (
          <TableCell
            key={cellIndex}
            style={{
              width: COLUMN_WIDTHS[cellIndex],
              minWidth: COLUMN_WIDTHS[cellIndex],
              maxWidth: COLUMN_WIDTHS[cellIndex],
              padding: '8px', // Consistent padding
            }}
            className="text-left" // Adjust alignment as needed
          >
            {cell}
          </TableCell>
        ))}
      </TableRow>
    );
  }
);

// Add displayName for better debugging
RowRenderer.displayName = "RowRenderer";

// Memoize the entire component to prevent unnecessary re-renders
const PreviewTab: React.FC<PreviewTabProps> = React.memo(({ rawData }) => {
  // Memoize headers to avoid recalculating on every render
  const headers = useMemo(() => rawData[0], [rawData]);

  // Memoize rows excluding headers
  const rows = useMemo(() => rawData.slice(1), [rawData]);

  return (
    <div className="overflow-x-auto max-h-[400px]">
      {rawData.length > 1 ? (
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="align-middle">
              {headers.map((header, index) => (
                <TableHead
                  key={index}
                  style={{
                    width: COLUMN_WIDTHS[index],
                    minWidth: COLUMN_WIDTHS[index],
                    maxWidth: COLUMN_WIDTHS[index],
                    padding: '8px', // Consistent padding
                  }}
                  className="text-left" // Adjust alignment as needed
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  height={ROW_HEIGHT * VISIBLE_ROW_COUNT}
                  itemCount={rows.length}
                  itemSize={ROW_HEIGHT}
                  width={width}
                  itemData={rows}
                >
                  {RowRenderer}
                </List>
              )}
            </AutoSizer>
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500">No data loaded. Please import a CSV file.</p>
      )}
    </div>
  );
});

// Set the display name for better debugging and readability
PreviewTab.displayName = "PreviewTab";

export default PreviewTab;