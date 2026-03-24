import React from 'react';
import {
  BOOKING_TYPE,
  CONFERENCE,
  CONFERENCE_TYPE,
  VISIBILITY,
  VISIBILITY_OPTIONS,
} from '../../constants/bookingConstants';

export default function AppointmentDetails({ values, onChange }) {
  const {
    title = '',
    dateRange = { start: '', end: '' },
    meetingType = CONFERENCE.NONE,
    conferenceType = CONFERENCE_TYPE.AUDIO,
    visibility = VISIBILITY.ORGANISATION,
    bookingType = BOOKING_TYPE.ONE_TO_ONE,
  } = values;

  const isGroup = bookingType === BOOKING_TYPE.ONE_TO_MANY;

  function set(key, val) { onChange({ ...values, [key]: val }); }

  function handleBookingTypeChange(type) {
    const update = { ...values, bookingType: type };
    if (type === BOOKING_TYPE.ONE_TO_MANY) update.visibility = VISIBILITY.ORGANISATION;
    onChange(update);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Booking Type */}
      <div>
        <FieldLabel>
          Booking type
          {values._isEdit && <span style={{ marginLeft: 6, fontSize: 11, color: '#d97706', fontWeight: 400 }}>Cannot be changed</span>}
        </FieldLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { type: BOOKING_TYPE.ONE_TO_ONE,  label: 'One-to-One',    desc: 'Single attendee per slot' },
            { type: BOOKING_TYPE.ONE_TO_MANY, label: 'Group Booking', desc: 'Multiple attendees per slot' },
          ].map(opt => {
            const active = bookingType === opt.type;
            return (
              <button
                key={opt.type} type="button"
                disabled={values._isEdit}
                onClick={() => handleBookingTypeChange(opt.type)}
                style={{
                  flex: 1, textAlign: 'left',
                  padding: '10px 12px',
                  border: `1.5px solid ${active ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: 8,
                  background: active ? '#eff6ff' : '#fff',
                  cursor: values._isEdit ? 'not-allowed' : 'pointer',
                  opacity: values._isEdit ? 0.6 : 1,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 600, color: active ? '#1d4ed8' : '#374151', marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <FieldLabel>Title <Req /></FieldLabel>
        <Input
          type="text" value={title} maxLength={255}
          placeholder="Enter the appointment title"
          onChange={e => set('title', e.target.value)}
        />
      </div>

      {/* Date Range */}
      <div>
        <FieldLabel>Date range</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input type="date" value={dateRange.start} onChange={e => set('dateRange', { ...dateRange, start: e.target.value })} style={{ flex: 1 }} />
          <span style={{ color: '#9ca3af', fontSize: 12 }}>→</span>
          <Input type="date" value={dateRange.end} min={dateRange.start} onChange={e => set('dateRange', { ...dateRange, end: e.target.value })} style={{ flex: 1 }} />
        </div>
      </div>

      {/* Meeting Type */}
      <div>
        <FieldLabel>Meeting type</FieldLabel>
        <Select value={meetingType} onChange={e => set('meetingType', e.target.value)}>
          <option value={CONFERENCE.NONE}>None</option>
          <option value={CONFERENCE.INPERSON}>In-person</option>
          <option value={CONFERENCE.ZMEETING}>Online</option>
        </Select>
      </div>

      {/* Conference Type (conditional) */}
      {meetingType === CONFERENCE.ZMEETING && (
        <div>
          <FieldLabel>Conference</FieldLabel>
          <Select value={conferenceType} onChange={e => set('conferenceType', e.target.value)}>
            <option value={CONFERENCE_TYPE.AUDIO}>Zoho Audio Meeting</option>
            <option value={CONFERENCE_TYPE.VIDEO}>Zoho Video Meeting</option>
          </Select>
        </div>
      )}

      {/* Location (conditional) */}
      {meetingType === CONFERENCE.INPERSON && (
        <div>
          <FieldLabel>Location</FieldLabel>
          <Input type="text" value={values.location ?? ''} maxLength={255} placeholder="Enter meeting location" onChange={e => set('location', e.target.value)} />
        </div>
      )}

      {/* Visibility */}
      <div>
        <FieldLabel>Visibility</FieldLabel>
        {isGroup && (
          <div style={{ marginBottom: 8, padding: '7px 10px', borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 11, color: '#1d4ed8' }}>
            Group bookings are restricted to <strong>Organization</strong> visibility.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {VISIBILITY_OPTIONS.map(opt => {
            const disabled = isGroup && opt.value === VISIBILITY.PUBLIC;
            const checked = visibility === opt.value;
            return (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
                <Radio checked={checked} disabled={disabled} onChange={() => !disabled && set('visibility', opt.value)} />
                <span>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151' }}>{opt.label}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>{opt.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Shared form primitives ──────────────────────────────────────────────────
function FieldLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{children}</div>;
}
function Req() {
  return <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;
}
function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', height: 34, padding: '0 10px',
        border: '1px solid #d1d5db', borderRadius: 6,
        fontSize: 12.5, color: '#111827',
        outline: 'none', background: '#fff',
        transition: 'border-color 0.15s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#d1d5db'}
    />
  );
}
function Select({ children, style, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%', height: 34, padding: '0 10px',
        border: '1px solid #d1d5db', borderRadius: 6,
        fontSize: 12.5, color: '#111827',
        outline: 'none', background: '#fff',
        cursor: 'pointer',
        ...style,
      }}
    >{children}</select>
  );
}
function Radio({ checked, disabled, onChange }) {
  return (
    <span
      onClick={!disabled ? onChange : undefined}
      style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? '#3b82f6' : '#d1d5db'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />}
    </span>
  );
}
