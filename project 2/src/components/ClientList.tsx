import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ClientProfile } from '../types';

export const ClientList: React.FC = () => {
  const { clients, updateClient, deleteClient } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClientProfile>>({});

  const handleEdit = (client: ClientProfile) => {
    setEditingId(client.id);
    setEditForm(client);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      updateClient(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleChange = (field: keyof ClientProfile, value: string | number | string[]) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field.includes('keywords') || field.includes('preferred') 
        ? value.toString().split(',').map(item => item.trim())
        : value
    }));
  };

  if (clients.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No client profiles added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <div key={client.id} className="bg-gray-50 p-4 rounded-lg">
          {editingId === client.id ? (
            <div className="space-y-3">
              <div>
                <label>Business Name</label>
                <input
                  type="text"
                  value={editForm.businessName || ''}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.keywords?.join(', ') || ''}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label>Preferred CPV Codes (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.preferredCPVs?.join(', ') || ''}
                  onChange={(e) => handleChange('preferredCPVs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-medium">{client.businessName}</h4>
              <p className="text-sm text-gray-600">Keywords: {client.keywords.join(', ')}</p>
              <p className="text-sm text-gray-600">CPV Codes: {client.preferredCPVs.join(', ')}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="bg-[#22175B] text-white px-3 py-1 rounded text-sm hover:bg-[#2c1e77]"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};