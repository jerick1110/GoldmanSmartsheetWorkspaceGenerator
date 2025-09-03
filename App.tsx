
import React, { useState, useCallback } from 'react';
import { ProcessedWorkspaceData } from './types';
import { fetchAndProcessWorkspaces } from './services/smartsheetService';
import ApiKeyInput from './components/ApiKeyInput';
import WorkspaceTable from './components/WorkspaceTable';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [data, setData] = useState<ProcessedWorkspaceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter a Smartsheet API key.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setData([]);

    try {
      const processedData = await fetchAndProcessWorkspaces(apiKey);
      setData(processedData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Smartsheet Workspace Auditor
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Enter your API key to audit workspace sharing permissions.
          </p>
        </header>

        <main>
          <div className="bg-gray-800 shadow-lg rounded-xl p-6 mb-8">
            <ApiKeyInput
              apiKey={apiKey}
              setApiKey={setApiKey}
              onFetch={handleFetchData}
              isLoading={isLoading}
            />
          </div>

          {isLoading && <Spinner />}
          {error && <ErrorMessage message={error} />}
          
          {!isLoading && !error && data.length === 0 && (
             <div className="text-center py-16 px-6 bg-gray-800 rounded-xl">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No data to display</h3>
                <p className="mt-1 text-sm text-gray-400">Enter your API key and click "Fetch Data" to get started.</p>
            </div>
          )}

          {data.length > 0 && <WorkspaceTable data={data} />}
        </main>
      </div>
    </div>
  );
};

export default App;
