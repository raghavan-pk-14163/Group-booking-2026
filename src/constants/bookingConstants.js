// ─── Booking Type ────────────────────────────────────────────────────────────
export const BOOKING_TYPE = {
  ONE_TO_ONE: 0,
  ONE_TO_MANY: 1,
};

export const BOOKING_TYPE_LABEL = {
  [BOOKING_TYPE.ONE_TO_ONE]: 'One-to-One',
  [BOOKING_TYPE.ONE_TO_MANY]: 'Group Booking',
};

// ─── Visibility ───────────────────────────────────────────────────────────────
export const VISIBILITY = {
  ORGANISATION: 0,
  PUBLIC: 1,
};

// Group booking is org-only (API constraint)
export const VISIBILITY_OPTIONS = [
  { value: VISIBILITY.ORGANISATION, label: 'Organization', description: 'Only organization users can view.' },
  { value: VISIBILITY.PUBLIC,       label: 'Public',       description: 'Anyone with the link can view.' },
];

// ─── Conference ───────────────────────────────────────────────────────────────
export const CONFERENCE = {
  NONE:     'none',
  INPERSON: 'inperson',
  ZMEETING: 'zmeeting',
};

export const CONFERENCE_TYPE = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

// ─── Scheduling Window Units ──────────────────────────────────────────────────
export const SCHEDULING_UNIT = {
  HOURS: 0,
  DAYS:  1,
};

export const SCHEDULING_UNIT_LABEL = {
  [SCHEDULING_UNIT.HOURS]: 'Hours',
  [SCHEDULING_UNIT.DAYS]:  'Days',
};

// ─── Attendee Permission ──────────────────────────────────────────────────────
export const ATT_PERMISSION = {
  HIDDEN:  0,   // attendees cannot see each other (default)
  VISIBLE: 1,   // attendees can see each other
};

// ─── Slot Capacity ────────────────────────────────────────────────────────────
export const SLOT_CAPACITY = {
  MIN: 2,
  MAX: 2000,
  DEFAULT: 10,
};

// ─── Slot Availability States ─────────────────────────────────────────────────
export const SLOT_STATUS = {
  AVAILABLE:       'available',
  FEW_SEATS_LEFT:  'few_seats_left',   // seats left <= 20% of capacity
  FULL:            'full',
  OUTSIDE_WINDOW:  'outside_window',
};

export const SLOT_STATUS_LABEL = {
  [SLOT_STATUS.AVAILABLE]:      'Available',
  [SLOT_STATUS.FEW_SEATS_LEFT]: 'Few seats left',
  [SLOT_STATUS.FULL]:           'Full',
  [SLOT_STATUS.OUTSIDE_WINDOW]: 'Outside booking window',
};

// ─── Error Codes ──────────────────────────────────────────────────────────────
export const ERROR_CODE = {
  GENERAL:                   101,
  ACCESS_DENIED:             102,
  BOOKING_EXPIRED:           103,
  BOOKING_NOT_FOUND:         104,
  USER_NOT_FOUND:            105,
  INVALID_INPUT:             106,
  SLOT_UNAVAILABLE:          107,
  SLOT_LOCKED:               107,   // same code, different message
  MAX_BOOKINGS_REACHED:      108,
  INVALID_OTP:               109,
  FEATURE_NOT_ENABLED:       110,
  OTP_NOT_PROVIDED:          111,
  OUTSIDE_AVAILABILITY_HOURS:112,
  MAX_LINKS_LIMIT_REACHED:   113,
  EVENT_NOT_FOUND:           114,
  INVALID_EMAIL_ADDRESS:     115,
  ALREADY_BOOKED:            116,
  INVALID_SCHEDULING_WINDOW: 117,
  USER_LIMIT_REACHED:        118,
  ALREADY_ON_WAITLIST:       119,
  BOOKING_PENDING_APPROVAL:  120,
};

export const ERROR_MESSAGE = {
  [ERROR_CODE.GENERAL]:                   'Something went wrong. Please try again.',
  [ERROR_CODE.ACCESS_DENIED]:             'You do not have permission to access this booking page.',
  [ERROR_CODE.BOOKING_EXPIRED]:           'This booking link has expired.',
  [ERROR_CODE.BOOKING_NOT_FOUND]:         'Booking page not found.',
  [ERROR_CODE.USER_NOT_FOUND]:            'User not found.',
  [ERROR_CODE.INVALID_INPUT]:             'Invalid input. Please check your details.',
  [ERROR_CODE.SLOT_UNAVAILABLE]:          'This slot is no longer available. Please choose another.',
  [ERROR_CODE.MAX_BOOKINGS_REACHED]:      'Maximum bookings for this day have been reached.',
  [ERROR_CODE.INVALID_OTP]:              'The OTP entered is incorrect.',
  [ERROR_CODE.FEATURE_NOT_ENABLED]:       'Group booking is not enabled for your account.',
  [ERROR_CODE.OTP_NOT_PROVIDED]:          'Please enter the OTP sent to your email.',
  [ERROR_CODE.OUTSIDE_AVAILABILITY_HOURS]:'This slot is outside available hours.',
  [ERROR_CODE.MAX_LINKS_LIMIT_REACHED]:   'You can only create one booking page on your current plan.',
  [ERROR_CODE.EVENT_NOT_FOUND]:           'The associated event could not be found.',
  [ERROR_CODE.INVALID_EMAIL_ADDRESS]:     'Only organization email addresses are allowed for this booking.',
  [ERROR_CODE.ALREADY_BOOKED]:            'You have already booked this slot.',
  [ERROR_CODE.INVALID_SCHEDULING_WINDOW]: 'This slot is outside the allowed booking window.',
  [ERROR_CODE.USER_LIMIT_REACHED]:       'You have reached your booking limit for this event.',
  [ERROR_CODE.ALREADY_ON_WAITLIST]:      'You are already on the waitlist for this slot.',
  [ERROR_CODE.BOOKING_PENDING_APPROVAL]: 'Your booking request is pending organizer approval.',
  SLOT_LOCKED: 'Another booking is in progress. Please retry in a moment.',
};

// ─── Booking Confirmation Mode ───────────────────────────────────────────────
export const CONFIRM_MODE = {
  AUTO:     0,   // booking is confirmed immediately after OTP
  APPROVAL: 1,   // booking goes to pending → organizer approves/rejects
};

export const CONFIRM_MODE_LABEL = {
  [CONFIRM_MODE.AUTO]:     'Auto-confirm',
  [CONFIRM_MODE.APPROVAL]: 'Requires approval',
};

// ─── Waitlist ────────────────────────────────────────────────────────────────
export const WAITLIST_STATUS = {
  QUEUED:   'queued',
  PROMOTED: 'promoted',
  EXPIRED:  'expired',
};

// ─── Per-User Booking Limit ──────────────────────────────────────────────────
export const USER_LIMIT = {
  MIN: 1,
  MAX: 50,
  DEFAULT: 0,   // 0 = unlimited
};

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const DEFAULTS = {
  duration:       30,
  maxBookings:    5,
  bufferBefore:   15,
  bufferAfter:    0,
  slotCapacity:   SLOT_CAPACITY.DEFAULT,
  attPermission:  ATT_PERMISSION.HIDDEN,
  schedulingWindow: {
    minDuration: 1,
    minUnit:     SCHEDULING_UNIT.HOURS,
    maxDuration: 30,
    maxUnit:     SCHEDULING_UNIT.DAYS,
  },
  confirmMode:    CONFIRM_MODE.AUTO,
  perUserLimit:   USER_LIMIT.DEFAULT,
  waitlistEnabled: false,
};
