// B"H
/**
 * SimulationPulsePolicy
 *
 * The Simulation Layer decides cadence without knowing NPCs, vendors, UI, or
 * THREE. Budgeted frames remain tiny; full pulses may do story/economy work;
 * direct actions persist immediately.
 */
export const PULSE_KIND = Object.freeze({ FRAME:'frame', FULL:'full', DIRECT:'direct', IDLE:'idle' });
export function pulsePolicy(options = {}, tick = 0) {
  const budgeted = Boolean(options.budgeted || options.kind === PULSE_KIND.FRAME);
  const direct = Boolean(options.direct || options.kind === PULSE_KIND.DIRECT);
  const full = !budgeted || options.kind === PULSE_KIND.FULL;
  return {
    tick,
    budgeted,
    direct,
    full,
    emit:options.emit !== false,
    persist:direct || (!budgeted && options.persist !== false),
    shouldRunEvery(rate = 1) { return !budgeted || rate <= 1 || tick % rate === 0; },
    shouldRunStory() { return !budgeted; },
    shouldRunEconomy() { return !budgeted; },
    shouldRunRumors() { return !budgeted; },
    shouldPersist() { return direct || (!budgeted && options.persist !== false); }
  };
}
export function framePolicy(tick = 0) { return pulsePolicy({ kind:PULSE_KIND.FRAME, budgeted:true, persist:false, emit:false }, tick); }
export function directPolicy(tick = 0) { return pulsePolicy({ kind:PULSE_KIND.DIRECT, direct:true, persist:true, emit:true }, tick); }
export default { PULSE_KIND, pulsePolicy, framePolicy, directPolicy };
