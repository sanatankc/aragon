'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import KanbanBoard from '@/components/KanbanBoard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { api } from '@/lib/fetch';
import { useQuery } from '@tanstack/react-query';

// Loading component to handle all loading states
const LoadingState = ({ 
  boardsLoading, 
  boardsError, 
  selectedBoard, 
  columnsLoading, 
  columnsError, 
  columns, 
  board, 
  boards, 
  isMobile, 
  onToggleSidebar 
}: {
  boardsLoading: boolean;
  boardsError: any;
  selectedBoard: string | null;
  columnsLoading: boolean;
  columnsError: any;
  columns: any;
  board: any;
  boards: any;
  isMobile: boolean;
  onToggleSidebar: () => void;
}) => {
  // Show loading spinner while boards are loading
  if (boardsLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading boards..." />
      </div>
    );
  }

  // Show error if boards failed to load
  if (boardsError) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-400">Failed to load boards</h2>
          <p className="text-[#828FA3]">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Show welcome message if no board is selected
  if (!selectedBoard) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Kanban</h2>
          <p className="text-[#828FA3]">Select a board to get started</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while columns are loading
  if (columnsLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading columns..." />
      </div>
    );
  }

  // Show error if columns failed to load
  if (columnsError) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-400">Failed to load columns</h2>
          <p className="text-[#828FA3]">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Show the kanban board when everything is loaded
  return (
    <KanbanBoard 
      columns={columns} 
      boardId={selectedBoard} 
      boardName={board?.name}
      boards={boards}
      isMobile={isMobile}
      onToggleSidebar={onToggleSidebar}
    />
  );
};

const fetchColumns = async (boardId: string) => {
  return api(`/api/boards/${boardId}/columns?include=tasks`);
};

const fetchBoard = async (boardId: string) => {
  return api(`/api/boards/${boardId}`);
};

const fetchBoards = async () => {
  return api('/api/boards');
};

export default function Home() {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false); // Close sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: boards, isLoading: boardsLoading, error: boardsError } = useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
  });

  // Auto-select first board when boards are loaded
  useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0].id);
    }
  }, [boards, selectedBoard]);

  const { data: columns, isLoading, error } = useQuery({
    queryKey: ['columns', selectedBoard],
    queryFn: () => fetchColumns(selectedBoard!),
    enabled: !!selectedBoard,
  });

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', selectedBoard],
    queryFn: () => fetchBoard(selectedBoard!),
    enabled: !!selectedBoard,
  });

  return (
    <div className="flex h-screen bg-[#232330] w-screen">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      {(!isMobile || isSidebarOpen) && (
        <Sidebar 
          onBoardSelect={(boardId) => {
            setSelectedBoard(boardId);
            if (isMobile) {
              setIsSidebarOpen(false); // Close sidebar after selection on mobile
            }
          }} 
          selectedBoardId={selectedBoard}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={isMobile}
        />
      )}
      
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`flex-1 ${isMobile ? 'w-full' : 'w-[calc(100vw-320px)]'}`}>
        <LoadingState
          boardsLoading={boardsLoading}
          boardsError={boardsError}
          selectedBoard={selectedBoard}
          columnsLoading={isLoading}
          columnsError={error}
          columns={columns}
          board={board}
          boards={boards}
          isMobile={isMobile}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}
