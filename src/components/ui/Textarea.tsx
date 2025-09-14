import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  return (
    <textarea
      ref={ref}
      {...props}
      className="block w-full px-3 py-2 text-white bg-[#2C3542] border border-[#3C4552] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635FC7] focus:border-[#635FC7]"
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
