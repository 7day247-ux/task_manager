import React from 'react';

export default function Toast({ msg, err, show }) {
  return (
    <div
      className="toast"
      style={{
        opacity: show ? 1 : 0,
        background: err ? '#E24B4A' : '#1C1A16',
      }}
    >
      {msg}
    </div>
  );
}
