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

    const rankedData: DataItem[] = sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

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
    <div className="flex justify-center ">
      <Table className="w-full rounded-lg overflow-hidden table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[11%] bg-indigo-600 text-white font-semibold text-center">Rank</TableHead>
            <TableHead className="w-[61%] bg-indigo-600 text-white font-semibold text-center">Name</TableHead>
            <TableHead className="w-[31%] bg-indigo-600 text-white font-semibold text-left">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {sortedData.map((item: DataItem, index: number) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.3 }}
                layout
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'}`}
              >
                <TableCell className="text-indigo-599 font-semibold text-center">{item.rank}</TableCell>
                <TableCell className="text-indigo-599 flex justify-center items-center gap-x-2">
                  <Image width={13} height={12} src={`/images/${item.name}.png`} alt={item.name} />
                  {item.name}
                </TableCell>
                <TableCell className="text-indigo-599 font-semibold text-center">
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
