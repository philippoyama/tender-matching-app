import React from 'react';
import { parse, format } from 'date-fns';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';
import { MatchResult } from '../types';
import { useStore } from '../store/useStore';
import { getSuitabilityLabel } from '../utils/matchingLogic';

const columnHelper = createColumnHelper<MatchResult>();

const formatDate = (dateString: string): string => {
  try {
    // First try parsing with slashes (DD/MM/YYYY)
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    if (!isNaN(parsedDate.getTime())) {
      return format(parsedDate, 'dd/MM/yyyy');
    }
    
    // Then try parsing with hyphens (YYYY-MM-DD)
    const isoDate = parse(dateString, 'yyyy-MM-dd', new Date());
    if (!isNaN(isoDate.getTime())) {
      return format(isoDate, 'dd/MM/yyyy');
    }
    
    return dateString;
  } catch (error) {
    return dateString;
  }
};

const columns = [
  columnHelper.accessor('tender', {
    header: 'Tender Details',
    cell: (info) => {
      const tender = info.getValue();
      return (
        <div>
          {tender.noticeUrl ? (
            <a 
              href={tender.noticeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {tender.title}
            </a>
          ) : (
            <span>{tender.title}</span>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('tender.value', {
    header: 'Value',
    cell: (info) => {
      const value = info.getValue();
      return value && value > 0 ? `£${value.toLocaleString()}` : 'Not stated';
    },
  }),
  columnHelper.accessor('tender.deadline', {
    header: 'Deadline',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('client.businessName', {
    header: 'Matched Client',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('matchScore', {
    header: 'Match Score',
    cell: (info) => {
      const score = info.getValue();
      const suitability = getSuitabilityLabel(score);
      return (
        <div>
          <div className={`font-medium ${
            score >= 0.9 ? 'text-green-600' :
            score >= 0.6 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {suitability}
          </div>
          <div className="text-sm text-gray-500">{`${(score * 100).toFixed(1)}%`}</div>
        </div>
      );
    },
    sortDescFirst: true,
  }),
  columnHelper.accessor('matchReasons', {
    header: 'Match Reasons',
    cell: (info) => (
      <ul className="list-disc list-inside">
        {info.getValue().map((reason, index) => (
          <li key={index} className="text-sm text-gray-700 mb-1">{reason}</li>
        ))}
      </ul>
    ),
  }),
];

export const MatchingResults: React.FC = () => {
  const { matchResults, clearMatchResults } = useStore();

  const table = useReactTable({
    data: matchResults,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (matchResults.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No matching results yet. Upload a CSV file and add client profiles to start matching.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={clearMatchResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Clear Results
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-normal text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};