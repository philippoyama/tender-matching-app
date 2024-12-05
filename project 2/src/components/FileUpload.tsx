import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseCsvFile } from '../utils/csvParser';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const FileUpload: React.FC = () => {
  const setTenders = useStore((state) => state.setTenders);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const tenders = await parseCsvFile(file);
      setTenders(tenders);
      toast.success('CSV file uploaded successfully');
    } catch (error) {
      toast.error('Error parsing CSV file');
      console.error(error);
    }
  }, [setTenders]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the CSV file here...</p>
      ) : (
        <p>Drag and drop a CSV file here, or click to select one</p>
      )}
    </div>
  );
};