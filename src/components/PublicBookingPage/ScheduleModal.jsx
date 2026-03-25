import React, { useState, useActionState } from 'react';
import SeatBadge from '../shared/SeatBadge';
import ErrorBanner from '../shared/ErrorBanner';
import Spinner from '../shared/Spinner';
import { bookSlot, sendOtp, joinWaitlist, removeMeFromSlot } from '../../api/slotBookingApi';
import { BOOKING_TYPE, SLOT_STATUS, CONFIRM_MODE } from '../../constants/bookingConstants';
import { resolveError } from '../../hooks/useSlotBooking';

export default function ScheduleModal({
  bookingId,
  booking,
  selectedDate,
  selectedSlot,
  onConfirmed,
  onClose,
}) {
  const [step, setStep]   = useState('form');
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp]     = useState('');
  const [seats, setSeats] = useState(1);

  const isGroup   = booking.type === BOOKING_TYPE.ONE_TO_MANY;
  const capacity  = booking.slotCapacity ?? null;
  const seatsLeft = selectedSlot.seat != null ? Number(selectedSlot.seat) : capacity;
  const isFull    = seatsLeft != null && seatsLeft <= 0;
  const status    = seatsLeft != null
    ? (seatsLeft <= 0
        ? SLOT_STATUS.FULL
        : seatsLeft / capacity <= 0.2 ? SLOT_STATUS.FEW_SEATS_LEFT : SLOT_STATUS.AVAILABLE)
    : SLOT_STATUS.AVAILABLE;

  const waitlistEnabled = booking.waitlistEnabled ?? false;
  const isApprovalMode  = booking.confirmMode === CONFIRM_MODE.APPROVAL;

  // Multi-seat derived values
  const maxSeats              = seatsLeft ?? 1;
  const remainingAfterSelect  = seatsLeft != null ? seatsLeft - seats : null;
  const isWaitlistFlow        = isFull && waitlistEnabled;
  const seatsExceedAvail      = isGroup && !isWaitlistFlow && seats > maxSeats;

  // Plural-aware helpers
  const seatWord   = seats === 1 ? 'Seat' : 'Seats';
  const seatPhrase = seats === 1 ? '1 seat' : `${seats} seats`;

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const [sendState, sendAction, isSending] = useActionState(
    async (_prev, _fd) => {
      try {
        await sendOtp(bookingId, email);
        setStep('otp');
        return { error: null };
      } catch (err) {
        return { error: resolveError(err) };
      }
    },
    { error: null }
  );

  // ── Step 2: Verify OTP + Book ───────────────────────────────────────────────
  const [bookState, bookAction, isBooking] = useActionState(
    async (_prev, _fd) => {
      try {
        const startIcs = toIcsDatetime(selectedDate, selectedSlot.time);
        const endIcs   = addMinutes(startIcs, booking.slotDuration ?? 30);

        const result = await bookSlot(bookingId, {
          title: booking.title,
          dateandtime: {
            start: startIcs, end: endIcs,
            timezone: booking.userTimezone ?? 'UTC',
          },
          email,
          seats,                                         // ← NEW: multi-seat count
          conference: booking.conference?.[0] === 'zmeeting' ? 2 : 1,
          eventId: selectedSlot.eveId,
        }, otp);

        if (result.confirmStatus === 'pending') {
          setStep('pending');
        } else {
          setStep('confirmed');
        }
        return { error: null };
      } catch (err) {
        return { error: resolveError(err) };
      }
    },
    { error: null }
  );

  // ── Waitlist join ───────────────────────────────────────────────────────────
  const [waitlistState, waitlistAction, isJoiningWaitlist] = useActionState(
    async (_prev, _fd) => {
      try {
        await joinWaitlist(bookingId, {
          eventId: selectedSlot.eveId,
          name, email, seats,
          date: selectedDate,
          time: selectedSlot.time,
        });
        setStep('waitlisted');
        return { error: null };
      } catch (err) {
        return { error: resolveError(err) };
      }
    },
    { error: null }
  );

  const apptDate = formatApptDate(selectedDate, selectedSlot.time, booking.slotDuration ?? 30);

  // Form validity
  const formValid = name.trim() && email.trim() && !seatsExceedAvail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden">

        {/* ── Terminal states ── */}
        {step === 'confirmed' && (
          <ConfirmedScreen
            name={name}
            apptDate={apptDate}
            isGroup={isGroup}
            seatPhrase={seatPhrase}
            seats={seats}
            bookingId={bookingId}
            eventId={selectedSlot.eveId}
            email={email}
            onBookAnother={() => {
              onConfirmed();   // refresh slots, then parent clears selectedSlot
            }}
            onClose={onClose}
          />
        )}

        {step === 'pending' && (
          <TerminalScreen
            icon="⏳" iconBg="bg-amber-100" iconColor="text-amber-600"
            title="Awaiting Approval"
            body={<>Hi <strong>{name}</strong>, your request for <strong>{seatPhrase}</strong> on <strong>{apptDate}</strong> has been submitted. The organizer will review and confirm your reservation.</>}
            sub="You'll receive an email once your booking is approved or declined."
            onClose={onClose}
          />
        )}

        {step === 'waitlisted' && (
          <WaitlistedScreen
            name={name}
            seatPhrase={seatPhrase}
            apptDate={apptDate}
            email={email}
            bookingId={bookingId}
            selectedSlot={selectedSlot}
            onClose={onClose}
          />
        )}

        {/* ── Active form states ── */}
        {!['confirmed', 'pending', 'waitlisted'].includes(step) && (
          <div className="flex flex-col sm:flex-row">

            {/* Left: Appointment summary */}
            <div className="sm:w-2/5 bg-gray-50 p-6 border-b sm:border-b-0 sm:border-r border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {isGroup ? `Reserve ${seatWord}` : 'Schedule Appointment'}
              </h2>

              <dl className="space-y-3 text-sm">
                <DetailRow icon="📅" label="Date & time" value={apptDate} />
                <DetailRow icon="⏱" label="Duration" value={`${booking.slotDuration ?? 30} minutes`} />
                {booking.location && <DetailRow icon="📍" label="Location" value={booking.location} />}
                <DetailRow
                  icon={booking.conference?.[0] === 'zmeeting' ? '💻' : '📋'}
                  label="Conference"
                  value={booking.conference?.[0] === 'zmeeting'
                    ? (booking.conference_type === 'video' ? 'Zoho Video Meeting' : 'Zoho Audio Meeting')
                    : 'None'}
                />
                <DetailRow icon="🌐" label="Timezone" value={booking.userTimezone ?? 'UTC'} />
                {/* Seats selected (group only) */}
                {isGroup && !isFull && (
                  <DetailRow icon="🪑" label="Seats selected" value={seatPhrase} />
                )}
              </dl>

              {/* Seat availability (group only) */}
              {isGroup && seatsLeft != null && (
                <div className="mt-5 space-y-2">
                  <SeatBadge seatsLeft={seatsLeft} capacity={capacity} status={status} />
                  {/* Dynamic remaining after selection */}
                  {!isFull && seats > 0 && remainingAfterSelect != null && (
                    <div className={`text-xs px-3 py-1.5 rounded-md ${
                      remainingAfterSelect < 0
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {remainingAfterSelect < 0
                        ? `Only ${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} available`
                        : `${remainingAfterSelect} seat${remainingAfterSelect !== 1 ? 's' : ''} remaining after your selection`}
                    </div>
                  )}
                </div>
              )}

              {/* Approval mode notice */}
              {isApprovalMode && !isFull && (
                <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                  This session requires organizer approval. Your request will be reviewed after submission.
                </div>
              )}

              {/* Full slot notice with waitlist option */}
              {isFull && waitlistEnabled && (
                <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
                  This session is full. You can join the waitlist to be notified if a seat opens up.
                </div>
              )}
            </div>

            {/* Right: Form */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  {step === 'form' ? 'Enter your details' : 'Enter OTP'}
                </h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>

              {/* Step 1: Name + Email + Seats */}
              {step === 'form' && (
                <form action={isFull && waitlistEnabled ? waitlistAction : sendAction} className="space-y-4">
                  {sendState.error && <ErrorBanner message={sendState.error} />}
                  {waitlistState.error && <ErrorBanner message={waitlistState.error} />}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)} required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Seat quantity selector (group only, not full) */}
                  {isGroup && !isFull && seatsLeft > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Number of seats
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSeats(s => Math.max(1, s - 1))}
                          disabled={seats <= 1}
                          className="h-9 w-9 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                        >−</button>
                        <input
                          type="number"
                          min={1}
                          max={maxSeats}
                          value={seats}
                          onChange={e => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v) && v >= 1) setSeats(v);
                          }}
                          className="h-9 w-14 rounded-md border border-gray-300 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setSeats(s => Math.min(maxSeats, s + 1))}
                          disabled={seats >= maxSeats}
                          className="h-9 w-9 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                        >+</button>
                        <span className="text-xs text-gray-400 ml-2">of {seatsLeft} available</span>
                      </div>
                      {seatsExceedAvail && (
                        <p className="text-xs text-red-500 mt-1">
                          Only {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available for this slot.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={onClose}
                      className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit"
                      disabled={!formValid || (isFull && waitlistEnabled ? isJoiningWaitlist : isSending)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: isFull && waitlistEnabled ? '#3b82f6' : '#2563eb' }}>
                      {(isFull && waitlistEnabled ? isJoiningWaitlist : isSending) && <Spinner size={14} />}
                      {isFull && waitlistEnabled ? 'Join Waitlist' : 'Send OTP'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <form action={bookAction} className="space-y-4">
                  {bookState.error && <ErrorBanner message={bookState.error} />}
                  <p className="text-xs text-gray-500">
                    An OTP has been sent to <strong>{email}</strong>. Enter it below to {isGroup ? `reserve your ${seatPhrase}` : 'confirm your booking'}.
                  </p>

                  {/* Show selected seats reminder on OTP step */}
                  {isGroup && (
                    <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
                      <span>🪑</span>
                      <span>Reserving <strong>{seatPhrase}</strong> for {apptDate}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">OTP <span className="text-red-500">*</span></label>
                    <input
                      type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={8}
                      placeholder="Enter OTP" required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setStep('form')}
                      className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                      ← Back
                    </button>
                    <button type="submit" disabled={isBooking || otp.length < 4}
                      className="flex-1 flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                      {isBooking && <Spinner size={14} />}
                      {isApprovalMode
                        ? 'Submit Request'
                        : (isGroup ? `Reserve ${seatPhrase}` : 'Confirm Booking')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirmed screen with two actions ───────────────────────────────────────
function ConfirmedScreen({ name, apptDate, isGroup, seatPhrase, seats, bookingId, eventId, email, onBookAnother, onClose }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled]   = useState(false);
  const [cancelError, setCancelError] = useState(null);

  async function handleCancel() {
    if (cancelling) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await removeMeFromSlot(bookingId, eventId, email, '');
      setCancelled(true);
    } catch (err) {
      setCancelError(resolveError(err));
    } finally {
      setCancelling(false);
    }
  }

  if (cancelled) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl text-gray-500">↩</div>
        <h2 className="text-lg font-semibold text-gray-900">Booking Cancelled</h2>
        <p className="text-sm text-gray-500">Your booking for <strong>{apptDate}</strong> has been cancelled.</p>
        <button type="button" onClick={onBookAnother}
          className="mt-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-4">
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-3xl text-green-600">✓</div>
      <h2 className="text-lg font-semibold text-gray-900">Booking Confirmed!</h2>
      <p className="text-sm text-gray-500">
        Hi <strong>{name}</strong>, {isGroup
          ? <>your <strong>{seatPhrase}</strong> {seats === 1 ? 'has' : 'have'} been reserved</>
          : <>your appointment has been booked</>
        } for <strong>{apptDate}</strong>. A confirmation email with your calendar invite has been sent.
      </p>
      <p className="text-xs text-gray-400">
        You can also manage your booking using the link in your confirmation email.
      </p>

      {cancelError && (
        <div className="w-full max-w-sm">
          <ErrorBanner message={cancelError} onDismiss={() => setCancelError(null)} />
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {cancelling ? 'Cancelling…' : 'Cancel Booking'}
        </button>
        <button
          type="button"
          onClick={onBookAnother}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Book Another Appointment
        </button>
      </div>
    </div>
  );
}

// ─── Waitlisted screen with cancel option ────────────────────────────────────
function WaitlistedScreen({ name, seatPhrase, apptDate, email, bookingId, selectedSlot, onClose }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled]   = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await removeMeFromSlot(bookingId, selectedSlot.eveId, email);
      setCancelled(true);
    } catch (err) {
      setCancelError(resolveError(err));
    } finally {
      setCancelling(false);
    }
  };

  if (cancelled) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">✓</div>
        <h2 className="text-lg font-semibold text-gray-900">Waitlist Cancelled</h2>
        <p className="text-sm text-gray-500">You've been removed from the waitlist.</p>
        <button type="button" onClick={onClose}
          className="mt-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-4">
      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600">📋</div>
      <h2 className="text-lg font-semibold text-gray-900">Added to Waitlist</h2>
      <p className="text-sm text-gray-500">
        Hi <strong>{name}</strong>, this session is currently full. You've been added to the waitlist for <strong>{seatPhrase}</strong> on <strong>{apptDate}</strong>.
      </p>
      <p className="text-xs text-gray-400">You'll be notified via email if seats become available.</p>
      {cancelError && <p className="text-xs text-red-500">{cancelError}</p>}
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={handleCancel} disabled={cancelling}
          className="rounded-md border border-red-200 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">
          {cancelling ? 'Cancelling…' : 'Cancel Waitlist'}
        </button>
        <button type="button" onClick={onClose}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Terminal screens (pending) ──────────────────────────────────────────────
function TerminalScreen({ icon, iconBg, iconColor, title, body, sub, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-4">
      <div className={`h-16 w-16 rounded-full ${iconBg} flex items-center justify-center text-3xl ${iconColor}`}>{icon}</div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{body}</p>
      <p className="text-xs text-gray-400">{sub}</p>
      <button type="button" onClick={onClose}
        className="mt-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
        Done
      </button>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex gap-2">
      <span>{icon}</span>
      <div>
        <dt className="text-xs text-gray-400">{label}</dt>
        <dd className="font-medium text-gray-700">{value}</dd>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatApptDate(dateStr, timeStr, duration) {
  const start = new Date(`${dateStr}T${timeStr}`);
  const end   = new Date(start.getTime() + duration * 60000);
  const datePart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const startFmt = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const endFmt   = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${datePart}, ${startFmt} – ${endFmt}`;
}

function toIcsDatetime(dateStr, timeStr) {
  return `${dateStr.replace(/-/g, '')}T${timeStr.replace(':', '')}00`;
}

function addMinutes(icsStr, mins) {
  const date = parseIcs(icsStr);
  date.setMinutes(date.getMinutes() + mins);
  return date.toISOString().replace(/[-:]/g, '').slice(0, 15);
}

function parseIcs(icsStr) {
  const y = icsStr.slice(0, 4), mo = icsStr.slice(4, 6), d = icsStr.slice(6, 8);
  const h = icsStr.slice(9, 11), m = icsStr.slice(11, 13);
  return new Date(`${y}-${mo}-${d}T${h}:${m}:00`);
}
