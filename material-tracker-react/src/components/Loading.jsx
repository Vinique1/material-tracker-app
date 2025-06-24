import React from 'react';
import { LoaderCircle } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-100 dark:bg-gray-900">
      {' '}
      {/* MODIFIED: Added dark background */}
      <div className="flex flex-col items-center">
        <LoaderCircle className="animate-spin h-12 w-12 text-blue-600" />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          {' '}
          {/* MODIFIED: Added dark text */}
          Loading Page...
        </p>
      </div>
    </div>
  );
};

export default Loading;
