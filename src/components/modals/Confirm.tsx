import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const Confirm: React.FC<ConfirmProps> = ({ isOpen, onClose, onConfirm, title, description }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
        <p className="text-white">{description}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Confirm;
