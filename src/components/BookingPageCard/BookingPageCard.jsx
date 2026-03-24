import React, { useState, useRef, useEffect } from 'react';
import { BOOKING_TYPE, BOOKING_TYPE_LABEL } from '../../constants/bookingConstants';

/**
 * Booking page card in the Appointment Booking side panel.
 *
 * Props:
 *  booking      — booking page object from API
 *  onOpen       — () => void
 *  onEdit       — () => void
 *  onShare      — () => void
 *  onDuplicate  — () => void
 *  onDelete     — () => void
 *  onViewSlots  — () => void   (new — opens BookedSlotsView for group bookings)
 */
export default function BookingPageCard({
  booking,
  onOpen,
  onEdit,
  onShare,
  onDuplicate,
  onDelete,
  onViewSlots,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isGroup   = booking.type === BOOKING_TYPE.ONE_TO_MANY;
  const isExpired = booking.status === 'expired' || isLinkExpired(booking.endDate);

  // Close menu on outside click
  useEffect(() => {
    function handler(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function copyLink() {
    if (booking.slotBookingLink) {
      navigator.clipboard.writeText(booking.slotBookingLink);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Group badge */}
          {isGroup && (
            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              👥 Group
            </span>
          )}
          <h3
            className="truncate text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onOpen}
            title={booking.title}
          >
            {booking.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Copy link */}
          <button
            type="button"
            onClick={copyLink}
            title="Copy booking link"
            className="rounded p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-1h1v1a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h1v1H4z"/>
              <path d="M7 1h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"/>
            </svg>
          </button>

          {/* ⋮ More options */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              className="rounded p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="More options"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-52 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                {[
                  { label: 'Open booking page', icon: '↗', action: onOpen },
                  { label: 'Edit',              icon: '✏️', action: onEdit },
                  { label: 'Share link',        icon: '🔗', action: onShare },
                  isGroup
                    ? { label: 'View booked slots', icon: '📋', action: onViewSlots }
                    : null,
                  { label: 'Duplicate booking', icon: '⎘',  action: onDuplicate },
                  { label: 'Delete',            icon: '🗑', action: onDelete, danger: true },
                ]
                  .filter(Boolean)
                  .map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => { item.action?.(); setMenuOpen(false); }}
                      className={[
                        'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
                        item.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <span className="text-base w-5 text-center">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Meta row ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>⏱ {booking.slotDuration ?? booking.duration ?? '—'} min</span>

        {isGroup && booking.slotCapacity != null && (
          <span className="text-blue-600 font-medium">
            👥 {booking.slotCapacity} seats/slot
          </span>
        )}

        {booking.conference && booking.conference !== 'none' && (
          <span>
            {booking.conference === 'zmeeting'
              ? (booking.conference_type === 'video' ? '🎥 Video' : '🎤 Audio')
              : '📍 In-person'}
          </span>
        )}

        <span>{booking.visibility === 0 ? '🔒 Organization' : '🌐 Public'}</span>
      </div>

      {/* ── Expiry / Status ── */}
      <div className="mt-3 flex items-center justify-between">
        {isExpired ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 border border-red-100">
            Link Expired
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            Expires {formatDate(booking.endDate)}
          </span>
        )}

        {/* Quick action for group: view booked slots */}
        {isGroup && !isExpired && (
          <button
            type="button"
            onClick={onViewSlots}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            View slots →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isLinkExpired(endDateMs) {
  if (!endDateMs) return false;
  return Date.now() > endDateMs;
}

function formatDate(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
