import Papa from 'papaparse';
import { TenderContract } from '../types';

export const parseCsvFile = (file: File): Promise<TenderContract[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const tenders: TenderContract[] = results.data
            .filter((record: any) => record['Contract Title']) // Only include records with a title
            .map((record: any) => {
              // Clean and validate URL
              let noticeUrl = record['Contract Notice Url'] || '';
              if (noticeUrl && !noticeUrl.startsWith('http')) {
                noticeUrl = `https://${noticeUrl}`;
              }

              // Clean and parse value
              const valueStr = record['Total Contract Value - High (GBP)'] || '0';
              const value = parseFloat(valueStr.replace(/[£,]/g, '')) || 0;

              return {
                title: record['Contract Title'] || '',
                noticeUrl: noticeUrl,
                value: value,
                deadline: record['BID Deadline Date'] || '',
                buyer: record['Contracting Authority'] || '',
                description: record['Contract Description'] || '',
                cpvLevel1: record['CPV Sector - Level 1'] || '',
                cpvLevel2: record['CPV Sector - Level 2'] || '',
                region: record['Contracting Authority Region'] || ''
              };
            });

          console.log(`Parsed ${tenders.length} valid tenders from CSV`);
          resolve(tenders);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      }
    });
  });
};