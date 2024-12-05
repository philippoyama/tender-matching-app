import React from 'react';
import { useForm } from 'react-hook-form';
import { ClientProfile } from '../types';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const ClientForm: React.FC = () => {
  const addClient = useStore((state) => state.addClient);
  const { register, handleSubmit, reset } = useForm<ClientProfile>();

  const onSubmit = (data: ClientProfile) => {
    const client = {
      ...data,
      id: crypto.randomUUID(),
      keywords: data.keywords.toString().split(',').map(k => k.trim()),
      preferredCPVs: data.preferredCPVs.toString().split(',').map(c => c.trim()),
    };
    
    addClient(client);
    toast.success('Client profile added successfully');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Business Name</label>
        <input
          {...register('businessName')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#22175B] focus:ring-[#22175B]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Keywords (comma-separated)</label>
        <input
          {...register('keywords')}
          placeholder="e.g., software development, cloud services, IT consulting"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#22175B] focus:ring-[#22175B]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Location</label>
        <input
          {...register('preferredLocation')}
          placeholder="e.g., London, South East, UK Wide"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#22175B] focus:ring-[#22175B]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Contract Value</label>
        <input
          type="number"
          {...register('preferredContractValue')}
          placeholder="e.g., 100000"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#22175B] focus:ring-[#22175B]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred CPV Codes (comma-separated)</label>
        <input
          {...register('preferredCPVs')}
          placeholder="e.g., 72000000, 48000000"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#22175B] focus:ring-[#22175B]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Preferences</label>
        <textarea
          {...register('additionalPreferences')}
          placeholder="e.g., Focus on tourism/attraction contracts, no data collection services"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#22175B] focus:ring-[#22175B]"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#22175B] text-white py-2 px-4 rounded-md hover:bg-[#2c1e77] focus:outline-none focus:ring-2 focus:ring-[#22175B] focus:ring-offset-2"
      >
        Add Client Profile
      </button>
    </form>
  );
}