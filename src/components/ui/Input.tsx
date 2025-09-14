import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className="block w-full px-3 py-2 text-white bg-[#2C3542] border border-[#3C4552] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635FC7] focus:border-[#635FC7]"
    />
  );
});

Input.displayName = 'Input';

export default Input;
