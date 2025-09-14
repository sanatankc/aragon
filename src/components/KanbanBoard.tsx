import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import Column from "./Column";
import TaskForm from "./modals/TaskForm";

export default function KanbanBoard({ columns, boardId, boardName, boards, isMobile, onToggleSidebar }: { 
  columns: any[]; 
  boardId: string; 
  boardName?: string; 
  boards?: any[];
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}) {
  const queryClient = useQueryClient();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; columnId: string }) => {
      return api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
      setIsTaskFormOpen(false);
    },
  });

  const handleAddTask = () => {
    setIsTaskFormOpen(true);
  };

  const handleTaskSubmit = (data: { title: string; description: string; columnId: string }) => {
    createTaskMutation.mutate(data);
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'w-[calc(100vw-320px)]'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-[#2c2c38] border-b border-white/10">
        <div className="flex items-center space-x-4">
          {/* Hamburger menu for mobile */}
          {isMobile && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="text-white hover:text-gray-300 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            {boardName || 'Platform Launch'}
          </h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={handleAddTask}
            className={`bg-[#635FC7] hover:bg-[#7C3AED] text-white rounded-full font-medium transition-colors ${
              isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
            }`}
          >
            {isMobile ? '+ Add' : '+ Add New Task'}
          </button>
          {/* Hide three dots menu on mobile */}
          {!isMobile && (
            <button className="text-[#828FA3] hover:text-white p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-scroll">
        <div className={`flex gap-4 md:gap-6 p-4 md:p-6 min-h-full ${isMobile ? 'min-w-max' : ''}`}>
          {columns
            .sort((a, b) => a.order - b.order)
            .map((col) => (
              <Column key={col.id} column={col} isMobile={isMobile} />
            ))}
          
          {/* Add New Column Button */}
          <div className={`shrink-0 flex items-center justify-center ${isMobile ? 'w-[240px]' : 'w-[280px]'}`}>
            <button className={`w-full bg-[#2C3542] hover:bg-[#3C4552] text-[#828FA3] hover:text-white rounded-lg font-medium transition-colors ${
              isMobile ? 'h-10 text-sm' : 'h-12'
            }`}>
              {isMobile ? '+ Column' : '+ New Column'}
            </button>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        boards={boards || []}
        columns={columns}
        currentBoardId={boardId}
        isLoading={createTaskMutation.isPending}
      />
    </div>
  );
}
