# Group Booking — Cross-Functional Feature Spec

**Product:** Zoho Calendar — Appointment Booking
**Feature:** Group Booking (One-to-Many Slot Booking)
**Author:** Product Management
**Status:** Implementation Review
**Last updated:** 2026-03-25

---

## 1. Feature Overview

Group Booking enables a calendar host to create appointment slots that accept **multiple participants per slot** (2–2,000 seats). Participants book individual seats in a shared time slot through a public or org-scoped booking page. The system enforces capacity, provides real-time seat availability, and supports waitlisting, approval-based booking, and per-user limits.

**Key differentiator from 1:1 booking:** A single time slot can hold N participants up to a configured capacity, with progressive visual states (available → few seats left → full) and group-specific UX (seat selector, waitlist, approval flow).

---

## 2. Problem Statement

**Current pain:** The existing 1:1 booking flow limits each slot to one attendee. Users running workshops, demos, classes, onboarding sessions, or group consultations must either:
- Create separate events manually for each attendee
- Use external coordination (email, spreadsheets) to manage multi-attendee slots
- Accept only one booking per slot and lose capacity utilization

**Impact:** Manual coordination increases no-show rates, reduces booking throughput, and creates a poor attendee experience. Competitors (Calendly, Cal.com, Microsoft Bookings) already offer group events with capacity management.

---

## 2.1 Competitor Analysis

| Capability | Calendly | Cal.com | Microsoft Bookings | Acuity | Zoho Bookings | Google Appt Schedules | OnceHub | Zoho Calendar (V1) |
|-----------|---------|--------|-------------------|--------|--------------|----------------------|---------|-------------------|
| **Group / multi-seat booking** | ✅ Group events | ✅ Collective + round-robin | ✅ Multi-attendee services | ✅ Group classes | ✅ Group services | ❌ 1:1 only | ✅ Master pages | ✅ |
| **Configurable seat capacity** | ✅ Max invitees/slot | ✅ Seats per slot | ✅ Max attendees | ✅ Class capacity | ✅ Resource capacity | ❌ | ✅ | ✅ 2–2,000 |
| **Seat availability display** | ✅ "X spots remaining" | ✅ Seats left badge | ⚠️ Limited | ✅ Spots left | ✅ Available count | ❌ | ✅ | ✅ 3 states |
| **Multi-seat per booking** | ❌ 1 seat/booking | ✅ Qty selector | ❌ 1 seat/booking | ✅ Qty selector | ⚠️ Limited | ❌ | ✅ | ✅ −/+ selector |
| **Buffer time before/after** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Min/max notice window** | ✅ | ✅ | ⚠️ Basic | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Max bookings/day** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Waitlist when full** | ❌ | ❌ | ❌ | ✅ Waiting list | ❌ | ❌ | ✅ | ❌ V2 |
| **Approval-based booking** | ❌ Auto only | ✅ Requires confirmation | ❌ | ❌ | ✅ Manual approval | ❌ | ✅ | ✅ |
| **Per-user booking limit** | ❌ | ⚠️ Via workflows | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Attendee visibility toggle** | ❌ Hidden | ❌ Hidden | ❌ Hidden | ⚠️ Class roster | ❌ | ❌ | ❌ | ✅ Private/Shared |
| **Organizer attendee management** | ✅ Cancel/reschedule | ✅ Cancel | ✅ Full CRUD | ✅ | ✅ | ⚠️ Basic | ✅ | ✅ Add/remove/cancel |
| **Custom form fields** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ V2 |
| **Timezone auto-detection** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Payments integration** | ✅ Stripe/PayPal | ✅ Stripe | ❌ | ✅ Stripe/Square | ✅ Zoho Checkout | ❌ | ✅ | ❌ V2 |
| **Recurring slot templates** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ V2 |
| **Multi-host / pooled avail** | ✅ Collective | ✅ Round-robin | ✅ Shared mailbox | ❌ | ✅ | ❌ | ✅ | ❌ V2 |

**Key takeaways:**
- **Zoho Calendar V1 is competitive** on core group booking: capacity, multi-seat, approval, per-user limits, attendee visibility
- **Gaps vs leaders:** Waitlist (Acuity, OnceHub), custom forms, payments, recurring templates, multi-host
- **Unique strength:** Per-user booking limit + attendee visibility toggle — most competitors lack both
- **V2 priorities:** Waitlist, custom form fields, recurring templates, payments

---

## 3. Goals

| # | Goal | Metric |
|---|------|--------|
| G1 | Allow hosts to create capacity-based group slots | 100% of group bookings enforce seat limits |
| G2 | Attendees can reserve 1–N seats in a single flow | Multi-seat booking completion rate ≥ 85% |
| G3 | Real-time seat availability visible to attendees | Seat count accuracy within 1 slot refresh cycle |
| G4 | Reduce manual attendee coordination | ≥ 40% reduction in manual scheduling actions for group hosts |
| G5 | Waitlist captures demand when slots fill | ≥ 10% of full-slot visitors join waitlist |
| G6 | Approval mode gives hosts booking control | Hosts using approval mode respond within 24h on ≥ 80% of requests |

---

## 4. Non-Goals

- **Payments / ticketing** — not in scope (design-ready hooks only)
- **Multi-host / pooled availability** — single host per booking page
- **Recurring slot templates** — manual date range only
- **Attendee-to-attendee messaging** — no chat or messaging
- **Calendar invite customization** — uses default event format
- **Overbooking rules** — strict capacity enforcement only
- **Invite-only / private slots** — org-scoped or public link only
- **Group video conferencing auto-scaling** — uses existing Zoho Meeting integration

---

## 5. Target Users / Personas

### Host / Organizer
- **Role:** Calendar owner creating booking pages
- **Needs:** Configure capacity, manage attendees, view utilization, handle waitlist
- **Example:** Training coordinator scheduling 10-person onboarding sessions

### Participant / Attendee (Org User)
- **Role:** Internal user booking a seat via org-scoped link
- **Needs:** See available sessions, reserve seats, get confirmation
- **Example:** New hire booking onboarding slot

### Participant / Attendee (Public)
- **Role:** External user booking via public link (1:1 only; group is org-locked)
- **Note:** Group bookings are restricted to `VISIBILITY.ORGANISATION` — public visitors cannot access group booking pages

### Admin (future)
- **Role:** Workspace admin viewing booking analytics
- **Status:** Out of scope for V1

---

## 6. Current Workflow (1:1 Booking)

1. Host creates a booking page (type = ONE_TO_ONE)
2. Host sets duration, availability hours, buffer times
3. Booking link is shared
4. Visitor opens link → sees weekly slot grid
5. Visitor clicks slot → modal opens → enters name + email
6. OTP sent → verified → booking confirmed
7. Calendar event created for host + attendee

**Limitation:** Each slot accepts exactly 1 attendee. No seat count, no waitlist, no capacity states.

---

## 7. Proposed Workflow (Group Booking)

### Host Flow
1. Host creates booking page → selects **"Group"** booking type
2. Configures:
   - Seat capacity per slot (2–2,000, default: 10)
   - Attendee visibility (private or shared roster)
   - Confirmation mode (auto-confirm or approval-required)
   - Per-user booking limit (0 = unlimited, 1–50)
   - Waitlist toggle
   - Scheduling window (min notice + max advance)
3. Sets availability (days, hours, duration, buffer)
4. Creates link → shares with org users
5. Manages bookings via **Booked Slots View**:
   - Views per-slot attendee lists
   - Manually adds/removes attendees
   - Promotes waitlisted users
   - Cancels entire slots

### Attendee Flow
1. Opens booking link → sees weekly slot grid with **seat availability per slot**
2. Clicks available slot → modal opens
3. Selects number of seats (1 to remaining capacity)
4. Enters name + email
5. **If auto-confirm:** OTP sent → verified → booking confirmed immediately
6. **If approval mode:** OTP sent → verified → booking marked pending → awaits host approval
7. **If slot full + waitlist enabled:** Joins waitlist → notified when promoted
8. Confirmation shows seat count + appointment details

---

## 8. User Stories

### Host Stories

| ID | Story | Acceptance |
|----|-------|------------|
| H1 | As a host, I can create a group booking page with a defined seat capacity | Capacity field visible when type = Group; value persisted and enforced |
| H2 | As a host, I can set whether attendees see each other | Private/Shared roster radio in setup; value passed to API |
| H3 | As a host, I can require approval before bookings are confirmed | Confirmation mode toggle in setup; pending bookings don't consume seats until approved |
| H4 | As a host, I can limit how many times one user books this event | Per-user limit field (0–50); enforced on booking attempt |
| H5 | As a host, I can enable a waitlist for full slots | Waitlist toggle in setup; attendees see "Join Waitlist" when slot is full |
| H6 | As a host, I can view all attendees for a specific slot | Booked Slots View shows expandable attendee list per slot |
| H7 | As a host, I can manually add an attendee to a slot | "Add" button on slot row; name + email form |
| H8 | As a host, I can remove an individual attendee from a slot | "Remove" button per attendee row |
| H9 | As a host, I can cancel an entire slot | "Cancel Slot" action removes all attendees + waitlist |
| H10 | As a host, I can promote a waitlisted user to confirmed | "Promote" button per waitlist entry |

### Attendee Stories

| ID | Story | Acceptance |
|----|-------|------------|
| A1 | As an attendee, I can see how many seats are left in each slot | Slot buttons show "X avail", "X left", or "Full" |
| A2 | As an attendee, I can select how many seats I want to reserve | Seat quantity selector (−/+) in booking modal; range 1 to remaining |
| A3 | As an attendee, I can see my selected seats reflected in the booking summary | Left panel shows "Seats selected: N" and "Remaining after selection" |
| A4 | As an attendee, I get a clear error if I try to book more seats than available | Inline error: "Only X seats available" + button disabled |
| A5 | As an attendee, I can join a waitlist when a slot is full | "Join Waitlist" button replaces "Send OTP" on full slots |
| A6 | As an attendee, I see a pending state when approval is required | "Awaiting Approval" terminal screen after OTP verification |
| A7 | As an attendee, I can cancel my confirmed booking | "Cancel Booking" button on confirmation screen |
| A8 | As an attendee, I can book another appointment after confirming | "Book Another Appointment" button resets flow |

---

## 9. Functional Requirements

### 9.1 Booking Page Configuration (Host)

| ID | Requirement | Field | Constraints | Default |
|----|------------|-------|-------------|---------|
| FR1 | Booking type selection | `type` | `0` (1:1) or `1` (group); **immutable after creation** | `0` |
| FR2 | Seat capacity | `slotCapacity` | Integer, 2–2,000; required when type = 1 | `10` |
| FR3 | Visibility lock | `visibility` | Group bookings forced to `0` (Organisation) | `0` |
| FR4 | Attendee visibility | `attPermission` | `0` (hidden) or `1` (visible) | `0` |
| FR5 | Confirmation mode | `confirmMode` | `0` (auto) or `1` (approval); group only | `0` |
| FR6 | Per-user limit | `perUserLimit` | `0` (unlimited) or `1–50` | `0` |
| FR7 | Waitlist toggle | `waitlistEnabled` | Boolean; group only | `false` |
| FR8 | Scheduling window | `schedulingWindow` | Min notice (hours/days) + max advance (hours/days) | 1h min, 30d max |
| FR9 | Buffer times | `bufferBefore`, `bufferAfter` | 0–120 minutes, step 5 | 15 / 0 |
| FR10 | Max bookings/day | `maxBookings` | 1–500 | `5` |

### 9.2 Slot Availability Engine

| ID | Requirement | Details |
|----|------------|---------|
| FR11 | Slot generation | Slots generated from available hours minus calendar conflicts minus buffer times |
| FR12 | Seat tracking | Each slot tracks: `seat` (remaining seats), `eveId` (event ID if any bookings exist) |
| FR13 | Status derivation | Client derives: `AVAILABLE` (>20% left), `FEW_SEATS_LEFT` (≤20% left), `FULL` (0 left), `OUTSIDE_WINDOW` |
| FR14 | Threshold | "Few seats left" triggers at `≤ Math.ceil(capacity × 0.2)` |
| FR15 | Capacity enforcement | Backend rejects booking if `requestedSeats > remainingSeats` |

### 9.3 Booking Flow (Attendee)

| ID | Requirement | Details |
|----|------------|---------|
| FR16 | Seat selector | Shown only for group bookings with available seats; range 1 to `remainingSeats` |
| FR17 | OTP verification | Email OTP required for all bookings; 4+ digit code |
| FR18 | Seat count persistence | `seats` value persists across form → OTP → confirmation steps |
| FR19 | Booking payload | `bookSlot()` sends `seats` field in request body |
| FR20 | Confirmation mode routing | If `confirmMode === 1`, booking enters `pending` state; otherwise `confirmed` |
| FR21 | Waitlist entry | If slot full + waitlist enabled, form submits to `join-waitlist` instead of `send-otp` |

### 9.4 Organizer Management

| ID | Requirement | Details |
|----|------------|---------|
| FR22 | Booked slots view | Week-by-week view of all booked slots with capacity progress bars |
| FR23 | Attendee list | Expandable per-slot list showing name, email, booking time |
| FR24 | Manual add | Organizer can add attendee to any slot with remaining capacity |
| FR25 | Remove attendee | One-by-one removal; freed seat becomes available |
| FR26 | Cancel slot | Removes all attendees + waitlist entries for a slot |
| FR27 | Waitlist promotion | Organizer manually promotes queued user → confirmed |
| FR28 | Seat count display | Each slot shows `booked / capacity` with visual progress |

---

## 10. UX / Design Requirements

### 10.1 Slot Grid (Public Booking Page)

| State | Visual | Interaction |
|-------|--------|-------------|
| Available (>20% seats) | Blue background, blue border | Clickable → opens modal |
| Few seats left (≤20%) | Amber background, amber border | Clickable → opens modal |
| Full (0 seats) | Red background, muted | Disabled; shows "Full" label |
| Outside window | Gray background | Disabled; tooltip explains |

Each group slot button shows: **time** + **seat count** ("8 avail" / "2 left" / "Full")

### 10.2 Booking Modal

**Left panel (summary):**
- Dynamic title: "Reserve a Seat" (1) / "Reserve Seats" (>1)
- Date & time, duration, conference, timezone
- Seat availability badge (color-coded by status)
- "X seats remaining after your selection" (live update)
- Approval mode warning banner (amber)
- Waitlist notice banner (blue)

**Right panel (form):**
- Name input (required)
- Email input (required)
- Seat quantity selector (group only): −/+ buttons, min 1, max remaining
- Inline validation (no alert popups)
- CTA: "Send OTP" / "Join Waitlist" (context-dependent)

**OTP step:**
- OTP input (monospace, max 8 chars)
- Seat reminder banner (group bookings)
- CTA: "Reserve {N} Seat(s)" or "Submit Request" (approval mode)

**Terminal states:**
- Confirmed: green checkmark, booking details, "Book Another" + "Cancel Booking" actions
- Pending: hourglass, "Awaiting Approval" message, "Done" button
- Waitlisted: clipboard icon, "Added to Waitlist" message, "Done" button

### 10.3 Organizer Booked Slots View

- Weekly navigation with date range header
- Per-slot row: time | progress bar | status pill | seat badge | actions
- Expandable attendee list with remove buttons
- Waitlist section with promote buttons
- "Add Attendee" modal (name + email form)
- Stats footer: total slots, total attendees

### 10.4 Design System Alignment

- Spacing scale: 4 / 8 / 12 / 16 / 24px
- Border radius: 6–8px for cards, 4px for inputs
- Colors: blue (primary/available), amber (warning/few-seats), red (error/full), green (success/confirmed), gray (disabled/muted)
- Typography: semibold for headings, normal for body, muted gray for metadata
- No browser-default styles on any control

---

## 11. Engineering Considerations

### 11.1 Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + Vite + Tailwind CSS | No router library; manual path routing in `App.jsx` |
| State | React 19 primitives (`useOptimistic`, `useActionState`, `useTransition`) | No Redux/Zustand |
| API | REST via `slotBookingApi.js` | Base: `/zcal/slotBooking?mode=...` |
| Mock | Vite dev-server middleware in `vite.config.js` | In-memory `mockBookings` array |
| Auth | CSRF token from `zcsrf` cookie | OTP-based email verification for attendees |

### 11.2 Key Files

| File | Purpose |
|------|---------|
| `src/constants/bookingConstants.js` | All enums, defaults, error codes |
| `src/api/slotBookingApi.js` | API layer (20+ endpoints) |
| `src/hooks/useSlotBooking.js` | Organizer list management hook |
| `src/hooks/useBookedSlots.js` | Organizer slot management hook |
| `src/components/BookingPageSetup/BookingPageSetup.jsx` | Create/edit modal |
| `src/components/BookingPageSetup/GroupBookingSection.jsx` | Group-specific config fields |
| `src/components/PublicBookingPage/PublicBookingPage.jsx` | Public booking page |
| `src/components/PublicBookingPage/SlotGrid.jsx` | Weekly slot grid |
| `src/components/PublicBookingPage/ScheduleModal.jsx` | Booking modal (form → OTP → confirm) |
| `src/components/BookedSlotsView/BookedSlotsView.jsx` | Organizer slot manager |
| `vite.config.js` | Mock API middleware |

### 11.3 Data Shapes

**Slot object (from `get-slots`):**
```json
{ "time": "09:00", "seat": 8, "eveId": "evt-123" }
```
- No `eveId` + no `seat` → fully open (seatsLeft = capacity)
- `eveId` + `seat` > 0 → partially filled
- `seat` === 0 → full

**Booking payload (to `book`):**
```json
{
  "title": "Team Standup",
  "dateandtime": { "start": "20260325T090000", "end": "20260325T093000", "timezone": "Asia/Kolkata" },
  "email": "user@org.com",
  "seats": 3,
  "conference": 2,
  "eventId": "evt-123",
  "otp": "1234"
}
```

### 11.4 Concurrency Concerns

- **Seat race condition:** Two users may try to book the last seat simultaneously. Backend must enforce atomic seat decrement. Frontend shows stale data until next refresh.
- **Slot locking:** Error code `107` with "retry" message indicates concurrent booking. Frontend shows: "Another booking is in progress. Please retry."
- **Mitigation:** Frontend re-fetches slots after any booking attempt (success or failure).

---

## 12. API / Backend / Data Impact

### 12.1 Endpoints (Already Implemented in Mock)

| Endpoint | Method | Group-Specific Fields |
|----------|--------|----------------------|
| `?mode=create` | POST | `slotCapacity`, `attPermission`, `confirmMode`, `perUserLimit`, `waitlistEnabled` |
| `?mode=get-slots` | GET | Response includes `seat` (remaining) per slot |
| `?mode=book` | POST | Request includes `seats` field |
| `?mode=send-otp` | POST | No group-specific changes |
| `?mode=join-waitlist` | POST | `eventId`, `name`, `email`, `seats`, `date`, `time` |
| `?mode=get-waitlist` | GET | Returns `[{ name, email, joinedAt, status }]` |
| `?mode=promote-waitlist` | POST | `eventId`, `email` |
| `?mode=add-attendee` | POST | `eventId`, `name`, `email` |
| `?mode=remove-attendee` | POST | `eventId`, `email` |
| `?mode=cancel-slot` | POST | `eventId` |
| `?mode=get-booked-slots` | GET | Response includes `attendees[]`, `waitlist[]` per slot |
| `?mode=remove-me` | POST | `eventId`, `email` (attendee self-removal) |

### 12.2 Backend Validation Required

| Check | Error Code | Message |
|-------|-----------|---------|
| Seats > remaining capacity | 107 | "This slot is no longer available." |
| User already booked this slot | 116 | "You have already booked this slot." |
| User exceeded per-user limit | 118 | "You have reached your booking limit for this event." |
| Max bookings/day reached | 108 | "Maximum bookings for this day have been reached." |
| Outside scheduling window | 117 | "This slot is outside the allowed booking window." |
| Already on waitlist | 119 | "You are already on the waitlist for this slot." |
| Concurrent booking (slot locked) | 107 | "Another booking is in progress. Please retry in a moment." |
| Invalid OTP | 109 | "The OTP entered is incorrect." |
| Non-org email on org booking | 115 | "Only organization email addresses are allowed for this booking." |
| Booking link expired | 103 | "This booking link has expired." |

---

## 13. Edge Cases and Failure States

| # | Scenario | Expected Behavior |
|---|---------|-------------------|
| E1 | User selects 5 seats but only 3 remain (stale data) | Backend rejects with error 107; frontend shows error + re-fetches slots |
| E2 | Two users simultaneously book the last seat | One succeeds, one gets error 107; loser sees updated availability |
| E3 | Slot fills while user is on OTP step | Booking attempt fails with error 107; user sees slot unavailable message |
| E4 | User tries to book same slot twice | Backend rejects with error 116; "Already booked" message shown |
| E5 | User hits per-user limit | Backend rejects with error 118; limit message shown |
| E6 | Waitlist user is promoted but slot fills before they book | Promotion fails; organizer sees error |
| E7 | Organizer cancels slot with waitlisted users | All attendees + waitlist entries removed; slot becomes open |
| E8 | Booking link expires mid-session | Next API call returns error 103; expired banner shown |
| E9 | Network failure during OTP send | Error caught; "Something went wrong. Please try again." shown |
| E10 | User enters 0 or negative seat count | Frontend prevents via min=1 constraint; button disabled |
| E11 | Capacity set to 2 (minimum) with 1 booked | Only 1 seat shown as available; selector max = 1 |
| E12 | User changes seat count after seeing remaining | "Remaining after selection" updates live; validation re-checked |
| E13 | Approval mode: host never responds | Pending booking stays indefinitely; no auto-cancel (V1) |
| E14 | Visitor's timezone differs from host's | Warning banner shown with both timezones; times displayed in host TZ |

---

## 14. Acceptance Criteria (Given / When / Then)

### Booking Setup

**AC1 — Group type forces org visibility**
- Given: Host is creating a booking page
- When: Host selects "Group" booking type
- Then: Visibility is locked to "Organisation" and cannot be changed to "Public"

**AC2 — Capacity range validation**
- Given: Host is configuring a group booking
- When: Host enters capacity < 2 or > 2000
- Then: Input is clamped to valid range; no API call with invalid capacity

**AC3 — Type immutability**
- Given: Host is editing an existing booking page
- When: Edit form loads
- Then: Booking type toggle is disabled and shows current type

### Slot Availability

**AC4 — Seat count display**
- Given: Attendee opens a group booking page with 10-capacity slots
- When: A slot has 8 seats remaining
- Then: Slot button shows "8 avail" in blue; SeatBadge shows "8 of 10 seats available"

**AC5 — Few seats left threshold**
- Given: Slot capacity is 10
- When: Only 2 seats remain (≤20%)
- Then: Slot shows amber styling with "2 left"; status = FEW_SEATS_LEFT

**AC6 — Full slot**
- Given: Slot has 0 remaining seats
- When: Attendee views slot grid
- Then: Slot shows red "Full" label; button is disabled (not clickable)

### Multi-Seat Booking

**AC7 — Seat selector**
- Given: Attendee clicks an available group slot with 8 seats remaining
- When: Modal opens
- Then: Seat selector shows, range 1–8, default 1

**AC8 — Dynamic remaining display**
- Given: Attendee selects 3 seats from slot with 8 remaining
- When: Seat count changes
- Then: Summary shows "5 seats remaining after your selection"

**AC9 — Exceed availability**
- Given: Slot has 3 seats remaining
- When: Attendee tries to set seats to 5
- Then: Input is capped at 3; inline error "Only 3 seats available" if manually overridden

**AC10 — Seats persist through OTP**
- Given: Attendee selected 3 seats and entered OTP
- When: OTP step renders
- Then: Banner shows "Reserving 3 seats for [date]"

**AC11 — CTA reflects seat count**
- Given: Attendee selected 3 seats on OTP step
- When: CTA button renders
- Then: Button reads "Reserve 3 Seats" (not generic "Confirm")

### Waitlist

**AC12 — Waitlist on full slot**
- Given: Slot is full and waitlist is enabled
- When: Attendee clicks the slot
- Then: Modal shows "Join Waitlist" button instead of "Send OTP"

**AC13 — Waitlist terminal state**
- Given: Attendee joins waitlist
- When: Submission succeeds
- Then: "Added to Waitlist" screen shown with slot details

### Approval Mode

**AC14 — Pending state**
- Given: Booking page has confirmMode = APPROVAL
- When: Attendee completes OTP verification
- Then: "Awaiting Approval" screen shown; booking is not yet confirmed

**AC15 — Approval notice in form**
- Given: Booking page requires approval
- When: Attendee opens booking modal
- Then: Amber banner reads "This session requires organizer approval"

### Organizer Management

**AC16 — Attendee list**
- Given: Organizer opens Booked Slots View for a group booking
- When: Organizer expands a slot row
- Then: Attendee names, emails, and booking times are visible

**AC17 — Remove attendee**
- Given: Organizer views attendee list for a slot
- When: Organizer clicks "Remove" on an attendee
- Then: Attendee is removed; seat count updates; slot becomes available if was full

**AC18 — Promote from waitlist**
- Given: Organizer views a slot with waitlisted users
- When: Organizer clicks "Promote" on a waitlist entry
- Then: User moves from waitlist to confirmed; seat count decrements

---

## 15. QA Test Scenarios

### Functional Tests

| # | Scenario | Steps | Expected |
|---|---------|-------|----------|
| T1 | Create group booking | Host creates type=1, capacity=10 | Booking saved; card shows "Group" badge + "10 seats/slot" |
| T2 | Book 1 seat | Attendee selects 1 seat → OTP → confirm | Success; slot shows 9 remaining |
| T3 | Book multiple seats | Attendee selects 5 seats → OTP → confirm | Success; slot shows 5 fewer seats |
| T4 | Book last seat | Slot has 1 remaining → book 1 | Success; slot becomes "Full" |
| T5 | Book when full (no waitlist) | Slot full, waitlist off → click | Slot disabled; cannot open modal |
| T6 | Join waitlist | Slot full, waitlist on → click → enter details | "Added to Waitlist" screen |
| T7 | Approval mode booking | confirmMode=1 → complete OTP | "Awaiting Approval" screen |
| T8 | Per-user limit | Limit=2; book twice then try third | Error 118: "booking limit reached" |
| T9 | Remove attendee | Organizer removes from 10/10 slot | Slot goes to 9/10; seat opens |
| T10 | Cancel slot | Organizer cancels filled slot | All attendees removed; slot becomes open |
| T11 | Promote waitlist | Organizer promotes queued user | User moves to confirmed |
| T12 | Add attendee manually | Organizer adds name+email to slot | Attendee appears in list; seat count updates |

### Edge Case Tests

| # | Scenario | Expected |
|---|---------|----------|
| T13 | Concurrent booking | Second user gets error 107; UI refreshes |
| T14 | Stale seat data | User sees 5 avail but only 2 remain → backend rejects → error shown |
| T15 | Expired link | Error 103 banner shown; no booking possible |
| T16 | Invalid OTP | Error 109 shown; user can retry |
| T17 | Non-org email on org booking | Error 115: "Only organization email addresses" |
| T18 | Capacity = 2 (minimum) | Selector shows max 2; full at 2 bookings |
| T19 | Capacity = 2000 (maximum) | Slot handles large numbers; progress bar scales correctly |
| T20 | Browser refresh during OTP step | State lost; user must restart from slot selection |

### Cross-Browser / Device Tests

| # | Test | Browsers |
|---|------|----------|
| T21 | Modal responsive layout | Chrome, Firefox, Safari, Edge |
| T22 | Seat selector touch input | iOS Safari, Android Chrome |
| T23 | Slot grid overflow | Narrow viewport (375px) |

---

## 16. Analytics / Event Tracking Requirements

| Event | Trigger | Properties |
|-------|---------|------------|
| `group_booking_created` | Host saves group booking page | `bookingId`, `capacity`, `confirmMode`, `waitlistEnabled` |
| `group_booking_edited` | Host updates group booking page | `bookingId`, `fieldsChanged[]` |
| `slot_viewed` | Attendee views slot grid | `bookingId`, `weekOffset`, `slotsAvailable`, `slotsFull` |
| `slot_selected` | Attendee clicks a slot | `bookingId`, `slotTime`, `seatsLeft`, `status` |
| `seats_selected` | Attendee changes seat count | `bookingId`, `seatsSelected`, `seatsAvailable` |
| `otp_sent` | OTP dispatched | `bookingId`, `email` |
| `booking_completed` | Booking confirmed | `bookingId`, `seats`, `confirmMode`, `isApproval` |
| `waitlist_joined` | User joins waitlist | `bookingId`, `slotTime` |
| `waitlist_promoted` | Organizer promotes | `bookingId`, `eventId`, `email` |
| `attendee_removed` | Organizer removes attendee | `bookingId`, `eventId` |
| `slot_cancelled` | Organizer cancels slot | `bookingId`, `eventId`, `attendeeCount` |
| `booking_cancelled_by_attendee` | Attendee cancels from confirmation | `bookingId`, `eventId`, `seats` |

---

## 17. Dependencies

| Dependency | Owner | Status | Risk |
|-----------|-------|--------|------|
| Booking configuration UI | Frontend | ✅ Implemented | Low |
| Slot generation engine | Backend / Mock | ✅ Implemented (mock) | Medium — real backend needed |
| OTP email service | Backend | ✅ Mocked | Low |
| Calendar event creation | Backend | ✅ Mocked | Medium — real integration needed |
| CSRF auth | Backend | ✅ Implemented | Low |
| Zoho Meeting integration | Meetings team | ✅ Existing | Low |
| Waitlist notification system | Backend / Notifications | ❌ Not implemented | High — users expect email on promotion |
| Approval flow notification | Backend / Notifications | ❌ Not implemented | High — host needs approval inbox |
| Real backend API | Backend | ❌ Mock only | High — production deployment blocked |

---

## 18. Risks / Open Questions

### Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Seat race conditions under high concurrency | Medium | High | Backend must use atomic operations; frontend re-fetches after every attempt |
| R2 | Stale seat data on slow connections | Medium | Medium | Show "seat count may be outdated" after 60s without refresh |
| R3 | Approval flow has no organizer notification yet | High | High | V1: organizer checks Booked Slots View manually; V2: add notification |
| R4 | Waitlist promotion has no attendee notification | High | High | V1: manual communication; V2: auto-email on promotion |
| R5 | No auto-cancel for unanswered approval requests | Low | Medium | Document as known limitation; consider TTL in V2 |

### Open Questions — Resolved

| # | Question | Decision | Notes |
|---|---------|----------|-------|
| Q1 | Should approval-mode bookings consume seats while pending? | **No** — pending bookings do NOT hold seats | Seats only consumed on approval; risk of overcommit is accepted |
| Q2 | Should waitlist have a max queue size? | **Deferred to V2** — no waitlist in V1 | Waitlist feature removed from V1 scope |
| Q3 | Should promoted waitlist users go through OTP again? | **Deferred to V2** — no waitlist in V1 | Will decide when waitlist is scoped |
| Q4 | What happens when organizer deletes booking page with active bookings? | **Attendees receive cancellation email** | Backend sends email notification on deletion |
| Q5 | Should we support partial cancellation (cancel some seats from a multi-seat booking)? | **Deferred to V2** | V1: all-or-nothing cancellation only |
| Q6 | Is there a maximum number of booking pages per user? | **Yes** — error code 113 enforced by backend | Existing behavior, no change needed |
| Q7 | Should buffer times be visible to attendees? | **Hidden** — internal scheduling only | Attendees see slot times; buffers are organizer-side |
| Q8 | When does "Link Expired" state trigger? | **Based on `endDate` of date range** | Existing behavior confirmed |

### V1 Scope Adjustments

Based on decisions above:
- ✅ **Waitlist system** — re-added to V1; full slots show "Join waitlist" (purple) when enabled
- ✅ **Approval mode** — included; pending bookings do NOT consume seats
- ❌ **Partial seat cancellation** — all-or-nothing only (V2)

---

## 19. Rollout Plan

| Phase | Scope | Audience | Gate |
|-------|-------|----------|------|
| **Alpha** | Feature-complete on local dev with mock API | Internal dev team | All acceptance criteria pass with mock |
| **Beta (internal)** | Connected to real Zoho Calendar backend | Internal Zoho users (dogfood) | Real API integration stable; no data loss |
| **Beta (limited)** | Feature flag enabled for 5% of booking creators | Early adopters / opt-in users | Error rate < 1%; completion rate ≥ 80% |
| **GA** | Feature flag removed; available to all | All Zoho Calendar users | Support docs live; no P0 bugs; analytics dashboard ready |

**Feature flag:** `group_booking_enabled` — controls visibility of "Group" booking type in setup UI.

---

## 20. Rollback Plan

| Trigger | Action | Owner |
|---------|--------|-------|
| P0 bug: data loss or incorrect booking | Disable `group_booking_enabled` flag | Engineering |
| Concurrency: seats oversold | Disable group booking creation; existing pages remain read-only | Backend |
| API errors > 5% for group bookings | Disable flag; investigate | Ops + Engineering |

**Rollback preserves:**
- Existing group bookings remain visible (read-only)
- Existing 1:1 bookings unaffected
- No data deletion on rollback

---

## 21. Marketing / Support Enablement Notes

### Marketing

- **Positioning:** "Now run workshops, demos, and classes from your calendar — with built-in seat management"
- **Key messages:**
  1. Set capacity per time slot (2–2,000 seats)
  2. Real-time seat availability for participants
  3. Waitlist support when slots fill up
  4. Approval mode for controlled access
- **Demo scenario:** Training coordinator creates 10-seat onboarding sessions; 8 employees book seats; 2 join waitlist; coordinator promotes 1 when a cancellation opens a seat

### Support

- **Common questions:**
  - "Why can't I make my group booking public?" → Group bookings are org-only for security
  - "Why does my slot show 'Few seats left' at 8 of 10?" → Threshold is 20% of capacity
  - "Can I change booking type after creation?" → No, type is immutable; create a new booking page
  - "What happens when I cancel a slot?" → All attendees are removed; waitlist is cleared
- **Escalation triggers:** Seat count mismatch, OTP not received, booking stuck in pending

---

## 22. Definition of Done

- [ ] All 18 acceptance criteria (AC1–AC18) pass
- [ ] All 20 QA test scenarios (T1–T20) pass
- [ ] Cross-browser testing (T21–T23) complete
- [ ] Mock API covers all group booking endpoints
- [ ] Error handling covers all 20 error codes
- [ ] No regression in existing 1:1 booking flow
- [ ] Analytics events fire correctly for all tracked actions
- [ ] Organizer can manage attendees and waitlist
- [ ] Code reviewed and merged to feature branch
- [ ] Support documentation drafted
- [ ] Feature flag mechanism in place

---

## Appendix A: Developer Checklist

- [ ] `bookingConstants.js`: All group enums, defaults, error codes present
- [ ] `slotBookingApi.js`: All 14 endpoints implemented
- [ ] `BookingPageSetup`: Group section renders with all 5 fields
- [ ] `GroupBookingSection`: Capacity, roster, approval, limit, waitlist controls work
- [ ] `PublicBookingPage`: Slot grid shows seat counts for group bookings
- [ ] `SlotGrid`: Status derivation (available/few/full/outside) correct at 20% threshold
- [ ] `ScheduleModal`: Seat selector renders (1 to remaining); persists through steps
- [ ] `ScheduleModal`: CTA labels are seat-count-aware
- [ ] `ScheduleModal`: Waitlist flow activates when full + enabled
- [ ] `ScheduleModal`: Approval flow shows pending state
- [ ] `ScheduleModal`: Confirmation screen has "Book Another" + "Cancel" buttons
- [ ] `BookedSlotsView`: Attendee list expandable per slot
- [ ] `BookedSlotsView`: Add/remove/promote actions work
- [ ] `BookedSlotsView`: Cancel slot removes all data
- [ ] `vite.config.js`: Mock API handles all group scenarios
- [ ] `SeatBadge`: Color-coded for all 4 statuses
- [ ] Form validation: inline errors, no alert popups
- [ ] Seat race condition: error 107 handled gracefully
- [ ] No browser-default styles leak through

## Appendix B: QA Checklist

- [ ] Group booking CRUD (create, read, update, delete)
- [ ] Booking type immutability after creation
- [ ] Visibility lock (group → org only)
- [ ] Capacity range (2–2000) enforced
- [ ] Slot grid seat counts accurate
- [ ] "Few seats left" at ≤20% threshold
- [ ] Full slot disabled + red styling
- [ ] Seat selector range (1 to remaining)
- [ ] Multi-seat booking end-to-end
- [ ] OTP flow with seat persistence
- [ ] Approval mode → pending state
- [ ] Waitlist join → terminal state
- [ ] Per-user limit enforcement
- [ ] Concurrent booking handling (error 107)
- [ ] Already-booked error (error 116)
- [ ] Expired link error (error 103)
- [ ] Invalid OTP error (error 109)
- [ ] Organizer add/remove attendee
- [ ] Organizer promote waitlist
- [ ] Organizer cancel slot
- [ ] 1:1 booking regression (no group UI shown)
- [ ] Mobile responsive (375px viewport)
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)

## Appendix C: Design Checklist

- [ ] Slot status colors: blue (available), amber (few seats), red (full), gray (outside)
- [ ] Seat selector component: −/+ buttons, compact, inline
- [ ] SeatBadge: regular + compact variants
- [ ] Legend component for slot grid
- [ ] Approval mode warning banner (amber)
- [ ] Waitlist notice banner (blue)
- [ ] Confirmation screen with dual CTAs
- [ ] Pending screen with hourglass icon
- [ ] Waitlisted screen with clipboard icon
- [ ] Organizer: capacity progress bar per slot
- [ ] Organizer: attendee list rows with remove action
- [ ] Organizer: waitlist rows with promote action
- [ ] Empty states: no slots, no attendees, no waitlist
- [ ] Loading states: slot grid skeleton, modal submission spinner
- [ ] Error states: inline errors, banner errors, full-page errors
- [ ] Responsive layout: modal on mobile (stacked panels)

## Appendix D: Launch Checklist

- [ ] Feature flag `group_booking_enabled` configured
- [ ] All acceptance criteria verified
- [ ] QA sign-off complete
- [ ] Performance tested (100+ attendee slots)
- [ ] Support documentation published
- [ ] Marketing materials reviewed
- [ ] Analytics dashboard configured
- [ ] Rollback procedure tested
- [ ] Real backend API integration verified (when available)
- [ ] Dogfood period (internal usage) completed
- [ ] No P0 or P1 bugs outstanding

## Appendix E: Open Questions — All Resolved

All open questions have been resolved. Decisions are documented in Section 18.

| # | Question | Decision |
|---|---------|----------|
| 1 | Approval seat reservation | **No** — pending bookings do NOT consume seats |
| 2 | Waitlist queue limit | **No waitlist in V1** — deferred to V2 |
| 3 | Waitlist re-auth | **No waitlist in V1** — deferred to V2 |
| 4 | Partial seat cancellation | **Deferred to V2** — all-or-nothing in V1 |
| 5 | Booking page deletion with active bookings | **Attendees receive cancellation email** |
| 6 | Notification system | **No waitlist in V1**; approval notifications are existing email flow |
| 7 | Timezone display | **Visitor's timezone** — times shown in attendee's auto-detected TZ |
| 8 | Buffer time visibility | **Hidden** — internal scheduling only, not shown to attendees |
