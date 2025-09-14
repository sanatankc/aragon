import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="p-6 bg-[#2C3542] rounded-lg shadow-2xl max-w-lg w-full mx-4 relative">
        <div className="absolute top-[12px] right-[25px]">
          <button 
            onClick={onClose} 
            className="text-[#828FA3] hover:text-white text-4xl font-bold  cursor-pointer"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
