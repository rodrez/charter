import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Assuming these components are from your UI library and can be modified
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Watermark from '@/components/watermark';

interface DataItem {
  id: string;
  name: string;
  value: number;
  rank?: number;
}

interface AnimatedTableProps {
  data: DataItem[];
  sortDelay?: number;
  decimalPlaces?: number;
  lowerIsBetter?: boolean;
  completedIds?: string[];
}

// Create a properly typed TableRow component with motion once
const MotionTableRow = motion(TableRow);

// Memoized row component to prevent unnecessary re-renders
const TableRowItem = memo(({ item, index, decimalPlaces }: { 
  item: DataItem; 
  index: number;
  decimalPlaces: number;
}) => {
  const formatValue = (value: number, decimalPlaces: number): string => {
    if (value % 1 === 0) {
      // If value is an integer, don't show decimal places
      return value.toFixed(0);
    }
    return value.toFixed(decimalPlaces);
  };

  return (
    <MotionTableRow
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8 }}
      layout
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'} relative`}
    >
      <TableCell className="text-indigo-599 font-semibold text-center border-b-0">
        {item.rank}
      </TableCell>
      <TableCell className="text-indigo-599 flex justify-start items-center gap-x-2 border-b-0">
        <Watermark className='text-xs absolute top-6 left-0' text='Brand Ranks' />
        <Image width={48} height={48} src={`/images/${item.name}.png`} alt={item.name} />
        {item.name}
        <Watermark className='text-xs absolute bottom-6 right-12' text='Brand Ranks' />
        <Watermark className='text-xs' text='Brand Ranks' />
      </TableCell>
      <TableCell className="text-indigo-599 font-semibold text-left border-b-0">
        {formatValue(item.value, decimalPlaces)}
      </TableCell>
    </MotionTableRow>
  );
});

TableRowItem.displayName = 'TableRowItem';

const AnimatedTable: React.FC<AnimatedTableProps> = ({
  data,
  sortDelay = 501,
  decimalPlaces = 3,
  lowerIsBetter = false,
  completedIds = [],
}) => {
  const [sortedData, setSortedData] = useState<DataItem[]>([]);
  
  // Improved ranking algorithm with dense ranking (1223 ranking)
  const sortAndRankData = useCallback((data: DataItem[], lowerIsBetter: boolean): DataItem[] => {
    if (data.length === 0) return [];
    
    // First sort the data
    const sorted = [...data].sort((a, b) => 
      lowerIsBetter ? a.value - b.value : b.value - a.value
    );
    
    // Group items by their value to handle ties properly
    const valueGroups: Record<string, DataItem[]> = {};
    
    // Use for...of instead of forEach
    for (const item of sorted) {
      const valueKey = item.value.toString();
      if (!valueGroups[valueKey]) {
        valueGroups[valueKey] = [];
      }
      valueGroups[valueKey].push(item);
    }
    
    // Assign ranks with dense ranking (1223 ranking)
    let currentRank = 1;
    const rankedData: DataItem[] = [];
    
    // Get sorted unique values
    const uniqueValues = Object.keys(valueGroups)
      .map(v => Number.parseFloat(v))
      .sort((a, b) => lowerIsBetter ? a - b : b - a);
    
    // Assign ranks to each group
    for (const value of uniqueValues) {
      const valueKey = value.toString();
      const group = valueGroups[valueKey];
      
      if (group) {
        // All items in this group get the same rank
        for (const item of group) {
          rankedData.push({
            ...item,
            rank: currentRank
          });
        }
        // Next rank is one more than current, regardless of how many tied
        currentRank++;
      }
    }
    
    return rankedData;
  }, []);
  
  // Update sorted data when input data changes or completedIds changes
  useEffect(() => {
    // First filter to only the visible items based on completedIds
    const visibleItems = data.filter(item => completedIds.includes(item.id));
    // Then rank only those visible items
    const rankedData = sortAndRankData(visibleItems, lowerIsBetter);
    setSortedData(rankedData);
  }, [data, lowerIsBetter, sortAndRankData, completedIds]);

  // No need for a separate effect to update visibleIds
  // We've already filtered for visible items above
  
  // No need to filter again - sortedData now contains only the visible items with proper ranks
  const visibleData = sortedData;

  return (
    <div className="flex justify-center relative shadow-lg rounded-lg overflow-hidden bg-white">
      <Table className="w-full rounded-lg overflow-hidden table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%] bg-indigo-600 text-white font-semibold text-center">Rank</TableHead>
            <TableHead className="w-[61%] bg-indigo-600 text-white font-semibold text-left">Name</TableHead>
            <TableHead className="w-[31%] bg-indigo-600 text-white font-semibold text-left">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='relative'>
          <AnimatePresence mode="sync">
            {visibleData.map((item, index) => (
              <TableRowItem 
                key={item.id}
                item={item}
                index={index}
                decimalPlaces={decimalPlaces}
              />
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(AnimatedTable);
