import React, { useState, useEffect } from 'react';
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
}

const AnimatedTable: React.FC<AnimatedTableProps> = ({
  data,
  sortDelay = 501,
  decimalPlaces = 3,
  lowerIsBetter = false,
}) => {
  const [sortedData, setSortedData] = useState<DataItem[]>(data);

  // Added return type annotation
  const formatValue = (value: number, decimalPlaces: number): string => {
    if (value % 1 === 0) {
      // If value is an integer, don't show decimal places
      return value.toFixed(0);
    }
    return value.toFixed(decimalPlaces);
  };

  // Added proper typings and adjusted ranking logic
  const sortAndRankData = (data: DataItem[], lowerIsBetter: boolean): DataItem[] => {
    const sorted = [...data].sort((a, b) => 
      lowerIsBetter ? a.value - b.value : b.value - a.value
    );
  
    if (sorted.length === 0) return [];
  
    let currentRank = 1;
    let previousValue = sorted[0]?.value;
    let tiesCount = 0; // Count of items with the same rank
  
    const rankedData: DataItem[] = sorted.map((item) => {
      if (item.value !== previousValue) {
        currentRank += tiesCount; // Move currentRank up by the number of ties
        tiesCount = 1; // Reset ties count, start at 1 for the current item
      } else {
        tiesCount++; // Increment ties count for items with the same value
      }
      
      previousValue = item.value;
  
      return {
        ...item,
        rank: currentRank,
      };
    });
  
    return rankedData;
  };
  
  

  useEffect(() => {
    const timer = setTimeout(() => {
      const rankedData = sortAndRankData(data, lowerIsBetter);
      setSortedData(rankedData);
    }, sortDelay);
  
    return () => clearTimeout(timer);
  }, [data, sortDelay, lowerIsBetter]);

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
          <AnimatePresence>
            {sortedData.map((item: DataItem, index: number) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.3 }}
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
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export default AnimatedTable;
