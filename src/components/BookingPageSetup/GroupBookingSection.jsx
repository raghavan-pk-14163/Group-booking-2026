import React from 'react';
import {
  SLOT_CAPACITY,
  ATT_PERMISSION,
  SCHEDULING_UNIT,
  SCHEDULING_UNIT_LABEL,
  CONFIRM_MODE,
  CONFIRM_MODE_LABEL,
  USER_LIMIT,
  DEFAULTS,
} from '../../constants/bookingConstants';

export default function GroupBookingSection({ values, onChange }) {
  const {
    slotCapacity = DEFAULTS.slotCapacity,
    attPermission = DEFAULTS.attPermission,
    schedulingWindow = DEFAULTS.schedulingWindow,
    confirmMode = DEFAULTS.confirmMode,
    perUserLimit = DEFAULTS.perUserLimit,
    waitlistEnabled = DEFAULTS.waitlistEnabled,
  } = values;

  function set(key, val) { onChange({ ...values, [key]: val }); }
  function setWindow(key, val) { onChange({ ...values, schedulingWindow: { ...schedulingWindow, [key]: val } }); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Slot Capacity */}
      <div>
        <FL>Seat capacity <HelpText>(max {SLOT_CAPACITY.MAX.toLocaleString()})</HelpText></FL>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NumInput value={slotCapacity} min={SLOT_CAPACITY.MIN} max={SLOT_CAPACITY.MAX}
            onChange={v => set('slotCapacity', v)} width={72} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>attendees per slot</span>
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          Slots show "Few seats left" when ≤ 20% remain.
        </div>
      </div>

      {/* Attendee Visibility */}
      <div>
        <FL>Attendee visibility</FL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { value: ATT_PERMISSION.HIDDEN,  label: 'Private roster',  desc: 'Attendees cannot see each other. (Recommended)' },
            { value: ATT_PERMISSION.VISIBLE, label: 'Shared roster',   desc: 'Attendees can see who else booked the same slot.' },
          ].map(opt => {
            const checked = attPermission === opt.value;
            return (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <Radio checked={checked} onChange={() => set('attPermission', opt.value)} />
                <span>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151' }}>{opt.label}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>{opt.desc}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Confirmation Mode */}
      <div>
        <FL>Confirmation mode</FL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { value: CONFIRM_MODE.AUTO,     label: 'Auto-confirm',       desc: 'Bookings are confirmed immediately after OTP verification.' },
            { value: CONFIRM_MODE.APPROVAL, label: 'Requires approval',  desc: 'Bookings go to pending state until organizer approves.' },
          ].map(opt => {
            const checked = confirmMode === opt.value;
            return (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <Radio checked={checked} onChange={() => set('confirmMode', opt.value)} />
                <span>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151' }}>{opt.label}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>{opt.desc}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Per-User Booking Limit */}
      <div>
        <FL>Per-user booking limit</FL>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NumInput value={perUserLimit} min={0} max={USER_LIMIT.MAX}
            onChange={v => set('perUserLimit', v)} width={60} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>bookings per user</span>
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          Set to 0 for unlimited. Limits how many times one email can book this event.
        </div>
      </div>

      {/* Waitlist Toggle */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FL>Waitlist</FL>
          <ToggleSwitch checked={waitlistEnabled} onChange={v => set('waitlistEnabled', v)} />
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
          {waitlistEnabled
            ? 'When a session is full, visitors can join a waitlist and get notified when a seat opens.'
            : 'Visitors will see full slots as disabled. Enable to allow waitlist sign-up.'}
        </div>
      </div>

      {/* Booking Window */}
      <div>
        <FL>Booking window</FL>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
          Set how far in advance attendees can book, and the minimum notice required.
        </div>

        {/* Min notice */}
        <div style={{ marginBottom: 10 }}>
          <SubLabel>Minimum notice</SubLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NumInput value={schedulingWindow.minDuration} min={0} max={999}
              onChange={v => setWindow('minDuration', v)} width={60} />
            <UnitSelect value={schedulingWindow.minUnit} onChange={v => setWindow('minUnit', v)} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>before slot</span>
          </div>
        </div>

        {/* Max advance */}
        <div>
          <SubLabel>Maximum advance booking</SubLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NumInput value={schedulingWindow.maxDuration} min={1} max={999}
              onChange={v => setWindow('maxDuration', v)} width={60} />
            <UnitSelect value={schedulingWindow.maxUnit} onChange={v => setWindow('maxUnit', v)} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>in advance</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────
function FL({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{children}</div>;
}
function HelpText({ children }) {
  return <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>{children}</span>;
}
function SubLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>{children}</div>;
}

function NumInput({ value, min, max, onChange, width = 60 }) {
  return (
    <input
      type="number" min={min} max={max} value={value}
      onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
      style={{
        width, height: 32, padding: '0 8px',
        border: '1px solid #d1d5db', borderRadius: 6,
        fontSize: 12.5, color: '#111827', outline: 'none',
        textAlign: 'center',
      }}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#d1d5db'}
    />
  );
}

function UnitSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        height: 32, padding: '0 8px',
        border: '1px solid #d1d5db', borderRadius: 6,
        fontSize: 12, color: '#374151', outline: 'none',
        cursor: 'pointer', background: '#fff',
      }}
    >
      {Object.entries(SCHEDULING_UNIT_LABEL).map(([val, label]) => (
        <option key={val} value={Number(val)}>{label}</option>
      ))}
    </select>
  );
}

function Radio({ checked, onChange }) {
  return (
    <span
      onClick={onChange}
      style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? '#3b82f6' : '#d1d5db'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
    >
      {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />}
    </span>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, padding: 2,
        background: checked ? '#3b82f6' : '#d1d5db',
        display: 'flex', alignItems: 'center',
        cursor: 'pointer', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s',
        transform: checked ? 'translateX(16px)' : 'translateX(0)',
      }} />
    </button>
  );
}
