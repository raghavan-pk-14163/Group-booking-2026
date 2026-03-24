import React, { useEffect, useState } from 'react';
import BookingPageCard from './BookingPageCard';
import BookingPageSetup from '../BookingPageSetup/BookingPageSetup';
import BookedSlotsView from '../BookedSlotsView/BookedSlotsView';
import Spinner from '../shared/Spinner';
import ErrorBanner from '../shared/ErrorBanner';
import { useSlotBookingList } from '../../hooks/useSlotBooking';

/**
 * Right-side "Appointment Booking" panel — top-level orchestrator.
 * Manages which dialog/view is open and routes actions to the correct handlers.
 */
export default function AppointmentBookingPanel({ userCalendars = [] }) {
  const {
    bookings,
    loading,
    error,
    fetchBookings,
    saveBooking,
    removeBooking,
    duplicateBooking,
    clearError,
  } = useSlotBookingList();

  const [dialog, setDialog] = useState(null);
  // dialog: null | { type: 'create' } | { type: 'edit', booking } | { type: 'slots', booking }

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  async function handleSave(payload) {
    const id = dialog?.booking?.id ?? null;
    await saveBooking(payload, id);
    setDialog(null);
  }

  function handleEdit(booking) {
    setDialog({
      type: 'edit',
      booking: {
        ...booking,
        _isEdit: true,
        // Map API response back to form shape
        meetingType:      booking.conference?.[0] ?? 'none',
        conferenceType:   booking.conference_type ?? 'audio',
        duration:         booking.slotDuration ?? 30,
        dateRange: {
          start: msToDateInput(booking.startDate),
          end:   msToDateInput(booking.endDate),
        },
        availableHours:       booking.availableHours ?? {},
        checkAvailabilityFrom: booking.checkAvailabilityFrom ?? [],
      },
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Appointment Booking</h2>
        <button
          type="button"
          onClick={() => setDialog({ type: 'create' })}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Create booking page
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pt-3">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && bookings.length === 0 && (
          <div className="flex justify-center pt-8">
            <Spinner size={24} className="text-blue-500" />
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-12 text-center text-sm text-gray-400 gap-2">
            <span className="text-4xl">📅</span>
            <p>No booking pages yet.</p>
            <p>Create one to get started.</p>
          </div>
        )}

        {bookings.map(booking => (
          <BookingPageCard
            key={booking.id}
            booking={booking}
            onOpen={() => window.open(booking.slotBookingLink, '_blank')}
            onEdit={() => handleEdit(booking)}
            onShare={() => {/* open share panel */}}
            onDuplicate={() => duplicateBooking(booking)}
            onDelete={() => {
              if (confirm(`Delete "${booking.title}"?`)) removeBooking(booking.id);
            }}
            onViewSlots={() => setDialog({ type: 'slots', booking })}
          />
        ))}
      </div>

      {/* Dialogs */}
      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <BookingPageSetup
          initialValues={dialog.booking ?? null}
          onSave={handleSave}
          onCancel={() => setDialog(null)}
          userCalendars={userCalendars}
        />
      )}

      {dialog?.type === 'slots' && (
        <BookedSlotsView
          booking={dialog.booking}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

function msToDateInput(ms) {
  if (!ms) return '';
  return new Date(ms).toISOString().slice(0, 10);
}
