# Zoho Calendar — Appointment Booking Feature: Full Context Document

> **Purpose:** This document describes the complete current state of the Zoho Calendar Appointment Booking feature — its UI flows, all fields, data models, share options, and end-user booking experience — so that an AI coding assistant can propose and implement enhancements.

---

## 1. FEATURE OVERVIEW

**Appointment Booking** in Zoho Calendar allows a host to create a public or organization-restricted booking page. Visitors can pick an available time slot and schedule an appointment. The feature lives in the right-side panel of Zoho Calendar (accessible via the calendar icon on the top-right toolbar).

**Entry point:** Right sidebar → `Appointment Booking` panel (heading) → `+ Create booking page` button.

---

## 2. DATA MODEL — BOOKING PAGE OBJECT

Each booking page has the following properties:

| Field | Type | Notes |
|---|---|---|
| `title` | string (required) | Appointment title shown to visitors |
| `dateRange.start` | date | Start date of booking window |
| `dateRange.end` | date | End date of booking window |
| `meetingType` | enum | `None`, `In-person`, `Online` |
| `conferenceType` | enum | Only shown when `meetingType = Online`. Options: `Zoho Audio Meeting`, `Zoho Video Meeting` |
| `location` | string | Physical location (shown when `meetingType = In-person`) |
| `visibility` | enum | `Organization` (only org users can view), `Public` (anyone with link) |
| `checkAvailabilityFrom` | array of calendar IDs | Which calendars to check for conflicts |
| `appointmentDuration.value` | integer | Default: 30 |
| `appointmentDuration.unit` | enum | `Minutes` |
| `availableHours` | object | Per-day (Sun–Sat): enabled (bool), slots array of {start, end} time pairs |
| `bufferInterval.value` | integer | Default: 15 |
| `bufferInterval.unit` | enum | `Minutes` |
| `maximumBookingsPerDay` | integer | Default: 5 |
| `branding.logoUrl` | string (optional) | Company logo image |
| `branding.companyName` | string (optional) | Company name shown on booking page |

---

## 3. CREATE BOOKING PAGE FLOW

**Dialog title:** `Booking Page Setup`
**Layout:** Two-panel — left: form; right: live calendar preview

### Section 1: Appointment Details (collapsible, expanded by default)

| Field | UI Control | Notes |
|---|---|---|
| Title* | Text input | Placeholder: "Enter the appointment title" |
| Date range | Date range picker button | Default: today + 3 days; opens date picker |
| Meeting Type | Dropdown | Options: `None`, `In-person`, `Online` |
| Conference (conditional) | Dropdown | Appears only when Meeting Type = `Online`; Options: `Zoho Audio Meeting`, `Zoho Video Meeting` |
| Visibility | Radio buttons | `Organization` (default): "Only organization users can view." / `Public`: "Anyone with the link can view." |

### Section 2: General Availability (collapsible, expanded by default)

| Field | UI Control | Notes |
|---|---|---|
| Check availability from | Checkbox list | All user calendars listed under "My Calendar" group |
| Appointment duration | Spinner + Unit dropdown | Default: 30 Minutes |
| Available hours | Per-day table (Sun–Sat) | Each day: checkbox (enable/disable), start time combobox, end time combobox, + Add slot button, copy slot button. Default: Mon–Fri checked, 9:00 am – 6:00 pm; Sun/Sat unchecked |

### Section 3: Booking Limits (collapsible, collapsed by default)

| Field | UI Control | Notes |
|---|---|---|
| Buffer interval | Spinner + Unit dropdown | Default: 15 Minutes. Time gap between bookings |
| Maximum bookings per day | Spinner | Default: 5 |

### Section 4: Branding (collapsible, collapsed by default)

| Field | UI Control | Notes |
|---|---|---|
| Logo | Image upload | Placeholder shows Zoho Calendar logo |
| Company name | Text input | Placeholder: "Enter the company name" |

### Footer Actions
- **Create Link** (primary blue button) — generates the booking page
- **Cancel** — closes dialog

### Right Panel: Live Preview
- Shows a weekly calendar view updating in real-time as availability settings change
- Displays existing calendar events as busy (greyed out)

---

## 4. EDIT BOOKING PAGE FLOW

Accessed via: `More options (⋮)` → `Edit` on a booking page card.

- **Same form as Create**, pre-populated with existing values
- Footer button changes from `Create Link` → **`Update Link`**
- All fields are editable

---

## 5. BOOKING PAGE CARD (in the panel list)

Each booking page card in the Appointment Booking panel shows:

```
[Title]                        [copy-link icon] [⋮ more options]
──────────────────────────────────────────────────────────────
Duration: 30 minutes           Conference: None / Zoho Audio Meeting / ...
Visibility: Public / Organization
Expires on: DD MMM YYYY  OR  Link Expired
```

### Context Menu (⋮ More options):
1. **Open booking page** — opens the Booking Page detail view
2. **Edit** — opens Booking Page Setup dialog pre-filled
3. **Share link** — opens Share link panel (see Section 6)
4. **Duplicate booking** — creates a copy
5. **Delete** — deletes the booking page

---

## 6. SHARE LINK FLOW

Accessed via `More options (⋮)` → `Share link`, OR from the Booking Page detail view.

The Share panel has three tabs:

### Tab 1: Live link
- URL input (read-only) showing the booking page URL
- **Copy** button
- Info text: "Anyone with the link can view"
- Share via: **Cliq** button, **Mail** button

### Tab 2: Embed Link
- Input showing full `<iframe>` embed HTML code (read-only)
- **Copy** button
- Info text: "Anyone with the link can view"
- Share via: **Cliq** button, **Mail** button

**Embed code format:**
```html
<iframe
  src="https://calendar.zoho.in/zc/view/slot-booking/{BOOKING_ID}"
  title="Appointment Booking"
  frameBorder="0"
  style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px"
  height="100%"
  width="100%"
/>
```

### Tab 3: QR Code
- QR code image generated for the booking page URL
- Share and Download section:
  - **Cliq** button
  - **Mail** button
  - **Download** button (downloads QR as image)

---

## 7. BOOKING PAGE DETAIL VIEW

Accessed via `More options (⋮)` → clicking a booking page card opens a full detail view dialog.

**Header:** `Booking Page` + Edit (pencil icon) + Delete (trash icon)

**Two tabs:**
1. **Link details** (shows Live link / Embed Link / QR Code as described above)
2. **Appointment Details** (read-only summary of all settings)

### Appointment Details tab (read-only example — "Corporate consultation"):
```
Appointment Details
  Title:           Corporate consultation
  Date range:      28 Nov 2025 - 27 May 2026
  Meeting Type:    None
  Location:        Chennai
  Visibility:      Public

General Availability
  Check availability from:
    MY CALENDAR
      ● Raghav's Primary
      ● Calendar work items
  Duration: 30 minutes
  Available hours:
    MONDAY:    09:00 am - 02:30 pm, 03:30 pm - 06:30 pm
    TUESDAY:   09:00 am - 02:30 pm, 03:30 pm - 06:30 pm
    WEDNESDAY: 09:00 am - 02:30 pm, 03:30 pm - 06:30 pm
    THURSDAY:  09:00 am - 02:30 pm, 03:30 pm - 06:30 pm

Booking limits
  Buffer interval:          15 minutes
  Maximum bookings per day: 11 bookings

Branding
  Logo: [company logo thumbnail]
  Company name: Zylker Tech co.
```

---

## 8. END-USER BOOKING PAGE (Public-facing)

**URL pattern:** `https://calendar.zoho.in/zc/view/slot-booking/{BOOKING_ID}`

### Left sidebar (static info):
```
[Company Logo / thumbnail]
[Host name]    — e.g. Raghavan P
[Company]      — e.g. Zylker Tech co.

Booking details
  Title:      Corporate consultation
  Duration:   30 minutes
  Conference: None
  Timezone:   Asia/Kolkata
  [12 Hrs / 24 Hrs] toggle for time format

[Month mini-calendar]  ← ← Mar 2026 → →
  — Click any date to jump to that week
  — Navigation: prev year, prev month, next month, next year
```

### Main area (time slot grid):
- **Week view** — columns for Sun, Mon, Tue, Wed, Thu, Fri, Sat
- Available time slots shown as clickable buttons (e.g. 9:00 am, 9:45 am, 10:30 am, 11:15 am, 12:00 pm, 12:45 pm, 1:30 pm, 3:30 pm, 4:15 pm, 5:00 pm, 5:45 pm)
- Busy/blocked times shown as greyed/hatched cells
- Week navigation: Previous / Next buttons

### On clicking a time slot — "Schedule Appointment" modal:

**Left side** (appointment summary):
```
Schedule Appointment
  Date + time:  e.g. Mar 24 2026, 09:00 am - 09:30 am
  Conference:   None
  Location:     Chennai
  Timezone:     Asia/Kolkata
  Duration:     30 minutes
```

**Right side** (user form — "Enter your details"):
```
Name*          [text input — pre-filled if logged in]
Email address* [text input — pre-filled if logged in]
[Send OTP]     [Cancel]
```

### Booking confirmation flow:
1. Visitor selects a time slot → modal opens
2. Visitor enters Name + Email address
3. Clicks **Send OTP** → OTP sent to email for identity verification
4. After OTP verification → appointment is confirmed and added to host's calendar
5. No reschedule/cancellation link is currently sent to the visitor

**Page footer:** `© 2026, Zoho Calendar. All Rights Reserved.`

---

## 9. CALENDAR-LEVEL EMBED CODES (from Settings → My Calendars)

### Schedule Appointment — iframe embed (calendar-level):
```html
<iframe
  src="https://calendar.zoho.in/eventreqForm/{CALENDAR_TOKEN}?theme=0&l=en&tz=Asia/Kolkata"
  frameBorder="0"
  style="overflow:hidden;width:100%;height:100%"
/>
```
_Embeds the general appointment scheduler for the entire calendar (not a specific booking page)._

### Web API for Schedule Appointment:
```
https://calendar.zoho.in/eventreq/{CALENDAR_TOKEN}
```
_API endpoint to integrate appointment scheduling into your own web page._

---

## 10. EXISTING BOOKING PAGES (current state)

| Title | Duration | Conference | Visibility | Status |
|---|---|---|---|---|
| Corporate consultation | 30 min | None | Public | Active — expires 27 May 2026 |
| sadasd | 15 min | Zoho Audio Meeting | Public | Link Expired |
| asdasd | 30 min | Zoho Audio Meeting | Public | Link Expired |
| Consultation | 15 min | Zoho Video Meeting | Organization | Active — expires 30 Jun 2026 |
| Appointment booking - walkthrough | 15 min | Zoho Audio Meeting | Organization | Link Expired |
| Schedule a meeting with me | 15 min | Zoho Audio Meeting | Public | Active — expires 31 Mar 2026 |

---

## 11. TECHNICAL / URL PATTERNS

| Type | Pattern |
|---|---|
| Live booking page URL | `https://calendar.zoho.in/zc/view/slot-booking/{BOOKING_TOKEN}` |
| Calendar-level eventreq form | `https://calendar.zoho.in/eventreqForm/{CALENDAR_TOKEN}` |
| Calendar-level Web API | `https://calendar.zoho.in/eventreq/{CALENDAR_TOKEN}` |
| Booking token format | Hex string ~80 chars (e.g. `zz08021230a369c94ec...`) |
| Calendar token format | Hex string ~80 chars (e.g. `zz080212302b9f93b1be3e...`) |

---

## 12. NOTABLE GAPS / POTENTIAL ENHANCEMENT AREAS

Based on the current feature state, the following are **not yet present** and are candidates for enhancement:

- No **custom questions / additional form fields** on the booking form (only Name + Email currently)
- No **time zone selector** for the visitor (only host's timezone shown)
- No **reminder / notification settings** per booking page (separate from general calendar notifications)
- No **group booking** support (multiple attendees per slot)
- No **payment / pricing** integration
- No **reschedule or cancellation** link sent to the visitor after confirmation
- No **custom confirmation message** or post-booking redirect URL
- No **recurring availability override** (e.g. block specific dates without disabling entire days)
- No **booking page analytics** (view count, conversion rate, no-show tracking)
- QR Code is **not customizable** (no color or logo overlay options)
- Embed link has **no width/height customization** in the UI (hardcoded to 100%)
- No **waitlist** functionality when max bookings per day is reached
- No **description/notes field** on the booking page for visitors to add context

---

*Document generated from live Zoho Calendar session — 23 March 2026*
