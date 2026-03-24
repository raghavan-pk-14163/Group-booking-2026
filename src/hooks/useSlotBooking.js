import { useState, useCallback, useOptimistic, useTransition } from 'react';
import {
  createSlotBooking,
  updateSlotBooking,
  deleteSlotBooking,
  listSlotBookings,
  duplicateSlotBooking,
} from '../api/slotBookingApi';
import { ERROR_MESSAGE } from '../constants/bookingConstants';

/**
 * Manages the list of booking pages in the side panel.
 * Uses React 19 useOptimistic for instant UI feedback on delete/duplicate.
 */
export function useSlotBookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticBookings, applyOptimistic] = useOptimistic(
    bookings,
    (current, { action, id, data }) => {
      switch (action) {
        case 'delete':
          return current.filter(b => b.id !== id);
        case 'duplicate':
          return [...current, { ...data, id: `temp-${Date.now()}` }];
        default:
          return current;
      }
    }
  );

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSlotBookings();
      setBookings(res.bookings ?? []);
    } catch (err) {
      setError(resolveError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBooking = useCallback(async (payload, existingId = null) => {
    const res = existingId
      ? await updateSlotBooking(existingId, payload)
      : await createSlotBooking(payload);
    await fetchBookings();
    return res;
  }, [fetchBookings]);

  const removeBooking = useCallback((id) => {
    startTransition(async () => {
      applyOptimistic({ action: 'delete', id });
      try {
        await deleteSlotBooking(id);
        setBookings(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        setError(resolveError(err));
        await fetchBookings(); // revert
      }
    });
  }, [applyOptimistic, fetchBookings]);

  const duplicateBooking = useCallback((booking) => {
    startTransition(async () => {
      applyOptimistic({ action: 'duplicate', data: booking });
      try {
        await duplicateSlotBooking(booking.id);
        await fetchBookings();
      } catch (err) {
        setError(resolveError(err));
        await fetchBookings(); // revert
      }
    });
  }, [applyOptimistic, fetchBookings]);

  return {
    bookings: optimisticBookings,
    loading,
    error,
    isPending,
    fetchBookings,
    saveBooking,
    removeBooking,
    duplicateBooking,
    clearError: () => setError(null),
  };
}

// ─── Resolve error code → user-facing message ─────────────────────────────────
export function resolveError(err) {
  if (err?.code === 107 && err?.message?.includes('retry')) {
    return ERROR_MESSAGE.SLOT_LOCKED;
  }
  return ERROR_MESSAGE[err?.code] ?? err?.message ?? 'Something went wrong.';
}
