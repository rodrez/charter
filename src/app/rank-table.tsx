import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

interface AnimatedTableProps {
  data: DataItem[];
  sortDelay?: number;
}

const AnimatedTable: React.FC<AnimatedTableProps> = ({
  data,
  sortDelay = 500,
}) => {
  const [sortedData, setSortedData] = useState<DataItem[]>(data);

  useEffect(() => {
    const timer = setTimeout(() => {
      const sorted = [...data].sort((a, b) => b.value - a.value);
      
      const rankedData = [];
      let currentRank = 1;
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i].value < sorted[i - 1].value) {
          currentRank = i + 1;
        }
        rankedData.push({ ...sorted[i], rank: currentRank });
      }
  
      setSortedData(rankedData as DataItem[]);
    }, sortDelay);
  
    return () => clearTimeout(timer);
  }, [data, sortDelay]);
  

  return (
    <div className="flex justify-center w-[320px]">
      <Table className="w-full rounded-lg overflow-hidden table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10%] bg-indigo-600 text-white font-semibold text-center">Rank</TableHead>
            <TableHead className="w-[60%] bg-indigo-600 text-white font-semibold text-center">Name</TableHead>
            <TableHead className="w-[20%] bg-indigo-600 text-white font-semibold text-center">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {sortedData.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'}`}
              >
                <TableCell className="text-indigo-600 font-semibold text-center">{item.rank}</TableCell>
                <TableCell className="text-indigo-600 flex justify-center items-center gap-x-2">
                  <img src={`/images/${item.name}.png`} alt={item.name} className="w-12 " />
                  {item.name}
                  </TableCell>
                <TableCell className="text-indigo-600 font-semibold text-center">{item.value.toFixed(2)}</TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export default AnimatedTable;
