import React from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_HOURS = DAYS.reduce((acc, day, i) => {
  const isWeekday = i >= 1 && i <= 5;
  acc[day] = { enabled: isWeekday, slots: isWeekday ? [{ start: '09:00', end: '18:00' }] : [] };
  return acc;
}, {});

export default function GeneralAvailability({ values, onChange, userCalendars = [] }) {
  const {
    checkAvailabilityFrom = [],
    duration = 30,
    availableHours = DEFAULT_HOURS,
  } = values;

  function set(key, val) { onChange({ ...values, [key]: val }); }

  function toggleCalendar(calId) {
    const next = checkAvailabilityFrom.includes(calId)
      ? checkAvailabilityFrom.filter(id => id !== calId)
      : [...checkAvailabilityFrom, calId];
    set('checkAvailabilityFrom', next);
  }

  function setDay(day, patch) {
    set('availableHours', { ...availableHours, [day]: { ...availableHours[day], ...patch } });
  }

  function setSlot(day, idx, field, val) {
    const slots = availableHours[day].slots.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    setDay(day, { slots });
  }

  function addSlot(day) {
    setDay(day, { slots: [...availableHours[day].slots, { start: '09:00', end: '18:00' }] });
  }

  function removeSlot(day, idx) {
    setDay(day, { slots: availableHours[day].slots.filter((_, i) => i !== idx) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Check availability from */}
      {userCalendars.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <FL>Check availability from</FL>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{checkAvailabilityFrom.length} selected</span>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 10px', background: '#fafafa' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 2, paddingLeft: 2 }}>My Calendars</div>
            {userCalendars.map(cal => {
              const on = checkAvailabilityFrom.includes(cal.id);
              return (
                <label key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 2px 3px 14px', cursor: 'pointer' }}>
                  <Checkbox checked={on} onChange={() => toggleCalendar(cal.id)} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{cal.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Duration */}
      <div>
        <FL>Appointment duration</FL>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NumInput value={duration} min={5} max={480} step={5} onChange={v => set('duration', v)} width={64} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>Minutes</span>
        </div>
      </div>

      {/* Available Hours */}
      <div>
        <FL>Available hours</FL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DAYS.map(day => {
            const conf = availableHours[day] ?? { enabled: false, slots: [] };
            return (
              <div key={day} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, minHeight: 32 }}>
                {/* Day checkbox + label */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, width: 72, flexShrink: 0, paddingTop: 5, cursor: 'pointer' }}>
                  <Checkbox checked={conf.enabled} onChange={() => setDay(day, { enabled: !conf.enabled })} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: conf.enabled ? '#374151' : '#9ca3af' }}>{day.slice(0, 3)}</span>
                </label>

                {/* Time slots */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {conf.enabled ? (
                    <>
                      {conf.slots.map((slot, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <TimeInput value={slot.start} onChange={v => setSlot(day, idx, 'start', v)} />
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>–</span>
                          <TimeInput value={slot.end} onChange={v => setSlot(day, idx, 'end', v)} />
                          {/* Add */}
                          {idx === conf.slots.length - 1 && (
                            <button type="button" onClick={() => addSlot(day)} title="Add range" style={iconBtn}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                            </button>
                          )}
                          {/* Remove */}
                          {conf.slots.length > 1 && (
                            <button type="button" onClick={() => removeSlot(day, idx)} title="Remove range" style={iconBtn}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: '#d1d5db', paddingTop: 5 }}>Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────
function FL({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{children}</div>;
}

function Checkbox({ checked, onChange }) {
  return (
    <span
      onClick={onChange}
      style={{
        width: 15, height: 15, borderRadius: 3, flexShrink: 0,
        border: `1.5px solid ${checked ? '#3b82f6' : '#d1d5db'}`,
        background: checked ? '#3b82f6' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <polyline points="2,6 5,9 10,3"/>
        </svg>
      )}
    </span>
  );
}

function NumInput({ value, min, max, step, onChange, width = 60 }) {
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

function TimeInput({ value, onChange }) {
  return (
    <input
      type="time" value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: 90, height: 30, padding: '0 6px',
        border: '1px solid #d1d5db', borderRadius: 5,
        fontSize: 11.5, color: '#374151', outline: 'none',
      }}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#d1d5db'}
    />
  );
}

const iconBtn = {
  width: 26, height: 26, borderRadius: 5,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
  transition: 'background 0.1s',
};
