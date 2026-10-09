import React from "react";

const Input = ({ type = "text", placeholder, className, ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`border rounded-md px-2 py-1 ${className}`}
      {...props}
    />
  );
};

export default Input;
