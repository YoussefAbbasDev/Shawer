import React from 'react';

export default function Toast({ show, message, isError }) {
  if (!show) return null;

  return (
    <div className={`toast-notice ${isError ? 'error' : ''}`}>
      <span>{isError ? '⚠️' : '✅'}</span>
      <span>{message}</span>
    </div>
  );
}
