import React, { useState } from "react";

const Calendar = ({ className }) => {
  const [date, setDate] = useState("");

  return (
    <input
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className={`border rounded-md px-2 py-1 ${className}`}
    />
  );
};

export default Calendar;
