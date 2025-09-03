

import React, { useMemo } from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const { title, body } = useMemo(() => {
    const parts = message.split(':');
    if (parts.length > 1) {
      // Handles "Title: Body" format
      return { title: parts[0].trim(), body: parts.slice(1).join(':').trim() };
    }
    // Fallback for simple messages without a colon
    return { title: 'Error', body: message };
  }, [message]);

  return (
    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
      <strong className="font-bold">{title}: </strong>
      <span className="block sm:inline">{body}</span>
    </div>
  );
};

export default ErrorMessage;