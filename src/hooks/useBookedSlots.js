import { useState, useCallback, useTransition } from 'react';
import {
  getBookedSlots,
  addAttendeeToSlot,
  removeAttendeeFromSlot,
  cancelSlot as cancelSlotApi,
  promoteFromWaitlist as promoteApi,
} from '../api/slotBookingApi';
import { resolveError } from './useSlotBooking';

/**
 * Manages the organizer's booked-slots view for a single booking page.
 */
export function useBookedSlots(bookingId) {
  const [slots, setSlots] = useState({});      // { "2026-03-24": [{ time, eveId, attendees, seat }] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const fetchSlots = useCallback(async (startDate, endDate) => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBookedSlots({ bookingId, startDate, endDate });
      setSlots(res.slots ?? {});
    } catch (err) {
      setError(resolveError(err));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const addAttendee = useCallback((eventId, attendee) => {
    startTransition(async () => {
      try {
        await addAttendeeToSlot(bookingId, eventId, attendee);
        // Refresh to get updated seat count
        await fetchSlots();
      } catch (err) {
        setError(resolveError(err));
      }
    });
  }, [bookingId, fetchSlots]);

  const removeAttendee = useCallback((eventId, email) => {
    startTransition(async () => {
      try {
        await removeAttendeeFromSlot(bookingId, eventId, email);
        await fetchSlots();
      } catch (err) {
        setError(resolveError(err));
      }
    });
  }, [bookingId, fetchSlots]);

  const cancelBookedSlot = useCallback((eventId) => {
    startTransition(async () => {
      try {
        await cancelSlotApi(bookingId, eventId);
        await fetchSlots();
      } catch (err) {
        setError(resolveError(err));
      }
    });
  }, [bookingId, fetchSlots]);

  const promoteFromWaitlist = useCallback((eventId, email) => {
    startTransition(async () => {
      try {
        await promoteApi(bookingId, eventId, email);
        await fetchSlots();
      } catch (err) {
        setError(resolveError(err));
      }
    });
  }, [bookingId, fetchSlots]);

  return {
    slots,
    loading,
    error,
    isPending,
    fetchSlots,
    addAttendee,
    removeAttendee,
    cancelBookedSlot,
    promoteFromWaitlist,
    clearError: () => setError(null),
  };
}
