
// B"H
import { MagneticSnap } from '../../../features/snapping/MagneticSnap.js';
import { DragState } from './DragState.js';

/**
 * @file DragMath.js
 * @brief THE CALCULUS OF TIME (Cheshbon HaZman).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 13: THE MAGNETIC FIELD
 * ═══════════════════════════════════════════════════════════════
 * Converts physical mouse movement (pixels) back into spiritual 
 * time (milliseconds). It then invokes the MagneticSnap algorithm 
 * to ensure the clip locks onto grid lines or neighboring edges.
 * 
 * @class DragMath
 */
export class DragMath {
  static evaluate(clientX, core, state) {
    const pxDelta = clientX - DragState.startX;
    const initialPx = core.timeToPixels(DragState.eventData.start);
    const rawPx = initialPx + pxDelta;

    let rawMs = core.pixelsToTime(rawPx);
    if (rawMs < 0) rawMs = 0;

    const seq = state.get('activeSequence');
    const snappedMs = MagneticSnap.calculate(rawMs, seq, DragState.eventData.id, core.scaleFactor);
    const snappedPx = core.timeToPixels(snappedMs);

    return { snappedMs, snappedPx };
  }
}
