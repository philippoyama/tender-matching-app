import React from 'react';
import { FileUpload } from './components/FileUpload';
import { ClientForm } from './components/ClientForm';
import { ClientList } from './components/ClientList';
import { MatchingResults } from './components/MatchingResults';
import { useStore } from './store/useStore';
import { matchTendersWithClients } from './utils/matchingLogic';
import { cancelPendingRequests } from './utils/ai/aiAnalyzer';
import toast from 'react-hot-toast';

function App() {
  const { 
    tenders, 
    clients, 
    setMatchResults, 
    isMatching,
    matchingProgress,
    setIsMatching,
    setMatchingProgress,
    setShouldStopMatching,
    shouldStopMatching,
    resetMatchingState
  } = useStore();

  const handleMatch = async () => {
    if (tenders.length === 0) {
      toast.error('Please upload tender data first');
      return;
    }

    if (clients.length === 0) {
      toast.error('Please add at least one client profile');
      return;
    }

    try {
      setIsMatching(true);
      setMatchingProgress(0);
      setShouldStopMatching(false);
      
      const results = await matchTendersWithClients(
        tenders, 
        clients, 
        (progress) => {
          setMatchingProgress(progress);
          requestAnimationFrame(() => setMatchingProgress(progress));
        },
        () => shouldStopMatching
      );
      
      if (shouldStopMatching) {
        toast.success('Matching process stopped. Showing partial results.');
      } else {
        toast.success(`Found ${results.length} matches`);
      }
      setMatchResults(results);
    } catch (error) {
      toast.error('Error during matching process');
      console.error(error);
    } finally {
      resetMatchingState();
    }
  };

  const handleStop = () => {
    setShouldStopMatching(true);
    cancelPendingRequests();
    toast('Stopping the matching process... Please wait', {
      icon: '⏳',
      duration: 2000
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Upload Tender Data</h2>
                <div className="h-40">
                  <FileUpload />
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Add Client Profile</h2>
                <ClientForm />
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Saved Client Profiles</h2>
              <ClientList />
            </div>
          </div>

          <div className="mt-6">
            {isMatching ? (
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.round(matchingProgress * 100)}%` }}
                  ></div>
                </div>
                <button
                  onClick={handleStop}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={shouldStopMatching}
                >
                  {shouldStopMatching ? 'Stopping...' : 'Stop Matching'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleMatch}
                disabled={isMatching}
                className="w-full bg-[#22175B] hover:bg-[#2c1e77] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#22175B] focus:ring-offset-2"
              >
                Start Matching
              </button>
            )}
          </div>

          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Matching Results</h2>
              <MatchingResults />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;