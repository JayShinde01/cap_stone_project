import React from "react";

const Select = ({ children, className, ...props }) => {
  return (
    <select className={`border rounded-md px-2 py-1 ${className}`} {...props}>
      {children}
    </select>
  );
};

export const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export default Select;
