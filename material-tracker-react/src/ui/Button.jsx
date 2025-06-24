import React from 'react';
import { LoaderCircle } from 'lucide-react';
import clsx from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className,
  ...props
}) => {
  const baseClasses = 'flex items-center justify-center w-full px-6 py-3 text-sm font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    yellow: 'bg-[#FDE047] text-[#1E3A8A] font-bold py-3 rounded-full text-lg hover:bg-[#FACC15] focus:ring-yellow-400'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        (disabled || isLoading) && disabledClasses,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="animate-spin mr-2 h-5 w-5" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;