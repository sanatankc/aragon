import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/fetch';
import BoardForm from './modals/BoardForm';

const fetchBoards = async () => {
  return api('/api/boards');
};

interface SidebarProps {
  onBoardSelect: (boardId: string) => void;
  selectedBoardId?: string | null;
  onClose?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onBoardSelect, selectedBoardId, onClose, isMobile }) => {
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isBoardFormOpen, setIsBoardFormOpen] = useState(false);

  const { data: boards, error, isLoading } = useQuery({ queryKey: ['boards'], queryFn: fetchBoards });

  const createBoardMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return api('/api/boards', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setIsBoardFormOpen(false);
      // Auto-select the newly created board
      onBoardSelect(newBoard.id);
    },
  });

  const handleBoardSubmit = (data: { name: string }) => {
    createBoardMutation.mutate(data);
  };
  return (
    <div className={`h-screen bg-[#2c2c38] border-r border-white/10 flex flex-col z-50 ${
      isMobile ? 'w-80 fixed left-0 top-0' : 'min-w-[320px] relative'
    }`}>
      {/* Logo and Title */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-[#635FC7] rounded-sm"></div>
            </div>
            <h1 className="text-white text-xl font-bold">kanban</h1>
          </div>
          {/* Close button for mobile */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="text-[#828FA3] hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ALL BOARDS Section */}
      <div className="px-6 mb-4">
        <h2 className="text-[#828FA3] text-xs font-bold uppercase tracking-wider">
          ALL BOARDS ({boards?.length || 0})
        </h2>
      </div>

      {/* Board List */}
      <div className="flex-1 pr-3">
        {boards?.map((board: any) => (
          <div
            key={board.id}
            onClick={() => onBoardSelect(board.id)}
            className={`flex items-center space-x-3 px-3 py-3 rounded-r-full cursor-pointer transition-colors ${
              selectedBoardId === board.id
                ? 'bg-[#635FC7] text-white'
                : 'text-[#828FA3] hover:bg-[#2C3542] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span className="font-medium">{board.name}</span>
          </div>
        ))}
        
        {/* Create New Board */}
        <div 
          onClick={() => setIsBoardFormOpen(true)}
          className="flex items-center space-x-3 px-3 py-3 rounded-r-full cursor-pointer text-[#635FC7] hover:bg-[#2C3542] transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span className="font-medium">+ Create New Board</span>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="p-6">
        <div className="bg-[#2C3542] rounded-lg p-3 flex items-center justify-between">
          <svg className="w-4 h-4 text-[#828FA3]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isDarkMode ? 'bg-[#635FC7]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
          <svg className="w-4 h-4 text-[#828FA3]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>

      {/* Board Form Modal */}
      <BoardForm
        isOpen={isBoardFormOpen}
        onClose={() => setIsBoardFormOpen(false)}
        onSubmit={handleBoardSubmit}
        isLoading={createBoardMutation.isPending}
      />
    </div>
  );
};

export default Sidebar;
