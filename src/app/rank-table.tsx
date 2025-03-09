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
  chartAnimationsComplete?: boolean;
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
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ 
        duration: 0.5,
        type: "spring", 
        stiffness: 120,
        damping: 20,
        delay: 0.1 // Small delay for a nicer entrance
      }}
      layout="position"
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'} relative`}
    >
      <TableCell className="text-red-600 font-semibold text-center border-b-0">
        {item.rank}
      </TableCell>
      <TableCell className="text-red-600 flex justify-start items-center gap-x-2 border-b-0">
        <Watermark className='text-xs absolute top-6 left-0' text='Brand Ranks' />
        <Image width={48} height={48} src={`/images/${item.name}.png`} alt={item.name} />
        {item.name}
        <Watermark className='text-xs absolute bottom-6 right-12' text='Brand Ranks' />
        <Watermark className='text-xs' text='Brand Ranks' />
      </TableCell>
      <TableCell className="text-red-600 font-semibold text-left border-b-0">
        {formatValue(item.value, decimalPlaces)}
      </TableCell>
    </MotionTableRow>
  );
});

TableRowItem.displayName = 'TableRowItem';

const AnimatedTable: React.FC<AnimatedTableProps> = ({
  data,
  // sortDelay = 501,
  decimalPlaces = 3,
  lowerIsBetter = false,
  completedIds = [],
  chartAnimationsComplete = false,
}) => {
  const [sortedData, setSortedData] = useState<DataItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTable, setShowTable] = useState(true);
  
  // Improved ranking algorithm with dense ranking (1223 ranking)
  const sortAndRankData = useCallback((data: DataItem[], lowerIsBetter: boolean): DataItem[] => {
    if (data.length === 0) return [];
    
    // First sort the data
    const sorted = [...data].sort((a, b) => {
      return lowerIsBetter 
        ? a.value - b.value 
        : b.value - a.value;
    });
    
    // Then assign ranks (dense ranking: 1, 2, 2, 3, ...)
    let currentRank = 1;
    let previousValue = sorted[0]?.value ?? 0; // Add null check with default value
    
    return sorted.map((item, index) => {
      // If this value is different from the previous one, increment the rank
      if (index > 0 && item.value !== previousValue) {
        currentRank = index + 1;
        previousValue = item.value;
      }
      
      return { ...item, rank: currentRank };
    });
  }, []);
  
  // Filter data to only include items that have completed animation
  useEffect(() => {
    // Always include the first item, plus any completed animations
    let filteredData: DataItem[] = [];
    
    // If chartAnimationsComplete is true (table-only view) or all items are completed, show all items
    if (chartAnimationsComplete || (data.length > 0 && data.every(item => completedIds.includes(item.id)))) {
      filteredData = [...data];
    } else if (data.length > 0) {
      // Always include the first item if it exists
      const firstItem = data[0];
      
      if (firstItem) {
        // Start with the first item
        filteredData = [firstItem];
        
        // Then add any completed items (excluding the first item to avoid duplicates)
        if (completedIds.length > 0) {
          const completedItems = data.filter(item => 
            completedIds.includes(item.id) && item.id !== firstItem.id
          );
          
          // Add completed items to filtered data (avoiding duplicates)
          for (const item of completedItems) {
            // Only add if not already in filteredData
            if (!filteredData.some(existing => existing.id === item.id)) {
              filteredData.push(item);
            }
          }
        }
      }
    }
    
    // Update animation state based on whether we have data
    const hasData = filteredData.length > 0;
    setShowTable(hasData);
    setIsAnimating(hasData);
    
    const ranked = sortAndRankData(filteredData, lowerIsBetter);
    setSortedData(ranked);
  }, [data, lowerIsBetter, sortAndRankData, completedIds, chartAnimationsComplete]);

  return (
    <div className="flex justify-center relative shadow-lg rounded-lg overflow-hidden bg-white">
      <Table className="w-full rounded-lg overflow-hidden table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%] bg-red-600 text-white font-semibold text-center">Rank</TableHead>
            <TableHead className="w-[61%] bg-red-600 text-white font-semibold text-left">Name</TableHead>
            <TableHead className="w-[31%] bg-red-600 text-white font-semibold text-left">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='relative'>
          <AnimatePresence 
            mode="sync" 
            initial={false}
          >
            {showTable && sortedData.map((item, index) => (
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
