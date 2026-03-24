import React, { useState, useActionState, useMemo } from 'react';
import AppointmentDetails from './AppointmentDetails';
import GroupBookingSection from './GroupBookingSection';
import GeneralAvailability from './GeneralAvailability';
import BookingLimits from './BookingLimits';
import Branding from './Branding';
import ErrorBanner from '../shared/ErrorBanner';
import Spinner from '../shared/Spinner';
import { BOOKING_TYPE, DEFAULTS, CONFIRM_MODE, USER_LIMIT } from '../../constants/bookingConstants';

// ─── Default form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '',
  dateRange: { start: '', end: '' },
  meetingType: 'none',
  conferenceType: 'audio',
  visibility: 0,
  bookingType: BOOKING_TYPE.ONE_TO_ONE,
  slotCapacity: DEFAULTS.slotCapacity,
  attPermission: DEFAULTS.attPermission,
  schedulingWindow: { ...DEFAULTS.schedulingWindow },
  checkAvailabilityFrom: [],
  duration: DEFAULTS.duration,
  availableHours: {},
  bufferTimeBefore: DEFAULTS.bufferBefore,
  bufferTimeAfter: DEFAULTS.bufferAfter,
  maxBookings: DEFAULTS.maxBookings,
  logoUrl: '',
  companyName: '',
  confirmMode: DEFAULTS.confirmMode,
  perUserLimit: DEFAULTS.perUserLimit,
  waitlistEnabled: DEFAULTS.waitlistEnabled,
};

const SECTIONS = [
  { id: 'details',      label: 'Appointment Details'    },
  { id: 'group',        label: 'Group Booking Settings' },
  { id: 'availability', label: 'General Availability'   },
  { id: 'limits',       label: 'Booking Limits'         },
  { id: 'branding',     label: 'Branding'               },
];

export default function BookingPageSetup({
  initialValues = null,
  onSave,
  onCancel,
  userCalendars = [],
}) {
  const isEdit = Boolean(initialValues?._isEdit);
  const [form, setForm] = useState(initialValues ?? EMPTY_FORM);
  const [openSections, setOpenSections] = useState({
    details: true, group: true, availability: true, limits: false, branding: false,
  });

  const isGroup = form.bookingType === BOOKING_TYPE.ONE_TO_MANY;

  const [submitState, submitAction, isSubmitting] = useActionState(
    async (_prevState, _formData) => {
      try {
        await onSave(buildPayload(form));
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message ?? 'Could not save booking page.' };
      }
    },
    { success: false, error: null }
  );

  function toggleSection(id) {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const canSubmit = form.title.trim().length > 0 && !isSubmitting;

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={S.modal}>

        {/* ── Left: Configuration Panel ── */}
        <div style={S.leftPanel}>

          {/* Header */}
          <div style={S.leftHeader}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
              {isEdit ? 'Edit Booking Page' : 'Booking Page Setup'}
            </h2>
          </div>

          {/* Error */}
          {submitState.error && (
            <div style={{ padding: '12px 20px 0' }}>
              <ErrorBanner message={submitState.error} />
            </div>
          )}

          {/* Scrollable form body */}
          <div style={S.leftBody}>
            <form action={submitAction} id="booking-setup-form">

              <Section
                label="Appointment Details"
                open={openSections.details}
                onToggle={() => toggleSection('details')}
                icon={<CalIcon />}
              >
                <AppointmentDetails values={form} onChange={setForm} />
              </Section>

              {isGroup && (
                <Section
                  label="Group Booking Settings"
                  open={openSections.group}
                  onToggle={() => toggleSection('group')}
                  icon={<GroupIcon />}
                  badge={<Badge text="Group" />}
                >
                  <GroupBookingSection values={form} onChange={setForm} />
                </Section>
              )}

              <Section
                label="General Availability"
                open={openSections.availability}
                onToggle={() => toggleSection('availability')}
                icon={<ClockIcon />}
              >
                <GeneralAvailability values={form} onChange={setForm} userCalendars={userCalendars} />
              </Section>

              <Section
                label="Booking Limits"
                open={openSections.limits}
                onToggle={() => toggleSection('limits')}
                icon={<ShieldIcon />}
              >
                <BookingLimits values={form} onChange={setForm} />
              </Section>

              <Section
                label="Branding"
                open={openSections.branding}
                onToggle={() => toggleSection('branding')}
                icon={<PaletteIcon />}
              >
                <Branding values={form} onChange={setForm} />
              </Section>

            </form>
          </div>

          {/* Footer */}
          <div style={S.leftFooter}>
            <button type="button" onClick={onCancel} style={S.btnCancel}>
              Cancel
            </button>
            <button
              type="submit"
              form="booking-setup-form"
              disabled={!canSubmit}
              style={canSubmit ? S.btnPrimary : { ...S.btnPrimary, opacity: 0.5, cursor: 'not-allowed' }}
            >
              {isSubmitting && <Spinner size={14} />}
              {isEdit ? 'Update Link' : 'Create Link'}
            </button>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div style={S.rightPanel}>
          <div style={S.rightHeader}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Preview
            </span>
            <button onClick={onCancel} style={S.closeBtn} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <LivePreview form={form} />
        </div>

      </div>
    </div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────────────────────
function Section({ label, open, onToggle, children, icon, badge }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 0',
          borderBottom: open ? 'none' : '1px solid #f3f4f6',
          cursor: 'pointer',
          transition: 'background 0.1s',
        }}
      >
        <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', flex: 1, textAlign: 'left' }}>
          {label}
        </span>
        {badge}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '8px 0 16px', borderBottom: '1px solid #f3f4f6' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Live Preview ────────────────────────────────────────────────────────────
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const PREVIEW_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function LivePreview({ form }) {
  const isGroup = form.bookingType === BOOKING_TYPE.ONE_TO_MANY;
  const today = new Date();

  // Get current week dates
  const weekDates = useMemo(() => {
    const sun = new Date(today);
    sun.setDate(today.getDate() - today.getDay());
    sun.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      return d;
    });
  }, []);

  const weekLabel = useMemo(() => {
    const s = weekDates[0], e = weekDates[6];
    const fmt = (d, opts) => d.toLocaleDateString('en-GB', opts);
    return `${fmt(s, { day: '2-digit', month: 'short', year: 'numeric' })} - ${fmt(e, { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }, [weekDates]);

  // Compute which days have enabled availability
  const enabledDays = useMemo(() => {
    return weekDates.map((date, i) => {
      const dayName = DAYS_FULL[date.getDay()];
      const dayConf = form.availableHours?.[dayName];
      return dayConf ? dayConf.enabled : (date.getDay() >= 1 && date.getDay() <= 5);
    });
  }, [weekDates, form.availableHours]);

  // Compute slots per day based on duration and available hours
  const daySlots = useMemo(() => {
    const dur = form.duration || 30;
    return weekDates.map((date, i) => {
      if (!enabledDays[i]) return [];
      const dayName = DAYS_FULL[date.getDay()];
      const conf = form.availableHours?.[dayName];
      const ranges = conf?.slots ?? [{ start: '09:00', end: '18:00' }];
      const slots = [];
      ranges.forEach(range => {
        const [sh, sm] = (range.start || '09:00').split(':').map(Number);
        const [eh, em] = (range.end || '18:00').split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        for (let m = startMin; m + dur <= endMin; m += dur) {
          slots.push({ startMin: m, endMin: m + dur });
        }
      });
      return slots;
    });
  }, [weekDates, enabledDays, form.availableHours, form.duration]);

  const HOUR_H = 40;
  const minHour = 9;
  const maxHour = 18;
  const gridHeight = (maxHour - minHour) * HOUR_H;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Preview card header */}
      <div style={S.previewCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {form.logoUrl
            ? <img src={form.logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', border: '1px solid #e5e7eb' }} />
            : <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🗓️</div>
          }
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: form.title ? '#111827' : '#d1d5db' }}>
              {form.title || 'Appointment title'}
            </div>
            {form.companyName && <div style={{ fontSize: 11, color: '#6b7280' }}>{form.companyName}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <PreviewTag text={`${form.duration} min`} />
          {isGroup && <PreviewTag text={`${form.slotCapacity} seats`} accent />}
          <PreviewTag text={form.visibility === 0 ? 'Organization' : 'Public'} />
          {form.meetingType !== 'none' && (
            <PreviewTag text={form.meetingType === 'zmeeting' ? 'Online' : 'In-person'} />
          )}
        </div>
      </div>

      {/* Booking grid preview */}
      <div style={S.previewCard}>

        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button style={S.navBtn} aria-label="Previous">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{weekLabel}</span>
          <button style={S.navBtn} aria-label="Next">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: 8 }}>

          {/* Time gutter */}
          <div style={{ width: 46, flexShrink: 0, borderRight: '1px solid #e5e7eb', background: '#f9fafb' }}>
            {/* TZ label */}
            <div style={{ height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e5e7eb', padding: '4px 0' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>IST</span>
              <span style={{ fontSize: 9, color: '#9ca3af' }}>+05:30</span>
            </div>
            {/* Hour labels */}
            {PREVIEW_HOURS.map(h => (
              <div key={h} style={{
                height: HOUR_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                paddingRight: 6, paddingTop: 0,
              }}>
                <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 500, marginTop: -5 }}>
                  {h === 0 ? '12 am' : h === 12 ? '12 pm' : h < 12 ? `${h} am` : `${h - 12} pm`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date, colIdx) => {
            const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
            const enabled = enabledDays[colIdx];
            const slots = daySlots[colIdx];

            return (
              <div key={colIdx} style={{ flex: 1, minWidth: 0, borderLeft: colIdx > 0 ? '1px solid #e5e7eb' : 'none' }}>
                {/* Day header */}
                <div style={{
                  height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  borderBottom: '1px solid #e5e7eb',
                  background: isToday ? '#eff6ff' : '#f9fafb',
                }}>
                  <span style={{ fontSize: 9, fontWeight: 500, color: isToday ? '#2563eb' : '#6b7280', textTransform: 'uppercase' }}>
                    {DAYS_SHORT[date.getDay()]}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: isToday ? 700 : 500,
                    color: isToday ? '#fff' : '#374151',
                    background: isToday ? '#3b82f6' : 'transparent',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {date.getDate()}
                  </span>
                </div>

                {/* Slots area */}
                <div style={{ position: 'relative', height: gridHeight, background: enabled ? '#fff' : '#fafafa' }}>
                  {/* Hour grid lines */}
                  {PREVIEW_HOURS.map((h, hi) => (
                    <div key={h} style={{
                      position: 'absolute', top: hi * HOUR_H, left: 0, right: 0,
                      borderBottom: '1px solid #f3f4f6',
                    }} />
                  ))}

                  {/* Slot blocks */}
                  {slots.map((slot, si) => {
                    const top = ((slot.startMin / 60) - minHour) * HOUR_H;
                    const height = ((slot.endMin - slot.startMin) / 60) * HOUR_H - 2;
                    if (top < 0 || top >= gridHeight) return null;
                    return (
                      <div key={si} style={{
                        position: 'absolute', top: top + 1, left: 2, right: 2,
                        height: Math.max(height, 12),
                        background: '#dbeafe',
                        border: '1px solid #93c5fd',
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }} />
                    );
                  })}

                  {/* Disabled overlay */}
                  {!enabled && (
                    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 8px)' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group capacity preview */}
      {isGroup && (
        <div style={S.previewCard}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Slot Capacity
          </div>
          <SeatBar total={form.slotCapacity} filled={0} />
          <SeatBar total={form.slotCapacity} filled={Math.floor(form.slotCapacity * 0.6)} />
          <SeatBar total={form.slotCapacity} filled={Math.floor(form.slotCapacity * 0.85)} />
          <SeatBar total={form.slotCapacity} filled={form.slotCapacity} />
        </div>
      )}
    </div>
  );
}

// ─── Small sub-components ────────────────────────────────────────────────────
function PreviewTag({ text, accent }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 4,
      background: accent ? '#dbeafe' : '#f3f4f6',
      color: accent ? '#1d4ed8' : '#6b7280',
    }}>{text}</span>
  );
}

function Badge({ text }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px',
      borderRadius: 999, background: '#dbeafe', color: '#1d4ed8',
    }}>{text}</span>
  );
}

function SeatBar({ total, filled }) {
  const pct = total > 0 ? (filled / total) * 100 : 0;
  const left = total - filled;
  const bg = pct >= 100 ? '#f87171' : pct >= 80 ? '#fbbf24' : '#34d399';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: bg, width: `${pct}%`, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 10, color: '#9ca3af', width: 44, textAlign: 'right' }}>
        {pct >= 100 ? 'Full' : `${left} left`}
      </span>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function CalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function GroupIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function PaletteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12" r="1.5"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

// ─── Payload builder ─────────────────────────────────────────────────────────
function buildPayload(f) {
  const base = {
    title: f.title,
    conference: f.meetingType,
    conference_type: f.conferenceType,
    location: f.location ?? '',
    duration: f.duration,
    maxBookings: f.maxBookings,
    type: f.bookingType,
    visibility: f.visibility,
    bufferTimeBefore: f.bufferTimeBefore,
    bufferTimeAfter: f.bufferTimeAfter,
    availabilitySettings: { calendars: f.checkAvailabilityFrom, availableHours: f.availableHours },
    bookingDetails: { startDate: f.dateRange.start, endDate: f.dateRange.end },
    schedulingWindow: f.schedulingWindow,
    branding: { logoUrl: f.logoUrl, companyName: f.companyName },
  };
  if (f.bookingType === BOOKING_TYPE.ONE_TO_MANY) {
    base.slotCapacity = f.slotCapacity;
    base.attPermission = f.attPermission;
    base.confirmMode = f.confirmMode;
    base.perUserLimit = f.perUserLimit;
    base.waitlistEnabled = f.waitlistEnabled;
  }
  return base;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.45)',
    padding: 24,
  },
  modal: {
    display: 'flex',
    width: '100%', maxWidth: 1080,
    height: '92vh', maxHeight: 820,
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
    overflow: 'hidden',
  },
  leftPanel: {
    width: 400, flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    borderRight: '1px solid #e5e7eb',
    background: '#fff',
  },
  leftHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 20px',
    borderBottom: '1px solid #f3f4f6',
    flexShrink: 0,
  },
  leftBody: {
    flex: 1, overflowY: 'auto',
    padding: '8px 20px 20px',
  },
  leftFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8,
    padding: '12px 20px',
    borderTop: '1px solid #e5e7eb',
    flexShrink: 0,
    background: '#fff',
  },
  rightPanel: {
    flex: 1, display: 'flex', flexDirection: 'column',
    background: '#f9fafb',
    overflow: 'hidden',
    minWidth: 0,
  },
  rightHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  closeBtn: {
    width: 28, height: 28, borderRadius: 6,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#9ca3af', cursor: 'pointer',
    transition: 'background 0.1s, color 0.1s',
  },
  previewCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 14,
  },
  navBtn: {
    width: 26, height: 26, borderRadius: 6,
    border: '1px solid #d1d5db',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#6b7280', cursor: 'pointer',
    background: '#fff',
  },
  btnCancel: {
    height: 36, padding: '0 16px',
    border: '1px solid #d1d5db', borderRadius: 7,
    fontSize: 13, fontWeight: 500, color: '#374151',
    background: '#fff', cursor: 'pointer',
    transition: 'background 0.1s',
  },
  btnPrimary: {
    height: 36, padding: '0 20px',
    border: 'none', borderRadius: 7,
    fontSize: 13, fontWeight: 600, color: '#fff',
    background: '#3b82f6', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background 0.1s',
  },
};
