import React from 'react';
import { SLOT_STATUS } from '../../constants/bookingConstants';

/**
 * Displays remaining seats with colour-coded status.
 *
 * Props:
 *  seatsLeft   — number | null  (null = no capacity limit / one-to-one)
 *  capacity    — number
 *  status      — SLOT_STATUS value
 *  compact     — bool (smaller pill variant for slot grid)
 */
export default function SeatBadge({ seatsLeft, capacity, status, compact = false }) {
  if (seatsLeft == null) return null;

  const config = {
    [SLOT_STATUS.AVAILABLE]:      { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
    [SLOT_STATUS.FEW_SEATS_LEFT]: { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
    [SLOT_STATUS.FULL]:           { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
    [SLOT_STATUS.OUTSIDE_WINDOW]: { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400'   },
  }[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {status === SLOT_STATUS.FULL ? 'Full' : `${seatsLeft} left`}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${config.bg} ${config.text}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      <span>
        {status === SLOT_STATUS.FULL
          ? 'No seats available'
          : `${seatsLeft} of ${capacity} seats available`}
      </span>
    </div>
  );
}
