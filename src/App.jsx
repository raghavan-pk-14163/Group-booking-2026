import React from 'react';
import CalendarShell from './components/CalendarShell/CalendarShell';
import PublicBookingPage from './components/PublicBookingPage/PublicBookingPage';

export default function App() {
  const path = window.location.pathname;
  const slotMatch = path.match(/\/slot-booking\/([^/]+)/);

  if (slotMatch) {
    return <PublicBookingPage bookingId={slotMatch[1]} />;
  }

  return <CalendarShell />;
}
