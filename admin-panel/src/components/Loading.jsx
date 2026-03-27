import React from 'react';
import { Icon } from '@iconify/react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center">
      <Icon icon="lucide:loader-2" className="text-4xl text-[#D4754C] animate-spin mb-4" />
      <p className="text-sm font-bold text-[#8B8680] uppercase tracking-widest">Authorizing...</p>
    </div>
  );
};

export default Loading;
