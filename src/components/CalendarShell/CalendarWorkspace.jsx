import React, { useEffect, useRef } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const HOUR_H    = 56;   // px per hour row
const GUTTER_W  = 52;   // px for the time label column
const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS     = Array.from({ length: 24 }, (_, i) => i);

// ── Mock data (mirrors Zoho screenshot) ──────────────────────────────────────
function getMockEvents(weekDates) {
  const allDay = [];
  const timed  = [];

  weekDates.forEach((date, i) => {
    const key = date.toISOString().slice(0, 10);

    // "PRaval invited 3:00 – 4:00" on every day
    timed.push({
      id: `praval-${i}`, dayIndex: i,
      title: 'PRaval invited', sub: '3:00 – 4:00',
      startH: 3, startM: 0, durationMins: 60,
      type: 'invited', color: '#dc2626',
    });

    // All-day events on Tuesday (i=2) and Friday (i=5)
    if (i === 2) allDay.push({ id: 'ad-tu', dayIndex: 2, title: 'India: Barahimizong (NH)', color: '#7c3aed' });
    if (i === 5) allDay.push({ id: 'ad-fr', dayIndex: 5, title: 'India: Pa Togan Nengminja', color: '#7c3aed' });
  });

  return { allDay, timed };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getWeekDates(offset) {
  const today  = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + offset * 7);
  sunday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function formatHour(h) {
  if (h === 0)  return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function formatWeekLabel(dates) {
  const s = dates[0], e = dates[6];
  const so = { day: 'numeric', month: 'short' };
  const eo = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${s.toLocaleDateString('en-US', so)} – ${e.toLocaleDateString('en-US', eo)}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CalendarWorkspace({ weekOffset, onNavigate }) {
  const scrollRef = useRef(null);
  const today     = new Date();
  const weekDates = getWeekDates(weekOffset);
  const { allDay, timed } = getMockEvents(weekDates);

  // Scroll to 7am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_H;
    }
  }, []);

  // Current time indicator (only when viewing current week)
  const nowH = today.getHours();
  const nowM = today.getMinutes();
  const nowTop = nowH * HOUR_H + (nowM / 60) * HOUR_H;
  const isCurrentWeek = weekDates.some(d => isSameDay(d, today));
  const todayIndex    = weekDates.findIndex(d => isSameDay(d, today));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: '#fff' }}>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 52, padding: '0 16px', gap: 8,
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
        background: '#fff',
      }}>
        {/* Today */}
        <button style={btn.outline} onClick={() => onNavigate(-weekOffset)}>Today</button>

        {/* Prev / Next */}
        <div style={{ display: 'flex', gap: 2 }}>
          <button style={btn.icon} onClick={() => onNavigate(-1)} aria-label="Previous week">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button style={btn.icon} onClick={() => onNavigate(1)} aria-label="Next week">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Date range */}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
          {formatWeekLabel(weekDates)}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* View buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['Week', 'Meet Now', 'Schedule', 'Yet to respond'].map((v, i) => (
            <button key={v} style={i === 0 ? btn.viewActive : btn.view}>{v}</button>
          ))}
        </div>

        {/* Print + more */}
        <button style={btn.icon} aria-label="Print">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
        </button>
        <button style={btn.icon} aria-label="More">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#6b7280' }}>
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* ── Day header row ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
        background: '#fff',
      }}>
        {/* GMT label */}
        <div style={{
          width: GUTTER_W, flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          justifyContent: 'flex-end', padding: '6px 8px 4px 0',
          fontSize: 10, color: '#9ca3af', lineHeight: 1.3,
        }}>
          <span>GMT</span>
          <span>+05:30</span>
        </div>

        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          return (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '8px 4px 6px',
              borderLeft: i === 0 ? '1px solid #e5e7eb' : '1px solid #e5e7eb',
            }}>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginBottom: 3 }}>
                {DAYS[date.getDay()]}
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: isToday ? 700 : 400,
                background: isToday ? '#3b82f6' : 'transparent',
                color: isToday ? '#fff' : '#111827',
              }}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── All-day strip ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
        minHeight: 28,
        background: '#fff',
      }}>
        <div style={{
          width: GUTTER_W, flexShrink: 0,
          fontSize: 10, color: '#9ca3af', textAlign: 'right',
          padding: '5px 8px 0 0',
        }}>all-day</div>
        {weekDates.map((_, i) => {
          const events = allDay.filter(e => e.dayIndex === i);
          return (
            <div key={i} style={{
              flex: 1, borderLeft: '1px solid #e5e7eb',
              padding: '3px 3px',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              {events.map(ev => (
                <div key={ev.id} style={{
                  fontSize: 11, fontWeight: 500,
                  background: `${ev.color}18`,
                  borderLeft: `3px solid ${ev.color}`,
                  color: ev.color,
                  borderRadius: '0 4px 4px 0',
                  padding: '1px 5px',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  cursor: 'pointer',
                }}>{ev.title}</div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ── Scrollable time grid ────────────────────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#fff' }}>
        <div style={{ position: 'relative', height: 24 * HOUR_H, display: 'flex' }}>

          {/* Time gutter */}
          <div style={{ width: GUTTER_W, flexShrink: 0, position: 'relative' }}>
            {HOURS.map(h => (
              <div key={h} style={{
                height: HOUR_H, display: 'flex',
                alignItems: 'flex-start', justifyContent: 'flex-end',
                paddingRight: 8, paddingTop: 0,
              }}>
                {h > 0 && (
                  <span style={{
                    fontSize: 10, color: '#9ca3af', fontWeight: 500,
                    marginTop: -7, whiteSpace: 'nowrap',
                  }}>
                    {formatHour(h)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div style={{ flex: 1, display: 'flex', position: 'relative' }}>

            {weekDates.map((date, colIdx) => {
              const colEvents = timed.filter(e => e.dayIndex === colIdx);
              return (
                <div key={colIdx} style={{
                  flex: 1, position: 'relative',
                  borderLeft: '1px solid #e5e7eb',
                  minWidth: 0,
                }}>

                  {/* Hour grid lines */}
                  {HOURS.map(h => (
                    <div key={h} style={{
                      height: HOUR_H,
                      borderBottom: h < 23 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      {/* Half-hour tick */}
                      <div style={{
                        position: 'absolute',
                        top: h * HOUR_H + HOUR_H / 2,
                        left: 0, right: 0,
                        borderBottom: '1px dashed #f3f4f6',
                        pointerEvents: 'none',
                      }} />
                    </div>
                  ))}

                  {/* Current time indicator */}
                  {isCurrentWeek && colIdx === todayIndex && (
                    <div style={{
                      position: 'absolute',
                      top: nowTop - 1, left: -1, right: 0,
                      height: 2, background: '#3b82f6',
                      zIndex: 5, pointerEvents: 'none',
                    }}>
                      <div style={{
                        position: 'absolute', left: -4, top: -4,
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#3b82f6',
                      }} />
                    </div>
                  )}

                  {/* Events */}
                  {colEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EventCard ─────────────────────────────────────────────────────────────────
function EventCard({ event }) {
  const top    = event.startH * HOUR_H + (event.startM / 60) * HOUR_H;
  const height = Math.max((event.durationMins / 60) * HOUR_H - 2, 20);
  const isInvited = event.type === 'invited';

  return (
    <div
      className={isInvited ? 'event-invited' : ''}
      style={{
        position: 'absolute',
        top, left: 2, right: 2, height,
        borderLeft: `3px solid ${event.color}`,
        borderRadius: '0 4px 4px 0',
        backgroundColor: isInvited ? 'transparent' : `${event.color}18`,
        padding: '3px 6px',
        overflow: 'hidden',
        cursor: 'pointer',
        zIndex: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        transition: 'filter 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
    >
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: isInvited ? event.color : event.color,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        lineHeight: 1.3,
      }}>
        {event.title}
      </div>
      {event.sub && height > 28 && (
        <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.2, marginTop: 1 }}>
          {event.sub}
        </div>
      )}
    </div>
  );
}

// ── Button styles ─────────────────────────────────────────────────────────────
const btn = {
  outline: {
    height: 30, padding: '0 12px',
    border: '1px solid #d1d5db', borderRadius: 6,
    fontSize: 13, fontWeight: 500, color: '#374151',
    background: '#fff', cursor: 'pointer',
    transition: 'background 0.1s, border-color 0.1s',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  icon: {
    width: 30, height: 30,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, color: '#6b7280', cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'background 0.1s',
    flexShrink: 0,
  },
  view: {
    height: 30, padding: '0 10px',
    border: '1px solid #d1d5db', borderRadius: 6,
    fontSize: 12, fontWeight: 500, color: '#374151',
    background: '#fff', cursor: 'pointer',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  viewActive: {
    height: 30, padding: '0 10px',
    border: '1px solid #3b82f6', borderRadius: 6,
    fontSize: 12, fontWeight: 600, color: '#3b82f6',
    background: '#eff6ff', cursor: 'pointer',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
};
