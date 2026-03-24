/**
 * Slot Booking API layer
 * Base URL: /zcal/slotBooking
 * All requests require authentication + CSRF token.
 */

const BASE = '/zcal/slotBooking';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Zcsrf-Token': getCsrfToken(),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok || data.status !== 'SUCCESS') {
    const err = new Error(data.message || 'Request failed');
    err.code = data.errorCode ?? null;
    err.statusText = data.status ?? null;
    throw err;
  }

  return data;
}

function getCsrfToken() {
  // Reads CSRF token from cookie — matches Zoho Calendar pattern
  const match = document.cookie.match(/zcsrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function toQueryString(params) {
  return new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
}

// ─── Create Booking Page ──────────────────────────────────────────────────────

/**
 * @param {object} payload  — see slotBookingJson template in API doc
 *   Required: title, duration, availabilitySettings, bookingDetails, schedulingWindow
 *   Group-only: type=1, slotCapacity, attPermission
 */
export async function createSlotBooking(payload) {
  return request(`${BASE}?mode=create`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Update Booking Page ──────────────────────────────────────────────────────

/**
 * @param {string} id       — booking page ID
 * @param {object} payload  — same shape as create; type cannot be changed
 */
export async function updateSlotBooking(id, payload) {
  return request(`${BASE}?mode=update&id=${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Get Booking Page Details ─────────────────────────────────────────────────

export async function getSlotBookingDetails(id) {
  return request(`${BASE}?mode=get&id=${id}`);
}

// ─── Delete Booking Page ──────────────────────────────────────────────────────

export async function deleteSlotBooking(id) {
  return request(`${BASE}?mode=delete&id=${id}`, { method: 'POST' });
}

// ─── List Booking Pages ───────────────────────────────────────────────────────

export async function listSlotBookings() {
  return request(`${BASE}?mode=list`);
}

// ─── Get Available Slots (public-facing) ──────────────────────────────────────

/**
 * Returns available slots for a booking page.
 * For OneToMany: includes `seat` (seats left) and `eveId` on partially filled slots.
 *
 * @param {string} bookingId
 * @param {string} startDate  — ICS datetime string e.g. "20260324T000000"
 * @param {string} endDate
 * @param {string} timezone
 */
export async function getSlots({ bookingId, startDate, endDate, timezone }) {
  const qs = toQueryString({ mode: 'get-slots', id: bookingId, startDate, endDate, timezone });
  return request(`${BASE}?${qs}`);
}

// ─── Book a Slot ──────────────────────────────────────────────────────────────

/**
 * @param {string} bookingId
 * @param {object} appointmentData  — see appointmentDataJson template
 *   { title, dateandtime: {start, end, timezone}, email, conference, eventId?, eventCustomFields? }
 * @param {string} otp              — OTP from email verification
 */
export async function bookSlot(bookingId, appointmentData, otp) {
  return request(`${BASE}?mode=book&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ ...appointmentData, otp }),
  });
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOtp(bookingId, email) {
  return request(`${BASE}?mode=send-otp&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ─── Get Booked Slots (organizer) ─────────────────────────────────────────────

/**
 * Returns all booked slots for a booking page.
 * Response mirrors get-slots for OneToMany; `seat` represents seats booked.
 *
 * @param {string} bookingId
 * @param {string} [startDate]  — ICS datetime string, optional filter
 * @param {string} [endDate]
 */
export async function getBookedSlots({ bookingId, startDate, endDate }) {
  const qs = toQueryString({ mode: 'get-booked-slots', id: bookingId, startDate, endDate });
  return request(`${BASE}?${qs}`);
}

// ─── Organizer: Add Attendee to Slot ─────────────────────────────────────────

export async function addAttendeeToSlot(bookingId, eventId, attendee) {
  return request(`${BASE}?mode=add-attendee&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ eventId, ...attendee }),
  });
}

// ─── Organizer: Remove Attendee from Slot ────────────────────────────────────

export async function removeAttendeeFromSlot(bookingId, eventId, attendeeEmail) {
  return request(`${BASE}?mode=remove-attendee&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ eventId, email: attendeeEmail }),
  });
}

// ─── Attendee: Remove Me ──────────────────────────────────────────────────────

/**
 * Triggered by attendee to remove themselves.
 * If no attendees remain, slot is cancelled.
 */
export async function removeMeFromSlot(bookingId, eventId, email, otp) {
  return request(`${BASE}?mode=remove-me&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ eventId, email, otp }),
  });
}

// ─── Join Waitlist ───────────────────────────────────────────────────────────

export async function joinWaitlist(bookingId, slotData) {
  return request(`${BASE}?mode=join-waitlist&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify(slotData),
  });
}

// ─── Get Waitlist (organizer) ────────────────────────────────────────────────

export async function getWaitlist(bookingId, eventId) {
  const qs = toQueryString({ mode: 'get-waitlist', id: bookingId, eventId });
  return request(`${BASE}?${qs}`);
}

// ─── Promote from Waitlist ───────────────────────────────────────────────────

export async function promoteFromWaitlist(bookingId, eventId, email) {
  return request(`${BASE}?mode=promote-waitlist&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ eventId, email }),
  });
}

// ─── Cancel Slot (organizer) ─────────────────────────────────────────────────

export async function cancelSlot(bookingId, eventId) {
  return request(`${BASE}?mode=cancel-slot&id=${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ eventId }),
  });
}

// ─── Duplicate Booking Page ───────────────────────────────────────────────────

export async function duplicateSlotBooking(id) {
  return request(`${BASE}?mode=duplicate&id=${id}`, { method: 'POST' });
}
