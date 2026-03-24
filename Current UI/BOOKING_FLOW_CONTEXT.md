# ZOHO CALENDAR — PUBLIC BOOKING FLOW: Full Context Document
## For use with Claude Code / VS Code

---

## 1. OVERVIEW

**Page URL:** https://calendar.zoho.in/zc/view/slot-booking/zz08021230...
**Page Title:** Zoho Calendar — Public Booking Page
**Booking Name:** Corporate consultation
**Host:** Raghavan P, Zylker Tech co.
**Duration:** 30 minutes
**Conference:** None
**Timezone:** Asia/Kolkata (IST)

---

## 2. PAGE LAYOUT STRUCTURE

```
<body>
  <div class="zclslotbook__preview">
    <div class="zclslotbook__preview__container">
      
      <!-- LEFT SIDEBAR -->
      <div class="zclslotbook__preview__sidebar">
        <div class="logo-wrapper">
          <img /> <!-- Zoho Calendar logo -->
        </div>
        <div class="user-info">
          <span class="organizer-info">
            <i class="zmci-user__ao9hcv"></i>
            <span>Raghavan P</span>
          </span>
          <span class="company-info">
            <i class="zmci-building__ao9hcv"></i>
            <span>Zylker Tech co.</span>
          </span>
        </div>
        <section class="booking-info-wrapper">
          <h3 class="booking-info-title">Booking details</h3>
          <div class="zclslotbooking__appointment__details">
            <div class="zclslotbooking__event__info__wrapper">
              <h4 class="zclslotbooking__event__info-label">Title</h4>
              <div class="zclslotbooking__event__info-text">Corporate consultation</div>
            </div>
            <div class="zclslotbooking__event__info__wrapper">
              <h4 class="zclslotbooking__event__info-label">Duration</h4>
              <div class="zclslotbooking__event__info-text">30 minutes</div>
            </div>
            <div class="zclslotbooking__event__info__wrapper">
              <h4 class="zclslotbooking__event__info-label">Conference</h4>
              <div class="zclslotbooking__event__info-text">None</div>
            </div>
            <div class="zclslotbooking__event__info__wrapper">
              <h4 class="zclslotbooking__event__info-label">Timezone</h4>
              <!-- Timezone switcher button -->
              <button class="zmbtn zmbtn--unstyled">Asia/Kolkata</button>
            </div>
            <div class="zclslotbooking__event__info__wrapper">
              <!-- Time format toggle: 12 Hrs / 24 Hrs -->
            </div>
          </div>
        </section>
        <!-- Mini calendar widget -->
        <div class="zclslotbook__preview__mini-calendar">
          <!-- Month: Mar 2026 -->
          <!-- Navigation: prev/next year, prev/next month -->
          <!-- Grid of date buttons -->
        </div>
      </div>

      <!-- RIGHT MAIN AREA (Calendar + Time Slots) -->
      <div class="zclslotbook__preview__slots__wrapper">
        <header class="zclslotbook__preview__slots__grid__header">
          <div class="zclnavigation-action">
            <!-- Prev week / Next week navigation -->
          </div>
          <div class="zclcurrent-week">22 - 28 Mar 2026</div>
        </header>
        <div class="zclslotbook__preview__slots__container">
          <!-- Column headers: Sun, Mon, Tue (today highlighted), Wed, Thu, Fri, Sat -->
          <ul class="zclslotbook__preview__slots__header">
            <li>22 Sun</li>
            <li>23 Mon</li>
            <li>24 Tue [today/highlighted]</li>
            <li>25 Wed</li>
            <li>26 Thu</li>
            <li>27 Fri</li>
            <li>28 Sat</li>
          </ul>
          <!-- Time slot columns per day -->
          <ul class="zclslotbook__preview__slots">
            <li class="zclslotbook__preview__slots__list__item">
              <!-- Each time slot: -->
              <div class="zclslotbook__preview__slots__list__item">
                <button class="zmbtn zmbtn--mbtn zmbtn--outlined zmbtn--default zmbtn--size zclslotbook__preview__slots__list__item-slot">
                  9:00 am
                </button>
              </div>
              <!-- More slots: 9:45 am, 10:30 am, 11:15 am, 12:00 pm, 12:45 pm, 1:30 pm, 3:30 pm, 4:15 pm, 5:00 pm, 5:45 pm -->
            </li>
            <!-- Repeat for each day of the week -->
          </ul>
        </div>
      </div>

    </div>
    <footer class="zclslotbook__preview__footer">
      © 2026, Zoho Calendar. All Rights Reserved.
    </footer>
  </div>
</body>
```

---

## 3. BOOKING FLOW STEPS

### Step 1: Calendar View (Initial State)
- User sees a weekly calendar with available time slots per day
- Days without availability show no time slots (e.g., Sunday)
- Past days are disabled (grayed out, not clickable)
- Today's date column is highlighted
- Available time slots for this booking: 9:00, 9:45, 10:30, 11:15 am, 12:00, 12:45, 1:30, 3:30, 4:15, 5:00, 5:45 pm
- User can navigate weeks (Previous/Next) or click dates on mini-calendar

### Step 2: User Clicks a Time Slot
- Clicking an available slot opens the "Schedule Appointment" modal dialog
- Modal is a split-panel design (left: appointment details, right: user details form)

### Step 3: Schedule Appointment Modal

**Modal outer wrapper:** `div.zmdialog-outer-wrapper__1442s5k`
**Modal inner:** `div.zmdialog__1442s5k.zmdialog--split__1442s5k.zcl-sch-appoint-pop`

**Left block** (`div.zmdialog__block__1442s5k.zcl-sch-appoint-info-block`):
- Header: "Schedule Appointment"
- Info row: Date/time — "Mar 26 2026, 09:00 am - 09:30 am" (icon: zmci-calendar-days-clock__ao9hcv)
- Info row: Conference — "None" (icon: zmci-video__ao9hcv)
- Info row: Location — "Chennai" (icon: zmci-location-dot__ao9hcv)
- Info row: Timezone — "Asia/Kolkata" (icon: zmci-earth__ao9hcv)
- Info row: Duration — "30 minutes" (icon: zmci-clock-three__ao9hcv)

**Right block** (`div.zmdialog__block__1442s5k`):
- Title: "Enter your details" (h3 — no class)
- Form wrapper: `div.zcl-sch-appoint-detail-form-wra`
- Form: `div.zcl-sch-appoint-detail-form`

  **Name Field:**
  ```html
  <div class="zmform-element__qcphvp">
    <label class="zminput-label__qcphvp" for="input-_r_4_">
      Name <span class="zmform-element-required__qcphvp" aria-hidden="true">*</span>
    </label>
    <div class="zmtext__qcphvp zmtext--filled__qcphvp zmtext--md__qcphvp zmtext--focused__qcphvp">
      <div class="zmtext-field-wrapper__qcphvp">
        <input class="zmtext__box__qcphvp"
               type="text"
               id="input-_r_4_"
               aria-label="Enter your name"
               placeholder="Enter your name"
               aria-required="true"
               aria-invalid="false"
               maxlength="255"
               value="Raghavan P" />
      </div>
    </div>
  </div>
  ```

  **Email Address Field:**
  ```html
  <div class="zmform-element__qcphvp">
    <label class="zminput-label__qcphvp" for="input-_r_5_">
      Email address <span class="zmform-element-required__qcphvp" aria-hidden="true">*</span>
    </label>
    <div class="zmtext__qcphvp zmtext--filled__qcphvp zmtext--md__qcphvp">
      <div class="zmtext-field-wrapper__qcphvp">
        <input class="zmtext__box__qcphvp"
               type="text"
               id="input-_r_5_"
               aria-label="Enter your email address"
               placeholder="Enter your email address"
               aria-required="true"
               maxlength="255" />
      </div>
    </div>
  </div>
  ```

  **Footer Buttons:**
  ```html
  <footer class="zmdialog__footer__1442s5k">
    <button class="zmbtn__1pwg0ox zmbtn--btn__1pwg0ox zmbtn--filled__1pwg0ox zmbtn--primary__1pwg0ox"
            aria-label="Send OTP">
      <span class="zmbtn__text__1pwg0ox">Send OTP</span>
    </button>
    <button class="zmbtn__1pwg0ox zmbtn--btn__1pwg0ox zmbtn--outlined__1pwg0ox zmbtn--default__1pwg0ox"
            aria-label="Cancel appointment booking">
      <span class="zmbtn__text__1pwg0ox">Cancel</span>
    </button>
  </footer>
  ```

### Step 4: OTP Verification
- After "Send OTP" is clicked, an OTP is sent to the user's email
- The form transitions to show an OTP input field
- User enters the OTP code to verify their email
- Classes likely: similar zmtext/zmform pattern for OTP input

### Step 5: Confirmation
- After OTP verified, appointment is booked
- Confirmation screen shows booking summary
- Typically includes: date/time, meeting details, calendar invite option

---

## 4. KEY CSS CLASS PATTERNS

### Design System Prefixes
| Prefix | Component |
|--------|-----------|
| `zmbtn__1pwg0ox` | Button base class |
| `zmbtn--filled__1pwg0ox` | Primary filled button |
| `zmbtn--outlined__1pwg0ox` | Outlined button |
| `zmbtn--primary__1pwg0ox` | Primary color variant |
| `zmbtn--default__1pwg0ox` | Default/neutral color |
| `zmbtn--mbtn__1pwg0ox` | Medium button |
| `zmdialog__1442s5k` | Modal dialog base |
| `zmdialog--split__1442s5k` | Split-panel modal |
| `zmdialog__block__1442s5k` | Modal panel block |
| `zmdialog__header__1442s5k` | Modal header |
| `zmdialog__content__1442s5k` | Modal content area |
| `zmdialog__footer__1442s5k` | Modal footer (buttons) |
| `zmtext__qcphvp` | Text input base |
| `zmtext--filled__qcphvp` | Filled input (has value) |
| `zmtext--focused__qcphvp` | Focused input state |
| `zmtext--md__qcphvp` | Medium size input |
| `zmtext__box__qcphvp` | Input element itself |
| `zmform-element__qcphvp` | Form field wrapper |
| `zminput-label__qcphvp` | Input label |
| `zmform-element-required__qcphvp` | Required asterisk |
| `zmci-*__ao9hcv` | Icon classes (Zoho Material Calendar Icons) |

### Icon Classes Used in Booking Flow
| Class | Icon Represents |
|-------|----------------|
| `zmci-user__ao9hcv` | Person/user icon |
| `zmci-building__ao9hcv` | Company/building icon |
| `zmci-calendar-days-clock__ao9hcv` | Date + time icon |
| `zmci-video__ao9hcv` | Video/conference icon |
| `zmci-location-dot__ao9hcv` | Location pin icon |
| `zmci-earth__ao9hcv` | Timezone/globe icon |
| `zmci-clock-three__ao9hcv` | Duration/clock icon |

### Booking Page Specific Classes
| Class | Element |
|-------|---------|
| `zclslotbook__preview` | Page root wrapper |
| `zclslotbook__preview__container` | Sidebar + main content |
| `zclslotbook__preview__sidebar` | Left info panel |
| `zclslotbook__preview__slots__wrapper` | Calendar/slots area |
| `zclslotbook__preview__slots__grid__header` | Week navigation header |
| `zclslotbook__preview__slots__container` | Day headers + slot grid |
| `zclslotbook__preview__slots__header` | Day name headers (ul) |
| `zclslotbook__preview__slots` | Time slots grid (ul) |
| `zclslotbook__preview__slots__list__item` | Per-day slot column (li/div) |
| `zclslotbook__preview__slots__list__item-slot` | Individual slot button |
| `zclslotbook__preview__footer` | Copyright footer |
| `zclslotbooking__appointment__details` | Sidebar booking info |
| `zclslotbooking__event__info__wrapper` | Info row container |
| `zclslotbooking__event__info-label` | Info row label (h4) |
| `zclslotbooking__event__info-text` | Info row value |
| `zcl-sch-appoint-pop` | Schedule appointment modal |
| `zcl-sch-appoint-info-block` | Left info block in modal |
| `zcl-sch-info-wra` | Info rows wrapper |
| `zcl-sch-info` | Single info row |
| `zcl-sch-appoint-detail-form-wra` | Form wrapper |
| `zcl-sch-appoint-detail-form` | Form element container |
| `zclnavigation-action` | Week prev/next nav buttons |
| `zclcurrent-week` | "22 - 28 Mar 2026" label |

---

## 5. COMPONENT ARCHITECTURE SUMMARY

```
BookingPage
├── Sidebar (zclslotbook__preview__sidebar)
│   ├── Logo
│   ├── OrganizerInfo (name + company)
│   ├── BookingDetails (title, duration, conference, timezone, time format)
│   └── MiniCalendar (month grid, date picker)
│
└── MainContent (zclslotbook__preview__slots__wrapper)
    ├── WeekNavHeader (prev/next week + current week label)
    └── SlotContainer
        ├── DayHeaders [Sun-Sat]
        └── SlotColumns [one per day]
            └── TimeSlotButton (per available slot)
                → onClick → opens ScheduleAppointmentModal

ScheduleAppointmentModal (zmdialog--split)
├── LeftPanel (appointment summary)
│   ├── Title: "Schedule Appointment"
│   └── InfoRows (datetime, conference, location, timezone, duration)
└── RightPanel (user form)
    ├── Title: "Enter your details"
    ├── NameInput (required, maxlength 255)
    ├── EmailInput (required, maxlength 255)
    └── Footer
        ├── [Send OTP] button (primary/filled)
        └── [Cancel] button (outlined/default)
            → Cancel → closes modal, returns to Step 1

OTPVerificationStep (after Send OTP)
├── OTP input field
└── [Verify / Confirm] button

ConfirmationScreen (after OTP verified)
└── Booking confirmed summary
```

---

## 6. DATA FLOW

1. User selects a date on mini-calendar → week view updates to show that week
2. User clicks a time slot button → `onClick` opens modal with that slot's datetime
3. User fills Name + Email → clicks "Send OTP"
4. System sends OTP email to user's email address
5. User enters OTP → system verifies → appointment is booked
6. Confirmation screen is shown with booking details

---

## 7. AVAILABLE TIME SLOTS (current config)
Morning: 9:00, 9:45, 10:30, 11:15 am
Noon: 12:00, 12:45 pm
Afternoon: 1:30, 3:30, 4:15, 5:00, 5:45 pm
(Note: 2:00-3:30 pm gap — likely unavailable/blocked)

---

## 8. REFERENCE FILES
- `zoho_calendar_booking_page_ui.html` — Full DOM snapshot of the booking page (no modal)
- `zoho_booking_flow_modal.html` — Full DOM snapshot with Schedule Appointment modal open (Step 3)
- `zoho_calendar_full_ui.html` — Full Zoho Calendar app (for shared design system reference)
- `APPOINTMENT_BOOKING_CONTEXT.md` — Create/Edit/Share link flow context

All files in: ~/Downloads/
