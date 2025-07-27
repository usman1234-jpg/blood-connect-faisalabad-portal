import React from 'react';

export const Toaster = () => {
  return <div id="toast-container" className="fixed top-4 right-4 z-50"></div>;
};

export const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  info: (message: string) => console.info('Info:', message),
};