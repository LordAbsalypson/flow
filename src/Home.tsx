import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Library } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-12">
      <h1 className="text-6xl font-bold text-center mb-4">Welcome to Flow</h1>
      <button
        onClick={() => navigate('/selection')}
        className="bg-white text-black text-6xl font-bold py-12 px-24 rounded-[3rem] shadow-xl hover:bg-gray-100 transition-colors flex items-center gap-6 focus:ring-8 focus:ring-blue-500 outline-none border-4 border-transparent focus:border-blue-600 cursor-pointer"
        aria-label="Play Music"
      >
        Play <Play size={64} fill="currentColor" />
      </button>

      <button
        onClick={() => navigate('/library')}
        className="bg-gray-200 text-black text-4xl font-bold py-8 px-16 rounded-3xl shadow-md hover:bg-gray-300 transition-colors flex items-center gap-4 focus:ring-8 focus:ring-gray-400 outline-none border-4 border-transparent focus:border-gray-600 cursor-pointer"
        aria-label="Go to Library"
      >
        Library <Library size={40} />
      </button>
    </div>
  );
};
