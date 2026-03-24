import React from 'react';
import { DEFAULTS } from '../../constants/bookingConstants';

export default function BookingLimits({ values, onChange }) {
  const {
    bufferTimeBefore = DEFAULTS.bufferBefore,
    bufferTimeAfter  = DEFAULTS.bufferAfter,
    maxBookings      = DEFAULTS.maxBookings,
  } = values;

  function set(key, val) { onChange({ ...values, [key]: val }); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <FL>Buffer before</FL>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NumInput value={bufferTimeBefore} min={0} max={120} step={5} onChange={v => set('bufferTimeBefore', v)} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>min</span>
          </div>
        </div>
        <div>
          <FL>Buffer after</FL>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NumInput value={bufferTimeAfter} min={0} max={120} step={5} onChange={v => set('bufferTimeAfter', v)} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>min</span>
          </div>
        </div>
      </div>
      <div>
        <FL>Maximum bookings per day</FL>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NumInput value={maxBookings} min={1} max={500} onChange={v => set('maxBookings', v)} width={72} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>bookings</span>
        </div>
      </div>
    </div>
  );
}

function FL({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{children}</div>;
}

function NumInput({ value, min, max, step = 1, onChange, width = 60 }) {
  return (
    <input
      type="number" min={min} max={max} step={step} value={value}
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
