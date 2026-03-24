import React from 'react';
import { SLOT_STATUS, SLOT_STATUS_LABEL } from '../../constants/bookingConstants';

const STATUS_STYLES = {
  [SLOT_STATUS.AVAILABLE]:      'bg-green-100 text-green-700 border-green-200',
  [SLOT_STATUS.FEW_SEATS_LEFT]: 'bg-amber-100 text-amber-700 border-amber-200',
  [SLOT_STATUS.FULL]:           'bg-red-100   text-red-700   border-red-200',
  [SLOT_STATUS.OUTSIDE_WINDOW]: 'bg-gray-100  text-gray-500  border-gray-200',
};

/**
 * Small pill label for a slot's availability state.
 */
export default function SlotStatusPill({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[SLOT_STATUS.AVAILABLE];
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {SLOT_STATUS_LABEL[status] ?? status}
    </span>
  );
}
