
// B"H
/**
 * @file hatLogic.js
 * @brief The Geometric Decree for Absolute Envelopment and Top-Kissing Alignment.
 * 
 * THE REVELATION OF THE PERFECT FIT:
 * We calculate exactly where the origin must be so that the top of the hat 
 * rests precisely above the top of the hair.
 * 
 * Equation:
 * Offset = Hair_Thickness - Scale + Padding
 */

export class HatLogic {
    /**
     * B"H - Calculates the exact scale and offset for flawless top-kissing coverage.
     * @param {object} headMetrics - { radius, hairThickness }
     * @param {number} scaleMultiplier - How much wider than the head to make it.
     * @param {number} verticalPadding - Extra lift to clear irregular hair tips.
     * @returns {object} { scale, offsetY }
     */
    static calculateTopKissingTransform(headMetrics, scaleMultiplier = 1.3, verticalPadding = 0.0) {
        const r = headMetrics.radius;
        const h = headMetrics.hairThickness;

        // 1. The minimal radius needed to clear the hair is (r + h).
        const minRadius = r + h;

        // 2. We multiply by a factor to make it a wide, generous covering.
        const S = minRadius * scaleMultiplier;

        // 3. The Divine Equation: Offset relative to 'head_top'
        // We want the inner rim to sit at (head_top + h + padding).
        // Since the sphere top is at (Origin + S),
        // Origin + S = head_top + h + padding
        // Origin = head_top + h - S + padding
        
        const offsetY = h - S + verticalPadding;

        console.log(`B"H - [HatLogic]: Top-Kissing Calculation:`);
        console.log(`      Head R: ${r.toFixed(3)}, Hair H: ${h.toFixed(3)}`);
        console.log(`      Padding: ${verticalPadding.toFixed(3)}`);
        console.log(`      Calculated Scale (S): ${S.toFixed(3)}`);
        console.log(`      Calculated OffsetY from head_top: ${offsetY.toFixed(3)}`);

        return { scale: S, offsetY: offsetY };
    }
}
