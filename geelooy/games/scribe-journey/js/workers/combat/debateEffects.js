// B"H
// js/workers/combat/debateEffects.js

/**
 * Chapter 4: Debate is not merely damage. Every strike is a concept taking form:
 * fire, clarity, kindness, crown, and the small flash of a defeated distortion.
 */
export const DEBATE_EFFECTS = {
    damage: { type: 'particles', amount: 12, color: '#ff5555', className: 'fx-debate-damage' },
    crit: { type: 'particles', amount: 24, color: '#ffd166', className: 'fx-debate-crit' },
    heal: { type: 'particles', amount: 18, color: '#66ff99', className: 'fx-debate-heal' },
    holyFire: { type: 'particles', amount: 36, color: '#ff9f1c', className: 'fx-holy-fire' },
    bittulCrown: { type: 'particles', amount: 72, color: '#f7e7a1', className: 'fx-bittul-crown' },
    capture: { type: 'particles', amount: 28, color: '#ffff00', className: 'fx-capture-spark' }
};

/**
 * @param {keyof DEBATE_EFFECTS|string} name Named debate effect.
 * @param {object} [overrides] Local effect overrides.
 * @returns {object} UI effect payload.
 */
export function debateFx(name, overrides = {}) {
    return { ...(DEBATE_EFFECTS[name] || DEBATE_EFFECTS.damage), ...overrides };
}
