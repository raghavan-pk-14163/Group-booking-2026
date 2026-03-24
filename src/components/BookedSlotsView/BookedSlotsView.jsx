import React, { useEffect, useState, useTransition } from 'react';
import { useBookedSlots } from '../../hooks/useBookedSlots';
import { addAttendeeToSlot, cancelSlot, promoteFromWaitlist } from '../../api/slotBookingApi';
import SeatBadge from '../shared/SeatBadge';
import SlotStatusPill from '../shared/SlotStatusPill';
import ErrorBanner from '../shared/ErrorBanner';
import Spinner from '../shared/Spinner';
import { SLOT_STATUS } from '../../constants/bookingConstants';

/**
 * Organizer's "Booked Slots" management view.
 * Opens as a dialog over the panel when "View booked slots" is clicked.
 *
 * Props:
 *  booking  — full booking page object (must have id, slotCapacity, type)
 *  onClose  — () => void
 */
export default function BookedSlotsView({ booking, onClose }) {
  const { slots, loading, error, fetchSlots, addAttendee, removeAttendee, cancelBookedSlot, promoteFromWaitlist, clearError } =
    useBookedSlots(booking.id);

  const [weekOffset, setWeekOffset] = useState(0);
  const [addModal, setAddModal] = useState(null);  // { date, slot }

  const { startDate, endDate } = weekRange(weekOffset);

  useEffect(() => {
    fetchSlots(toIcsDate(startDate), toIcsDate(endDate));
  }, [fetchSlots, weekOffset]);

  const dates = Object.keys(slots).filter(k => k !== 'timezone').sort();
  const capacity = booking.slotCapacity ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex flex-col w-full max-w-3xl h-[85vh] rounded-xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Booked Slots</h2>
            <p className="text-xs text-gray-500 mt-0.5">{booking.title}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pt-4">
            <ErrorBanner message={error} onDismiss={clearError} />
          </div>
        )}

        {/* Week navigator */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setWeekOffset(v => v - 1)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 transition-colors"
          >
            ← Prev week
          </button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700">
            {formatDateRange(startDate, endDate)}
          </span>
          <button
            type="button"
            onClick={() => setWeekOffset(v => v + 1)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 transition-colors"
          >
            Next week →
          </button>
        </div>

        {/* Slot list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading && (
            <div className="flex justify-center pt-8">
              <Spinner size={24} className="text-blue-500" />
            </div>
          )}

          {!loading && dates.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-12 text-sm text-gray-400 text-center gap-2">
              <span className="text-4xl">📭</span>
              <p>No booked slots this week.</p>
            </div>
          )}

          {dates.map(date => (
            <DaySection
              key={date}
              date={date}
              slotList={slots[date]}
              capacity={capacity}
              onAddAttendee={(slot) => setAddModal({ date, slot })}
              onRemoveAttendee={(slot, email) => removeAttendee(slot.eveId, email)}
              onCancelSlot={(eveId) => { if (confirm('Cancel this entire slot? All attendees will be removed.')) cancelBookedSlot(eveId); }}
              onPromoteWaitlist={(eveId, email) => promoteFromWaitlist(eveId, email)}
            />
          ))}
        </div>

        {/* Stats footer */}
        {dates.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex gap-6 text-xs text-gray-500">
            <WeekStats dates={dates} slots={slots} capacity={capacity} />
          </div>
        )}
      </div>

      {/* Add Attendee modal */}
      {addModal && (
        <AddAttendeeModal
          slot={addModal.slot}
          onAdd={(attendee) => {
            addAttendee(addModal.slot.eveId, attendee);
            setAddModal(null);
          }}
          onClose={() => setAddModal(null)}
        />
      )}
    </div>
  );
}

// ─── DaySection ───────────────────────────────────────────────────────────────
function DaySection({ date, slotList, capacity, onAddAttendee, onRemoveAttendee, onCancelSlot, onPromoteWaitlist }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {formatDayHeader(date)}
      </h3>
      <div className="space-y-3">
        {slotList.map((slot, i) => (
          <SlotRow
            key={`${slot.time}-${i}`}
            slot={slot}
            capacity={capacity}
            onAddAttendee={() => onAddAttendee(slot)}
            onRemoveAttendee={(email) => onRemoveAttendee(slot, email)}
            onCancelSlot={(eveId) => onCancelSlot(eveId)}
            onPromoteWaitlist={(eveId, email) => onPromoteWaitlist(eveId, email)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SlotRow ─────────────────────────────────────────────────────────────────
function SlotRow({ slot, capacity, onAddAttendee, onRemoveAttendee, onCancelSlot, onPromoteWaitlist }) {
  const [expanded, setExpanded] = useState(false);

  // seat = seats LEFT (from API), or undefined if slot is open (no bookings yet)
  const seatsLeft   = slot.seat != null ? Number(slot.seat) : capacity;
  const seatsFilled = capacity != null ? capacity - seatsLeft : null;
  const status      = deriveStatus(seatsLeft, capacity);
  const hasEvent    = Boolean(slot.eveId);

  return (
    <div className={[
      'rounded-lg border transition-all',
      hasEvent ? 'border-gray-200 bg-white shadow-sm' : 'border-dashed border-gray-200 bg-gray-50',
    ].join(' ')}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => hasEvent && setExpanded(v => !v)}
      >
        {/* Time */}
        <div className="text-sm font-semibold text-gray-800 w-16 shrink-0">{slot.time}</div>

        {/* Seat bar */}
        {capacity != null && (
          <div className="flex-1">
            <SeatProgressBar filled={seatsFilled ?? 0} total={capacity} />
          </div>
        )}

        {/* Status pill */}
        <SlotStatusPill status={status} />

        {/* Seat badge (compact) */}
        {capacity != null && (
          <SeatBadge seatsLeft={seatsLeft} capacity={capacity} status={status} compact />
        )}

        {/* Organizer actions */}
        {hasEvent && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddAttendee(); }}
            className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
          >
            + Add
          </button>
        )}

        {hasEvent && (
          <span className={`text-gray-400 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        )}
      </div>

      {/* Expanded: attendees list + waitlist */}
      {expanded && hasEvent && (
        <AttendeeList
          attendees={slot.attendees ?? []}
          waitlist={slot.waitlist ?? []}
          eveId={slot.eveId}
          onRemove={onRemoveAttendee}
          onPromote={(email) => onPromoteWaitlist(slot.eveId, email)}
          onCancelSlot={() => onCancelSlot(slot.eveId)}
        />
      )}
    </div>
  );
}

// ─── AttendeeList ─────────────────────────────────────────────────────────────
function AttendeeList({ attendees = [], waitlist = [], eveId, onRemove, onPromote, onCancelSlot }) {
  return (
    <div className="px-4 pb-3 border-t border-gray-100 mt-1 pt-3">
      {/* Attendees */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500">Attendees ({attendees.length})</p>
        <button
          type="button" onClick={onCancelSlot}
          className="text-xs text-red-500 hover:text-red-700 transition-colors"
        >Cancel slot</button>
      </div>
      <div className="space-y-1.5">
        {attendees.length === 0 && (
          <p className="text-xs text-gray-400 italic">No attendees yet.</p>
        )}
        {attendees.map((att, i) => (
          <AttendeeRow key={att.email || i} name={att.name} email={att.email} onRemove={() => onRemove(att.email)} />
        ))}
      </div>

      {/* Waitlist */}
      {waitlist.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-amber-600 mb-2">Waitlist ({waitlist.filter(w => w.status === 'queued').length})</p>
          <div className="space-y-1.5">
            {waitlist.filter(w => w.status === 'queued').map((w, i) => (
              <div key={w.email || i} className="flex items-center gap-3 rounded-md px-3 py-2 bg-amber-50">
                <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700 shrink-0">
                  {w.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{w.name}</div>
                  <div className="text-xs text-gray-400 truncate">{w.email}</div>
                </div>
                <button
                  type="button" onClick={() => onPromote(w.email)}
                  className="shrink-0 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 hover:bg-green-100 transition-colors"
                >Promote</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AttendeeRow({ name, email, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2 bg-gray-50">
      <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 shrink-0">
        {name?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{name}</div>
        <div className="text-xs text-gray-400 truncate">{email}</div>
      </div>
      <button
        type="button" onClick={onRemove}
        className="shrink-0 rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-xs"
      >Remove</button>
    </div>
  );
}

// ─── AddAttendeeModal ─────────────────────────────────────────────────────────
function AddAttendeeModal({ slot, onAdd, onClose }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onAdd({ name, email });
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/20">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Attendee</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Adding to slot at <strong>{slot.time}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── SeatProgressBar ─────────────────────────────────────────────────────────
function SeatProgressBar({ filled, total }) {
  const pct = total > 0 ? Math.min((filled / total) * 100, 100) : 0;
  const color = pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-green-400';
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── WeekStats ────────────────────────────────────────────────────────────────
function WeekStats({ dates, slots, capacity }) {
  let totalBooked = 0;
  let totalSlots = 0;
  dates.forEach(date => {
    slots[date]?.forEach(slot => {
      if (slot.eveId) {
        totalSlots++;
        if (capacity != null && slot.seat != null) {
          totalBooked += capacity - Number(slot.seat);
        }
      }
    });
  });

  return (
    <>
      <span><strong className="text-gray-700">{totalSlots}</strong> booked slots this week</span>
      {capacity != null && (
        <span><strong className="text-gray-700">{totalBooked}</strong> total attendees</span>
      )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function deriveStatus(seatsLeft, capacity) {
  if (seatsLeft == null || capacity == null) return SLOT_STATUS.AVAILABLE;
  if (seatsLeft <= 0) return SLOT_STATUS.FULL;
  if (seatsLeft / capacity <= 0.2) return SLOT_STATUS.FEW_SEATS_LEFT;
  return SLOT_STATUS.AVAILABLE;
}

function weekRange(offset = 0) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { startDate: monday, endDate: sunday };
}

function toIcsDate(d) {
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15);
}

function formatDayHeader(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function formatDateRange(start, end) {
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}, ${start.getFullYear()}`;
}
