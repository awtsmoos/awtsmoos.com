/**
 * B"H
 * @file ResponsiveActionDispatcher.js
 *
 * Chapter 15: One Action Wearing Two Garments.
 *
 * A tap and a keypress are different garments over one will. This dispatcher
 * normalizes touch, mouse, and keyboard hints into stable action names that UI,
 * inventory, doors, NPCs, and Torah debate can consume.
 */

import { RESPONSIVE_INPUT_CONTRACT } from '../data/mobile/ResponsiveContracts.js';

export class ResponsiveActionDispatcher {
  constructor(contract = RESPONSIVE_INPUT_CONTRACT) {
    this.contract = contract;
  }

  detectDevice(width = 1024, hasTouch = false) {
    return hasTouch || width <= 820 ? 'mobile' : 'desktop';
  }

  normalize(input, context = {}) {
    const device = context.device || this.detectDevice(context.width, context.hasTouch);
    const profile = this.contract[device];
    const value = input?.code || input?.key || input?.type || input;

    if (profile.activate.includes(value)) return { device, action: 'activate' };
    if (profile.actionBar.includes(value)) return { device, action: 'actionBar', slot: this.slotFrom(value) };
    if (profile.movement.includes(value)) return { device, action: 'movement', control: value };

    return { device, action: 'unknown', raw: value };
  }

  slotFrom(value) {
    if (typeof value === 'string' && value.startsWith('Digit')) return Number(value.slice(5)) - 1;
    if (value === 'touchSlot' || value === 'longPressSlot') return null;
    return null;
  }

  dispatch(input, target, context = {}) {
    const normalized = this.normalize(input, context);
    if (normalized.action === 'activate') target?.activate?.(normalized);
    if (normalized.action === 'actionBar') target?.activateActionSlot?.(normalized.slot, normalized);
    if (normalized.action === 'movement') target?.moveByResponsiveInput?.(normalized);
    return normalized;
  }
}

export default ResponsiveActionDispatcher;
