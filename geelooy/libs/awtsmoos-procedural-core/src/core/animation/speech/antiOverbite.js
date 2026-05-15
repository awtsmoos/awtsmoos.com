
// B"H
/**
 * @file antiOverbite.js
 * @brief
 *   THE TIKKUN OF THE OVERBITE — Corrective Logic Module
 *   ======================================================
 *   When the jaw drops wide open, the upper lip must NOT simultaneously
 *   press downward (mouth_close_upper). That creates an anatomically
 *   impossible overlap where the upper lip eclipses the open cavity —
 *   a "spiritual overbite" where the giver blocks the receiver.
 *
 *   In Kabbalah, Chesed (giving, upper) must yield when Malchus (receiving,
 *   lower) expands into its full expression. This module enforces that decree.
 *
 *   RULE:
 *   If mouth_drop > DROP_THRESHOLD, suppress upper-closing keys
 *   proportionally, and boost lower_lip_pout to fill the visible gap
 *   with organic flesh rather than empty void.
 *
 * @module antiOverbite
 */

/** Drop weight above which suppression begins. */
const DROP_THRESHOLD = 0.25;

/** Minimum residual weight for suppressed keys (never fully zero). */
const MIN_RESIDUAL = 0.04;

/**
 * @function applyAntiOverbite
 * @description
 *   Mutates the `curW` weight map in-place to prevent anatomical overbite.
 *   Called every frame after the lerp pass, before writing to ShapeKeySystem.
 *
 * @param {Object.<string,number>} curW - Current interpolated weights (mutated in place).
 * @returns {void}
 */
export function applyAntiOverbite(curW) {
    const drop = curW['mouth_drop'] || 0;
    if (drop <= DROP_THRESHOLD) return;

    // How far PAST the threshold are we? 0 → 1 range.
    const excess = Math.min(1.0, (drop - DROP_THRESHOLD) / (1.0 - DROP_THRESHOLD));

    // Suppression factor: 1.0 at threshold, MIN_RESIDUAL at full drop.
    const suppress = Math.max(MIN_RESIDUAL, 1.0 - excess * (1.0 - MIN_RESIDUAL));

    curW['mouth_close_upper'] = (curW['mouth_close_upper'] || 0) * suppress;
    curW['lip_compress']      = (curW['lip_compress']      || 0) * suppress;
    curW['lip_roll_in']       = (curW['lip_roll_in']       || 0) * suppress;

    // Dynamic pout boost: lower lip fills the open gap organically
    const poutBoost = drop * 0.32;
    curW['lower_lip_pout'] = Math.max(curW['lower_lip_pout'] || 0, poutBoost);
}
