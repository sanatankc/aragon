import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className="px-4 py-2 text-white bg-[#635FC7] rounded-lg hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#635FC7] focus:ring-opacity-50 transition-colors"
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
