import React, { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import CalendarWorkspace from './CalendarWorkspace';
import AppointmentBookingPanel from '../BookingPageCard/AppointmentBookingPanel';

const MY_CALENDARS = [
  { id: 'c1', name: "Raghavan's Primary", color: '#e53e3e', on: true },
  { id: 'c2', name: 'web import',         color: '#38a169', on: true },
  { id: 'c3', name: 'untitled',           color: '#3182ce', on: false },
  { id: 'c4', name: 'Test calendar 4',    color: '#805ad5', on: false },
  { id: 'c5', name: 'Untitledhh',         color: '#3182ce', on: false },
  { id: 'c6', name: 'Calendar work items',color: '#38a169', on: true },
];

const SHARED_CALENDARS = [
  { id: 's1', name: 'Muthusamy K',   color: '#38a169', on: true  },
  { id: 's2', name: 'krish1',        color: '#3182ce', on: false },
  { id: 's3', name: 'rajakumaran.p', color: '#38a169', on: true  },
];

const USER_CALENDARS_FOR_PANEL = [
  { id: 'cal-primary', name: "Raghavan's Primary" },
  { id: 'cal-work',    name: 'Calendar work items' },
];

export default function CalendarShell() {
  const [weekOffset, setWeekOffset] = useState(0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        height: 56,
        padding: '0 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
        gap: 12,
        zIndex: 30,
        minWidth: 0,
      }}>
        {/* Hamburger */}
        <button style={tb.iconBtn} aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 192, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28,
            background: '#3b82f6',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Calendar</span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 380 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f3f4f6', borderRadius: 8, padding: '7px 12px', cursor: 'text',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search (\ )"
              style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#374151', outline: 'none', width: '100%' }}
            />
          </label>
        </div>

        {/* Right actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Bell with badge */}
          <button style={tb.iconBtn} aria-label="Notifications">
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{
                position: 'absolute', top: -5, right: -7,
                background: '#ef4444', color: '#fff',
                fontSize: 9, fontWeight: 700,
                borderRadius: 999, padding: '1px 4px',
                lineHeight: '14px', minWidth: 16, textAlign: 'center',
              }}>77</span>
            </span>
          </button>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#d1fae5', border: '1.5px solid #6ee7b7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#065f46', cursor: 'pointer',
          }}>R</div>
          {/* App grid */}
          <button style={tb.iconBtn} aria-label="Apps">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#6b7280' }}>
              <rect x="3"  y="3"  width="7" height="7" rx="1"/>
              <rect x="14" y="3"  width="7" height="7" rx="1"/>
              <rect x="3"  y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <LeftSidebar
          weekOffset={weekOffset}
          onNavigate={d => setWeekOffset(v => v + d)}
          myCalendars={MY_CALENDARS}
          sharedCalendars={SHARED_CALENDARS}
        />
        <CalendarWorkspace
          weekOffset={weekOffset}
          onNavigate={d => setWeekOffset(v => v + d)}
        />
        <aside style={{
          width: 288, flexShrink: 0,
          background: '#fff',
          borderLeft: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <AppointmentBookingPanel userCalendars={USER_CALENDARS_FOR_PANEL} />
        </aside>
      </div>
    </div>
  );
}

/* ── Shared top-bar button style ─────────────────────────────────────────── */
const tb = {
  iconBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 8,
    color: '#6b7280', cursor: 'pointer', flexShrink: 0,
    transition: 'background 0.15s',
  },
};
