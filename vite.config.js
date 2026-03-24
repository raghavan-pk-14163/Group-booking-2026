import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ── Mock in-memory store ──────────────────────────────────────────────────────
const NOW = Date.now();

let mockBookings = [
  {
    id: 'bk-001',
    title: 'Team Standup',
    type: 1,
    slotDuration: 30,
    slotCapacity: 10,
    visibility: 0,
    conference: ['none'],
    conference_type: null,
    location: '',
    organizerName: 'Raghavan',
    userTimezone: 'Asia/Kolkata',
    slotBookingLink: '/slot-booking/bk-001',
    branding: { logoUrl: '', companyName: 'Zoho Calendar' },
    startDate: NOW,
    endDate: NOW + 30 * 86400000,
    confirmMode: 0,
    perUserLimit: 0,
    waitlistEnabled: true,
  },
  {
    id: 'bk-002',
    title: 'Product Demo',
    type: 1,
    slotDuration: 60,
    slotCapacity: 25,
    visibility: 1,
    conference: ['zmeeting'],
    conference_type: 'video',
    location: '',
    organizerName: 'Raghavan',
    userTimezone: 'Asia/Kolkata',
    slotBookingLink: '/slot-booking/bk-002',
    branding: { logoUrl: '', companyName: 'Zoho Calendar' },
    startDate: NOW,
    endDate: NOW + 60 * 86400000,
    confirmMode: 1,
    perUserLimit: 2,
    waitlistEnabled: false,
  },
  {
    id: 'bk-003',
    title: '1:1 Check-in',
    type: 0,
    slotDuration: 30,
    slotCapacity: null,
    visibility: 0,
    conference: ['zmeeting'],
    conference_type: 'audio',
    location: '',
    organizerName: 'Raghavan',
    userTimezone: 'Asia/Kolkata',
    slotBookingLink: '/slot-booking/bk-003',
    branding: { logoUrl: '', companyName: 'Zoho Calendar' },
    startDate: NOW,
    endDate: NOW + 14 * 86400000,
    confirmMode: 0,
    perUserLimit: 0,
    waitlistEnabled: false,
  },
];

// ── Mock attendee store (eventId → attendee[]) ──────────────────────────────
const MOCK_NAMES = ['Aarav M.', 'Priya K.', 'Vikram S.', 'Sanya R.', 'Deepak J.', 'Ananya T.', 'Karthik N.', 'Meera P.'];
const mockAttendees = {};

function getAttendeesForEvent(eveId) {
  if (!mockAttendees[eveId]) {
    const count = Math.floor(Math.random() * 4) + 1;
    mockAttendees[eveId] = Array.from({ length: count }, (_, i) => ({
      name: MOCK_NAMES[(i + eveId.charCodeAt(3)) % MOCK_NAMES.length],
      email: `${MOCK_NAMES[(i + eveId.charCodeAt(3)) % MOCK_NAMES.length].toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      bookedAt: Date.now() - Math.floor(Math.random() * 86400000),
    }));
  }
  return mockAttendees[eveId];
}

// ── Mock waitlist store (eventId → waitlist[]) ──────────────────────────────
const mockWaitlist = {};

function getWaitlistForEvent(eveId) {
  if (!mockWaitlist[eveId]) mockWaitlist[eveId] = [];
  return mockWaitlist[eveId];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseIcsDate(ics) {
  const s = String(ics).replace(/T.*/, '');
  const y = s.slice(0, 4), mo = s.slice(4, 6), d = s.slice(6, 8);
  return new Date(`${y}-${mo}-${d}T00:00:00`);
}

function generateSlots(startDateStr, endDateStr, capacity) {
  const start = parseIcsDate(startDateStr || '');
  const end   = parseIcsDate(endDateStr   || '');
  if (isNaN(start) || isNaN(end)) return {};

  const result = {};
  const cur = new Date(start);

  while (cur <= end) {
    const dow = cur.getDay();
    if (dow >= 1 && dow <= 5) {
      const key = cur.toISOString().slice(0, 10);
      if (capacity) {
        result[key] = [
          { time: '09:00' },
          { time: '09:30' },
          { time: '10:00', seat: Math.floor(capacity * 0.15), eveId: `ev-${key}-1` },
          { time: '10:30', seat: 0, eveId: `ev-${key}-2` },
          { time: '11:00' },
          { time: '14:00', seat: Math.floor(capacity * 0.8), eveId: `ev-${key}-3` },
          { time: '14:30' },
          { time: '15:00' },
        ];
      } else {
        result[key] = [
          { time: '09:00' },
          { time: '10:00', eveId: `ev-${key}-1` },
          { time: '11:00' },
          { time: '14:00' },
          { time: '15:00', eveId: `ev-${key}-2` },
        ];
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function generateBookedSlots(startDateStr, endDateStr, capacity) {
  const all = generateSlots(startDateStr, endDateStr, capacity);
  const result = {};
  for (const [date, daySlots] of Object.entries(all)) {
    const booked = daySlots
      .filter(s => s.eveId)
      .map(s => ({
        ...s,
        attendees: getAttendeesForEvent(s.eveId),
        waitlist: getWaitlistForEvent(s.eveId),
      }));
    if (booked.length > 0) result[date] = booked;
  }
  return result;
}

function readBody(req) {
  return new Promise(resolve => {
    let buf = '';
    req.on('data', c => (buf += c));
    req.on('end', () => {
      try { resolve(JSON.parse(buf || '{}')); }
      catch { resolve({}); }
    });
  });
}

function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// ── Route handler ─────────────────────────────────────────────────────────────
async function mockHandler(req, res) {
  const url  = new URL(req.url, 'http://localhost');
  const mode = url.searchParams.get('mode');
  const id   = url.searchParams.get('id');

  // ── list ──────────────────────────────────────────────────────────────────
  if (mode === 'list') {
    return json(res, { status: 'SUCCESS', bookings: mockBookings });
  }

  // ── get ───────────────────────────────────────────────────────────────────
  if (mode === 'get' && id) {
    const booking = mockBookings.find(b => b.id === id);
    if (!booking) return json(res, { status: 'FAILURE', message: 'Not found' }, 404);
    return json(res, { status: 'SUCCESS', ...booking });
  }

  // ── create ────────────────────────────────────────────────────────────────
  if (mode === 'create') {
    const payload = await readBody(req);
    const newId   = `bk-${Date.now()}`;
    const newBooking = {
      id: newId,
      slotBookingLink: `/slot-booking/${newId}`,
      organizerName: 'Raghavan',
      userTimezone: 'Asia/Kolkata',
      branding: { logoUrl: payload.branding?.logoUrl ?? '', companyName: payload.branding?.companyName ?? '' },
      startDate: Date.now(),
      endDate:   Date.now() + 30 * 86400000,
      ...payload,
      slotDuration: payload.duration ?? payload.slotDuration ?? 30,
    };
    mockBookings.push(newBooking);
    return json(res, { status: 'SUCCESS', booking: newBooking, id: newId });
  }

  // ── update ────────────────────────────────────────────────────────────────
  if (mode === 'update' && id) {
    const payload = await readBody(req);
    mockBookings = mockBookings.map(b =>
      b.id === id ? { ...b, ...payload, slotDuration: payload.duration ?? payload.slotDuration ?? b.slotDuration } : b
    );
    return json(res, { status: 'SUCCESS' });
  }

  // ── delete ────────────────────────────────────────────────────────────────
  if (mode === 'delete' && id) {
    mockBookings = mockBookings.filter(b => b.id !== id);
    return json(res, { status: 'SUCCESS' });
  }

  // ── duplicate ─────────────────────────────────────────────────────────────
  if (mode === 'duplicate' && id) {
    const src = mockBookings.find(b => b.id === id);
    if (src) {
      const newId = `bk-${Date.now()}`;
      mockBookings.push({ ...src, id: newId, title: `${src.title} (copy)`, slotBookingLink: `/slot-booking/${newId}` });
    }
    return json(res, { status: 'SUCCESS' });
  }

  // ── get-slots (public) ────────────────────────────────────────────────────
  if (mode === 'get-slots' && id) {
    const booking = mockBookings.find(b => b.id === id);
    const startDate = url.searchParams.get('startDate') || '';
    const endDate   = url.searchParams.get('endDate')   || '';
    const capacity  = booking?.slotCapacity ?? null;
    const slots = generateSlots(startDate, endDate, capacity);
    return json(res, {
      status: 'SUCCESS', slots,
      timezone: booking?.userTimezone ?? 'UTC',
      waitlistEnabled: booking?.waitlistEnabled ?? false,
      confirmMode: booking?.confirmMode ?? 0,
    });
  }

  // ── get-booked-slots (organizer) ──────────────────────────────────────────
  if (mode === 'get-booked-slots' && id) {
    const booking = mockBookings.find(b => b.id === id);
    const startDate = url.searchParams.get('startDate') || '';
    const endDate   = url.searchParams.get('endDate')   || '';
    const capacity  = booking?.slotCapacity ?? null;
    const slots = generateBookedSlots(startDate, endDate, capacity);
    return json(res, { status: 'SUCCESS', slots, timezone: booking?.userTimezone ?? 'UTC' });
  }

  // ── book ──────────────────────────────────────────────────────────────────
  if (mode === 'book') {
    const booking = mockBookings.find(b => b.id === id);
    const isPending = booking?.confirmMode === 1;
    return json(res, {
      status: 'SUCCESS',
      message: isPending ? 'Booking request submitted. Awaiting organizer approval.' : 'Booking confirmed.',
      confirmStatus: isPending ? 'pending' : 'confirmed',
    });
  }

  // ── send-otp ──────────────────────────────────────────────────────────────
  if (mode === 'send-otp') {
    return json(res, { status: 'SUCCESS', message: 'OTP sent. (dev: use any 4+ digit code)' });
  }

  // ── add-attendee ──────────────────────────────────────────────────────────
  if (mode === 'add-attendee') {
    const payload = await readBody(req);
    if (payload.eventId) {
      if (!mockAttendees[payload.eventId]) mockAttendees[payload.eventId] = [];
      mockAttendees[payload.eventId].push({
        name: payload.name ?? 'New Attendee',
        email: payload.email ?? 'new@example.com',
        bookedAt: Date.now(),
      });
    }
    return json(res, { status: 'SUCCESS' });
  }

  // ── remove-attendee ───────────────────────────────────────────────────────
  if (mode === 'remove-attendee') {
    const payload = await readBody(req);
    if (payload.eventId && mockAttendees[payload.eventId]) {
      mockAttendees[payload.eventId] = mockAttendees[payload.eventId].filter(a => a.email !== payload.email);
    }
    return json(res, { status: 'SUCCESS' });
  }

  // ── remove-me ─────────────────────────────────────────────────────────────
  if (mode === 'remove-me') {
    return json(res, { status: 'SUCCESS' });
  }

  // ── join-waitlist ─────────────────────────────────────────────────────────
  if (mode === 'join-waitlist') {
    const payload = await readBody(req);
    const eveId = payload.eventId ?? 'unknown';
    if (!mockWaitlist[eveId]) mockWaitlist[eveId] = [];
    mockWaitlist[eveId].push({
      name: payload.name ?? 'Waitlisted',
      email: payload.email ?? 'wait@example.com',
      joinedAt: Date.now(),
      status: 'queued',
    });
    return json(res, { status: 'SUCCESS', message: 'You have been added to the waitlist.' });
  }

  // ── get-waitlist ──────────────────────────────────────────────────────────
  if (mode === 'get-waitlist') {
    const eventId = url.searchParams.get('eventId') || '';
    return json(res, { status: 'SUCCESS', waitlist: mockWaitlist[eventId] ?? [] });
  }

  // ── promote-waitlist ──────────────────────────────────────────────────────
  if (mode === 'promote-waitlist') {
    const payload = await readBody(req);
    const list = mockWaitlist[payload.eventId];
    if (list) {
      const entry = list.find(w => w.email === payload.email);
      if (entry) entry.status = 'promoted';
    }
    return json(res, { status: 'SUCCESS', message: 'Attendee promoted from waitlist.' });
  }

  // ── cancel-slot ───────────────────────────────────────────────────────────
  if (mode === 'cancel-slot') {
    const payload = await readBody(req);
    if (payload.eventId) {
      delete mockAttendees[payload.eventId];
      delete mockWaitlist[payload.eventId];
    }
    return json(res, { status: 'SUCCESS', message: 'Slot cancelled.' });
  }

  return json(res, { status: 'FAILURE', message: `Unknown mode: ${mode}` }, 400);
}

// ── Vite config ───────────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-slot-booking-api',
      configureServer(server) {
        server.middlewares.use('/zcal/slotBooking', (req, res, next) => {
          mockHandler(req, res).catch(next);
        });
      },
    },
  ],
});
