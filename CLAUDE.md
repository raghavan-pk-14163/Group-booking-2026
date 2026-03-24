# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with mock API (default port 5173)
npm run build      # Production build
npm run preview    # Preview production build
```

No test runner is configured. There is no linter configured.

To run on a specific port: `npm run dev -- --port 5175`

## Architecture

**Stack:** React 19 + Vite + Tailwind CSS. No router library — routing is manual via `window.location.pathname` in `App.jsx`.

### Two entry points

| URL | Component | Who sees it |
|-----|-----------|-------------|
| `/` | `AppointmentBookingPanel` mounted inside the real Zoho Calendar grid HTML | Organizer (calendar owner) |
| `/slot-booking/:id` | `PublicBookingPage` (full-page, replaces DOM) | Visitor booking an appointment |

### index.html — Calendar grid integration

`index.html` is **generated** from `Current UI/zoho_calendar_grid_ui.html`. It is the authentic Zoho Calendar week-view DOM snapshot, with three injections:
1. A `<style>` block adding `#zm-appt-booking-panel` (right sidebar, 300px) inside `.zmWrapper`
2. `<div id="zm-appt-booking-panel"><div id="root"></div></div>` injected as the last child of `.zmWrapper`
3. `<script type="module" src="/src/main.jsx"></script>` before `</body>`

**Do not manually edit `index.html`** — regenerate it by re-running the Python injection script if the source HTML changes.

`src/main.jsx` detects `/slot-booking/` routes and replaces `document.body.innerHTML` before mounting, so the calendar grid HTML does not interfere with the full-page public booking view.

### Mock API

The entire backend is mocked inside `vite.config.js` as a Vite dev-server middleware. It intercepts all requests to `/zcal/slotBooking?mode=*` and responds from an in-memory `mockBookings` array. There is no separate backend — all API logic lives in `vite.config.js`. The real API layer is `src/api/slotBookingApi.js`.

### Booking types

There are two booking types defined in `src/constants/bookingConstants.js`:

- `BOOKING_TYPE.ONE_TO_ONE` (0) — single attendee per slot (standard)
- `BOOKING_TYPE.ONE_TO_MANY` (1) — group booking, multiple attendees per slot

Group bookings are **org-only** (visibility locked to `VISIBILITY.ORGANISATION`). The booking type cannot be changed after creation.

### Slot data shape

`get-slots` returns `{ "YYYY-MM-DD": [{ time, seat?, eveId? }] }` where:
- No `eveId`, no `seat` → slot is fully open
- `eveId` present, `seat` present → partially filled group slot; `seat` = seats **remaining**
- `seat === 0` → slot is full

The `SLOT_STATUS` enum (`available` / `few_seats_left` / `full` / `outside_window`) is derived client-side from `seat` and `slotCapacity`. "Few seats left" triggers when ≤ 20% of capacity remains.

### Component tree

```
App
├── (default) Mock Calendar Shell
│   └── AppointmentBookingPanel          # orchestrator: list + dialogs
│       ├── BookingPageCard              # per-booking card with ⋮ menu
│       ├── BookingPageSetup             # create/edit dialog (two-panel: form + live preview)
│       │   ├── AppointmentDetails       # booking type toggle, title, dates, meeting type, visibility
│       │   ├── GroupBookingSection      # seat capacity, attendee visibility, scheduling window (group only)
│       │   ├── GeneralAvailability      # calendar conflict check, duration, per-day hours
│       │   ├── BookingLimits            # buffer before/after, max bookings/day
│       │   └── Branding                 # logo, company name
│       └── BookedSlotsView              # organizer's week-by-week booked slot manager
│
└── /slot-booking/:id → PublicBookingPage
    ├── Sidebar (branding, booking details, mini-calendar)
    ├── SlotGrid                          # 7-column week view; slots colour-coded by status
    └── ScheduleModal                     # 3-step: form → OTP → confirmed
```

### State management

- `useSlotBookingList` (hook) — manages the organizer's booking pages list; uses React 19 `useOptimistic` for instant delete/duplicate feedback.
- `useBookedSlots` (hook) — manages the organizer's booked-slots view for a single booking page.
- `useActionState` (React 19) — used in `BookingPageSetup` and `ScheduleModal` for async form submission with pending/error state.

### Key constants

All booking-related enums, error codes, error messages, and defaults are centralised in `src/constants/bookingConstants.js`. Error codes from the API map to user-facing messages via `resolveError()` in `src/hooks/useSlotBooking.js`.

### The `Group SlotBooking APIs changes.txt` and context `.md` files

`Group SlotBooking APIs changes.txt` — full API contract spec (payloads, response shapes, error codes) for the real Zoho Calendar backend. Reference this when modifying `slotBookingApi.js` or `vite.config.js` mock responses.

`APPOINTMENT_BOOKING_CONTEXT.md` and `Current UI/BOOKING_FLOW_CONTEXT.md` — describe the live Zoho Calendar UI that this prototype mirrors. Reference for UI parity questions.

`Current UI/*.html` — full DOM snapshots of the live Zoho Calendar booking pages. Use as the visual/CSS reference when matching the real product UI.
