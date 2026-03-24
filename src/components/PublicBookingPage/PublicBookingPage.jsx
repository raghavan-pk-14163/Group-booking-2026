import React, { useState, useEffect, useTransition } from 'react';
import SlotGrid from './SlotGrid';
import ScheduleModal from './ScheduleModal';
import Spinner from '../shared/Spinner';
import ErrorBanner from '../shared/ErrorBanner';
import { getSlots, getSlotBookingDetails } from '../../api/slotBookingApi';
import { BOOKING_TYPE } from '../../constants/bookingConstants';
import { resolveError } from '../../hooks/useSlotBooking';

/**
 * Public-facing booking page.
 * URL: /zc/view/slot-booking/:bookingId
 *
 * Props:
 *  bookingId  — from URL params
 */
export default function PublicBookingPage({ bookingId }) {
  const [booking,        setBooking]        = useState(null);
  const [slots,          setSlots]          = useState({});
  const [loading,        setLoading]        = useState(true);
  const [slotsLoading,   setSlotsLoading]   = useState(false);
  const [error,          setError]          = useState(null);
  const [weekOffset,     setWeekOffset]     = useState(0);
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [selectedSlot,   setSelectedSlot]   = useState(null);
  const [timeFormat,     setTimeFormat]     = useState('12');   // '12' | '24'
  const [visitorTz,      setVisitorTz]      = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return null; }
  });
  const [isPending,      startTransition]   = useTransition();

  const weekDates = getWeekDates(weekOffset);

  // ── Load booking details once ─────────────────────────────────────────────
  useEffect(() => {
    getSlotBookingDetails(bookingId)
      .then(res => setBooking(res))
      .catch(err => setError(resolveError(err)))
      .finally(() => setLoading(false));
  }, [bookingId]);

  // ── Load slots for current week ───────────────────────────────────────────
  useEffect(() => {
    if (!booking) return;
    setSlotsLoading(true);
    const start = toIcsDatetime(weekDates[0]);
    const end   = toIcsDatetime(weekDates[6], true);
    getSlots({ bookingId, startDate: start, endDate: end, timezone: booking.userTimezone ?? 'UTC' })
      .then(res => setSlots(res.slots ?? {}))
      .catch(err => setError(resolveError(err)))
      .finally(() => setSlotsLoading(false));
  }, [booking, weekOffset, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size={32} className="text-blue-500" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-4xl">😕</div>
          <h1 className="text-lg font-semibold text-gray-800">Unable to load booking page</h1>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const isGroup  = booking?.type === BOOKING_TYPE.ONE_TO_MANY;
  const capacity = booking?.slotCapacity ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Page body ── */}
      <div className="flex flex-col lg:flex-row max-w-5xl mx-auto w-full flex-1 gap-0 lg:gap-0">

        {/* ── Left sidebar ── */}
        <aside className="lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 px-6 py-8 shrink-0">

          {/* Branding */}
          <div className="flex items-center gap-3 mb-6">
            {booking?.branding?.logoUrl
              ? <img src={booking.branding.logoUrl} alt="" className="h-12 w-12 rounded-xl object-contain border border-gray-200" />
              : <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">🗓️</div>
            }
            <div>
              <div className="font-semibold text-gray-900">{booking?.organizerName}</div>
              {booking?.branding?.companyName && (
                <div className="text-xs text-gray-500">{booking.branding.companyName}</div>
              )}
            </div>
          </div>

          {/* Booking details */}
          <div className="space-y-3 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Booking details</h2>

            <dl className="space-y-2">
              <SidebarRow label="Title"    value={booking?.title} />
              <SidebarRow label="Duration" value={`${booking?.slotDuration ?? 30} minutes`} />
              {isGroup && capacity != null && (
                <SidebarRow label="Capacity" value={`${capacity} seats per slot`} badge="Group" />
              )}
              <SidebarRow
                label="Conference"
                value={booking?.conference?.[0] === 'zmeeting'
                  ? (booking?.conference_type === 'video' ? 'Zoho Video Meeting' : 'Zoho Audio Meeting')
                  : 'None'}
              />
              <SidebarRow label="Timezone" value={booking?.userTimezone ?? 'UTC'} />
              {visitorTz && visitorTz !== booking?.userTimezone && (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                  Your timezone: <strong>{visitorTz}</strong> — times shown in organizer's timezone.
                </div>
              )}
            </dl>
          </div>

          {/* Time format toggle */}
          <div className="mt-5 flex items-center gap-2">
            {['12', '24'].map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => setTimeFormat(fmt)}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  timeFormat === fmt
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ].join(' ')}
              >
                {fmt} Hrs
              </button>
            ))}
          </div>

          {/* Mini month calendar */}
          <div className="mt-6">
            <MiniCalendar
              weekOffset={weekOffset}
              onNavigate={delta => setWeekOffset(v => v + delta)}
            />
          </div>
        </aside>

        {/* ── Main: slot grid ── */}
        <main className="flex-1 bg-white px-6 py-8">
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => startTransition(() => setWeekOffset(v => v - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm font-medium text-gray-700">
              {formatWeekLabel(weekDates)}
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => setWeekOffset(v => v + 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Error */}
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {/* Legend for group bookings */}
          {isGroup && (
            <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
              <LegendItem color="bg-blue-100 border-blue-200"  label="Available" />
              <LegendItem color="bg-amber-100 border-amber-200" label="Few seats left" />
              <LegendItem color="bg-red-100 border-red-100"   label="Full" />
              <LegendItem color="bg-gray-100 border-gray-200" label="Outside window" />
            </div>
          )}

          {/* Slot grid */}
          <div className="relative">
            {(slotsLoading || isPending) && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                <Spinner size={24} className="text-blue-500" />
              </div>
            )}
            <SlotGrid
              slots={slots}
              weekDates={weekDates}
              capacity={capacity}
              bookingType={booking?.type ?? BOOKING_TYPE.ONE_TO_ONE}
              onSelect={(date, slot) => {
                setSelectedDate(date);
                setSelectedSlot(slot);
              }}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200">
        © {new Date().getFullYear()}, Zoho Calendar. All Rights Reserved.
      </footer>

      {/* Schedule modal */}
      {selectedSlot && (
        <ScheduleModal
          bookingId={bookingId}
          booking={booking}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onConfirmed={() => {
            setSelectedSlot(null);
            // Refresh slots to update seat counts
            setSlotsLoading(true);
            const start = toIcsDatetime(weekDates[0]);
            const end   = toIcsDatetime(weekDates[6], true);
            getSlots({ bookingId, startDate: start, endDate: end, timezone: booking.userTimezone ?? 'UTC' })
              .then(res => setSlots(res.slots ?? {}))
              .finally(() => setSlotsLoading(false));
          }}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}

// ─── SidebarRow ───────────────────────────────────────────────────────────────
function SidebarRow({ label, value, badge }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-gray-700">
        {value}
        {badge && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{badge}</span>
        )}
      </dd>
    </div>
  );
}

// ─── MiniCalendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ weekOffset, onNavigate }) {
  const today       = new Date();
  const displayDate = new Date(today);
  displayDate.setDate(today.getDate() + weekOffset * 7);
  const monthLabel  = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => onNavigate(-4)} className="text-gray-400 hover:text-gray-600 text-xs">◀◀</button>
        <button type="button" onClick={() => onNavigate(-1)} className="text-gray-400 hover:text-gray-600 text-xs">◀</button>
        <span className="text-xs font-medium text-gray-700">{monthLabel}</span>
        <button type="button" onClick={() => onNavigate(1)} className="text-gray-400 hover:text-gray-600 text-xs">▶</button>
        <button type="button" onClick={() => onNavigate(4)} className="text-gray-400 hover:text-gray-600 text-xs">▶▶</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-gray-400">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="font-medium">{d}</div>
        ))}
        <MiniCalendarDays displayDate={displayDate} onNavigate={onNavigate} weekOffset={weekOffset} />
      </div>
    </div>
  );
}

function MiniCalendarDays({ displayDate, onNavigate, weekOffset }) {
  const year  = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(<div key={`pad-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const isToday  = isSameDay(cellDate, today);
    cells.push(
      <button
        key={d}
        type="button"
        onClick={() => {
          const diff = Math.round((cellDate - today) / (7 * 86400000));
          onNavigate(diff - weekOffset);
        }}
        className={[
          'h-6 w-6 mx-auto rounded-full text-xs transition-colors',
          isToday ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-gray-700',
        ].join(' ')}
      >
        {d}
      </button>
    );
  }
  return <>{cells}</>;
}

// ─── LegendItem ───────────────────────────────────────────────────────────────
function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3 w-3 rounded border ${color}`} />
      <span>{label}</span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekDates(offset = 0) {
  const today   = new Date();
  const sunday  = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + offset * 7);
  sunday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function toIcsDatetime(date, endOfDay = false) {
  const d = new Date(date);
  if (endOfDay) d.setHours(23, 59, 59);
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15);
}

function formatWeekLabel(dates) {
  const start = dates[0];
  const end   = dates[6];
  const opts  = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
