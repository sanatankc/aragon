import React, { useState, useEffect } from 'react';
import { taskCreate } from '@/lib/validation';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; columnId: string }) => void;
  boards: any[];
  columns: any[];
  currentBoardId?: string;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, boards, columns, currentBoardId, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(currentBoardId || '');
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [errors, setErrors] = useState<{ title?: string[]; description?: string[]; columnId?: string[] } | null>(null);

  // Update selectedBoardId when currentBoardId changes
  useEffect(() => {
    if (currentBoardId) {
      setSelectedBoardId(currentBoardId);
      setSelectedColumnId(''); // Reset column when board changes
    }
  }, [currentBoardId]);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setSelectedBoardId(currentBoardId || '');
      setSelectedColumnId('');
      setErrors(null);
    }
  }, [isOpen, currentBoardId]);

  // Filter columns based on selected board
  const availableColumns = columns.filter(col => col.boardId === selectedBoardId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent submission during loading
    
    const result = taskCreate.safeParse({ title, description, columnId: selectedColumnId });
    if (result.success) {
      onSubmit({ title, description, columnId: selectedColumnId });
      // Don't clear form here - let it clear when modal closes after success
    } else {
      setErrors(result.error.flatten().fieldErrors);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="mb-6 text-xl font-bold text-white">Create New Task</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#828FA3] mb-2">Board</label>
            <select
              value={selectedBoardId}
              onChange={(e) => {
                setSelectedBoardId(e.target.value);
                setSelectedColumnId(''); // Reset column when board changes
              }}
              className="block w-full px-3 py-2 text-white bg-[#2C3542] border border-[#3C4552] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635FC7] focus:border-[#635FC7] disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={!!currentBoardId}
            >
              <option value="">Select a board</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#828FA3] mb-2">Column</label>
            <select
              value={selectedColumnId}
              onChange={(e) => setSelectedColumnId(e.target.value)}
              className="block w-full px-3 py-2 text-white bg-[#2C3542] border border-[#3C4552] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635FC7] focus:border-[#635FC7]"
              required
              disabled={!selectedBoardId}
            >
              <option value="">Select a column</option>
              {availableColumns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
            {errors?.columnId && <p className="mt-2 text-red-400 text-sm">{errors.columnId[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#828FA3] mb-2">Task Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
            {errors?.title && <p className="mt-2 text-red-400 text-sm">{errors.title[0]}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#828FA3] mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
            />
            {errors?.description && <p className="mt-2 text-red-400 text-sm">{errors.description[0]}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-[#828FA3] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
