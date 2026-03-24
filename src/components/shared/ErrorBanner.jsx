import React from 'react';

/**
 * Inline dismissible error banner.
 * Pass `message` (string) and `onDismiss` callback.
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
    >
      <span className="mt-0.5 shrink-0 text-red-500">
        {/* Warning icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 4a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0V5zm-.75 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
        </svg>
      </span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
