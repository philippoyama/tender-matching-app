import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientProfile, TenderContract, MatchResult } from '../types';

interface Store {
  tenders: TenderContract[];
  clients: ClientProfile[];
  matchResults: MatchResult[];
  isMatching: boolean;
  matchingProgress: number;
  shouldStopMatching: boolean;
  setTenders: (tenders: TenderContract[]) => void;
  addClient: (client: ClientProfile) => void;
  updateClient: (id: string, client: Partial<ClientProfile>) => void;
  deleteClient: (id: string) => void;
  setMatchResults: (results: MatchResult[]) => void;
  clearMatchResults: () => void;
  setIsMatching: (isMatching: boolean) => void;
  setMatchingProgress: (progress: number) => void;
  setShouldStopMatching: (shouldStop: boolean) => void;
  resetMatchingState: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      tenders: [],
      clients: [],
      matchResults: [],
      isMatching: false,
      matchingProgress: 0,
      shouldStopMatching: false,
      setTenders: (tenders) => set({ tenders }),
      addClient: (client) => set((state) => ({ 
        clients: [...state.clients, client] 
      })),
      updateClient: (id, updatedClient) => set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? { ...client, ...updatedClient } : client
        ),
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
      })),
      setMatchResults: (results) => set({ matchResults: results }),
      clearMatchResults: () => set({ matchResults: [] }),
      setIsMatching: (isMatching) => set({ isMatching }),
      setMatchingProgress: (progress) => set({ matchingProgress: progress }),
      setShouldStopMatching: (shouldStop) => set({ shouldStopMatching: shouldStop }),
      resetMatchingState: () => set({
        isMatching: false,
        matchingProgress: 0,
        shouldStopMatching: false
      })
    }),
    {
      name: 'tender-matching-storage',
    }
  )
);