import React from 'react';
import SlotStatusPill from '../shared/SlotStatusPill';
import SeatBadge from '../shared/SeatBadge';
import { SLOT_STATUS, BOOKING_TYPE } from '../../constants/bookingConstants';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Week-view slot grid on the public booking page.
 *
 * Props:
 *  slots       — API response: { "2026-03-24": [{ time, seat?, eveId? }, ...], timezone }
 *  weekDates   — array of 7 Date objects for Sun–Sat of the current week
 *  capacity    — slotCapacity (number | null — null for one-to-one)
 *  bookingType — BOOKING_TYPE value
 *  onSelect    — (date, slot) => void — called when a clickable slot is selected
 */
export default function SlotGrid({ slots, weekDates, capacity, bookingType, onSelect }) {
  const isGroup = bookingType === BOOKING_TYPE.ONE_TO_MANY;

  return (
    <div className="overflow-x-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, new Date());
          return (
            <div key={i} className="text-center">
              <div className="text-xs text-gray-400">{DAYS[date.getDay()]}</div>
              <div className={[
                'text-sm font-semibold mx-auto mt-0.5 h-7 w-7 flex items-center justify-center rounded-full',
                isToday ? 'bg-blue-600 text-white' : 'text-gray-700',
              ].join(' ')}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot columns */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, colIdx) => {
          const dateKey  = toDateKey(date);
          const daySlots = slots[dateKey] ?? [];

          return (
            <div key={colIdx} className="flex flex-col gap-1.5">
              {daySlots.map((slot, rowIdx) => {
                const { status, seatsLeft } = resolveSlotStatus(slot, capacity);
                const isClickable = status !== SLOT_STATUS.FULL && status !== SLOT_STATUS.OUTSIDE_WINDOW;

                return (
                  <SlotButton
                    key={`${slot.time}-${rowIdx}`}
                    slot={slot}
                    status={status}
                    seatsLeft={seatsLeft}
                    capacity={capacity}
                    isGroup={isGroup}
                    isClickable={isClickable}
                    onClick={() => isClickable && onSelect(dateKey, slot)}
                  />
                );
              })}

              {daySlots.length === 0 && (
                <div className="h-10 rounded-md bg-gray-50 border border-dashed border-gray-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SlotButton ───────────────────────────────────────────────────────────────
function SlotButton({ slot, status, seatsLeft, capacity, isGroup, isClickable, onClick }) {
  const baseStyle = 'w-full rounded-md px-2 py-2 text-center text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400';

  const statusStyle = {
    [SLOT_STATUS.AVAILABLE]:      'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer',
    [SLOT_STATUS.FEW_SEATS_LEFT]: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer',
    [SLOT_STATUS.FULL]:           'bg-red-50 text-red-400 border border-red-100 cursor-not-allowed opacity-70',
    [SLOT_STATUS.OUTSIDE_WINDOW]: 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60',
  }[status];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`${baseStyle} ${statusStyle}`}
      title={statusTooltip(status, seatsLeft, capacity)}
    >
      <div>{slot.time}</div>
      {isGroup && seatsLeft != null && (
        <div className="mt-0.5">
          {status === SLOT_STATUS.FULL
            ? <span className="text-red-400">Full</span>
            : status === SLOT_STATUS.FEW_SEATS_LEFT
              ? <span className="text-amber-600">{seatsLeft} left</span>
              : <span className="text-blue-500 opacity-70">{seatsLeft} avail</span>
          }
        </div>
      )}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function resolveSlotStatus(slot, capacity) {
  // `seat` in get-slots = seats LEFT (only present for partially filled group slots)
  if (capacity == null) {
    // One-to-one: no seat concept — slot is either available or has event
    return {
      status:    slot.eveId ? SLOT_STATUS.FULL : SLOT_STATUS.AVAILABLE,
      seatsLeft: null,
    };
  }

  if (slot.seat != null) {
    const seatsLeft = Number(slot.seat);
    if (seatsLeft <= 0) return { status: SLOT_STATUS.FULL, seatsLeft: 0 };
    if (seatsLeft / capacity <= 0.2) return { status: SLOT_STATUS.FEW_SEATS_LEFT, seatsLeft };
    return { status: SLOT_STATUS.AVAILABLE, seatsLeft };
  }

  // No eveId and no seat = fully open slot
  return { status: SLOT_STATUS.AVAILABLE, seatsLeft: capacity };
}

function statusTooltip(status, seatsLeft, capacity) {
  if (status === SLOT_STATUS.FULL)           return 'This slot is full';
  if (status === SLOT_STATUS.OUTSIDE_WINDOW) return 'Outside booking window';
  if (status === SLOT_STATUS.FEW_SEATS_LEFT) return `${seatsLeft} of ${capacity} seats left`;
  return 'Click to book';
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
