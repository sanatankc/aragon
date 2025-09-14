import React, { useState, useEffect } from 'react';
import { boardCreate } from '@/lib/validation';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface BoardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  isLoading?: boolean;
}

const BoardForm: React.FC<BoardFormProps> = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent submission during loading
    
    const result = boardCreate.safeParse({ name });
    if (result.success) {
      onSubmit({ name });
      // Don't clear form here - let it clear when modal closes after success
    } else {
      setError(result.error.flatten().fieldErrors.name?.[0] || null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="mb-6 text-xl font-bold text-white">Create New Board</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#828FA3] mb-2">Board Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter board name"
              required
            />
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
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
            {isLoading ? 'Creating...' : 'Create Board'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BoardForm;
