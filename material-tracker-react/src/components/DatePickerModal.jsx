// src/components/DatePickerModal.jsx
import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const DatePickerModal = ({ isOpen, onClose, onExport, availableDates }) => {
  // Set the default date to the most recent available date
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');

  if (!isOpen) return null;

  const handleExportClick = () => {
    if (!selectedDate) {
      toast.error('Please select a date to export.');
      return;
    }
    onExport(selectedDate);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-75 h-full w-full flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="relative mx-auto p-8 w-full max-w-md shadow-lg rounded-xl bg-white dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Export MIR by Date
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <label
            htmlFor="date-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Select a delivery date to export:
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-11 px-4 rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {availableDates.length > 0 ? (
              availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </option>
              ))
            ) : (
              <option disabled>No delivery dates found</option>
            )}
          </select>
        </div>

        <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExportClick}
            disabled={!selectedDate}
            className="flex items-center justify-center gap-2 w-auto px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;