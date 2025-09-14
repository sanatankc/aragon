import React, { useState } from 'react';
import { columnCreate } from '@/lib/validation';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ColumnFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  boardId: string;
}

const ColumnForm: React.FC<ColumnFormProps> = ({ isOpen, onClose, onSubmit, boardId }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = columnCreate.safeParse({ name, boardId });
    if (result.success) {
      onSubmit({ name });
      setName('');
      setError(null);
      onClose();
    } else {
      setError(result.error.flatten().fieldErrors.name?.[0] || null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="mb-4 text-lg font-bold text-white">Create Column</h2>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Column Name"
        />
        {error && <p className="mt-2 text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end">
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ColumnForm;
