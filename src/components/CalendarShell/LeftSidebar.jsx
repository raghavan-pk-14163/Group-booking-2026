import React, { useState } from 'react';

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function LeftSidebar({ weekOffset, onNavigate, myCalendars = [], sharedCalendars = [] }) {
  const [cals, setCals] = useState(myCalendars);
  const [shared, setShared] = useState(sharedCalendars);

  function toggleCal(arr, setter, id) {
    setter(arr.map(c => c.id === id ? { ...c, on: !c.on } : c));
  }

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '12px 0 16px',
    }}>

      {/* New Event button */}
      <div style={{ padding: '0 12px 16px' }}>
        <button
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '9px 16px',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(59,130,246,0.4)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
          New Event
        </button>
      </div>

      {/* Mini month calendar */}
      <MiniCalendar weekOffset={weekOffset} onNavigate={onNavigate} />

      {/* Divider */}
      <div style={{ height: 1, background: '#f3f4f6', margin: '12px 0' }} />

      {/* MY CALENDARS */}
      <CalSection
        title="MY CALENDARS"
        items={cals}
        onToggle={id => toggleCal(cals, setCals, id)}
      />

      <div style={{ height: 8 }} />

      {/* SHARED CALENDARS */}
      <CalSection
        title="SHARED CALENDARS"
        items={shared}
        onToggle={id => toggleCal(shared, setShared, id)}
      />

      <div style={{ height: 8 }} />

      {/* GROUP CALENDARS */}
      <CalSection
        title="GROUP CALENDARS"
        items={[]}
        onToggle={() => {}}
        addable
      />

      <div style={{ height: 8 }} />

      {/* OTHER */}
      <CalSection
        title="APP CALENDARS"
        items={[]}
        onToggle={() => {}}
      />
    </aside>
  );
}

/* ── Calendar section ────────────────────────────────────────────────────── */
function CalSection({ title, items, onToggle, addable }) {
  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#6b7280',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{title}</span>
        {addable && (
          <button style={{ color: '#9ca3af', lineHeight: 1, fontSize: 16, padding: '0 2px' }} title="Add">+</button>
        )}
      </div>
      {items.map(cal => (
        <CalRow key={cal.id} cal={cal} onToggle={() => onToggle(cal.id)} />
      ))}
      {items.length === 0 && (
        <span style={{ fontSize: 12, color: '#d1d5db', paddingLeft: 2 }}>None</span>
      )}
    </div>
  );
}

/* ── Single calendar row ─────────────────────────────────────────────────── */
function CalRow({ cal, onToggle }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '3px 2px', borderRadius: 6, cursor: 'pointer',
        transition: 'background 0.1s',
        userSelect: 'none',
      }}
      onClick={onToggle}
      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Color dot / checkmark */}
      <span style={{
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
        background: cal.on ? cal.color : 'transparent',
        border: `2px solid ${cal.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}>
        {cal.on && (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <polyline points="1.5,5 4,7.5 8.5,2.5"/>
          </svg>
        )}
      </span>
      <span style={{ fontSize: 12.5, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {cal.name}
      </span>
    </div>
  );
}

/* ── Mini month calendar ─────────────────────────────────────────────────── */
function MiniCalendar({ weekOffset, onNavigate }) {
  const today       = new Date();
  const display     = new Date(today);
  display.setDate(today.getDate() + weekOffset * 7);

  const year  = display.getFullYear();
  const month = display.getMonth();
  const label = display.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Which week does the current weekOffset land on?
  const activeSunday = new Date(today);
  activeSunday.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  function cellWeekOffset(d) {
    const cellDate = new Date(year, month, d);
    const sunday   = new Date(cellDate);
    sunday.setDate(cellDate.getDate() - cellDate.getDay());
    return Math.round((sunday - activeSunday) / (7 * 86400000));
  }

  function isInActiveWeek(d) {
    const cellDate = new Date(year, month, d);
    const sun = new Date(activeSunday);
    const sat = new Date(activeSunday);
    sat.setDate(sun.getDate() + 6);
    return cellDate >= sun && cellDate <= sat;
  }

  function isToday(d) {
    return year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ padding: '0 10px' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <button
          style={{ color: '#9ca3af', padding: '2px 4px', borderRadius: 4, fontSize: 13 }}
          onClick={() => onNavigate(-4)}
          title="Previous month"
        >◀</button>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
        <button
          style={{ color: '#9ca3af', padding: '2px 4px', borderRadius: 4, fontSize: 13 }}
          onClick={() => onNavigate(4)}
          title="Next month"
        >▶</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
        {DAYS_SHORT.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#9ca3af', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px 0' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} />;
          const active  = isInActiveWeek(d);
          const today_  = isToday(d);
          const delta   = cellWeekOffset(d);
          return (
            <button
              key={d}
              onClick={() => onNavigate(delta)}
              style={{
                width: '100%', aspectRatio: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: today_ ? 700 : 400,
                borderRadius: '50%',
                background: today_ ? '#3b82f6' : active ? '#eff6ff' : 'transparent',
                color: today_ ? '#fff' : active ? '#1d4ed8' : '#374151',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!today_) e.currentTarget.style.background = '#f3f4f6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = today_ ? '#3b82f6' : active ? '#eff6ff' : 'transparent'; }}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}
