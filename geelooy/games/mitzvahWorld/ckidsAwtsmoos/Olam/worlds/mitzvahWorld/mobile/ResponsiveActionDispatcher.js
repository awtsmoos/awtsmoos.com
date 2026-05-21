/**
 * B"H
 * @file ResponsiveActionDispatcher.js
 *
 * Chapter 16: One Action, Two Hands.
 *
 * Touch, click, and keyboard are only garments. This dispatcher turns mobile
 * and desktop input into one small stream of gameplay intentions, while still
 * honoring older normalize/target dispatch callers already walking the street.
 */

import { RESPONSIVE_INPUT_CONTRACT } from '../data/mobile/ResponsiveContracts.js';

const DIRECT_ACTIONS = Object.freeze({
  KeyI: 'openInventory',
  inventoryButton: 'openInventory',
  inventoryTap: 'openInventory',
  KeyC: 'openChumashReader',
  chumashButton: 'openChumashReader',
  openChumash: 'openChumashReader',
  KeyT: 'openTorahDebate',
  debateButton: 'openTorahDebate',
  openDebate: 'openTorahDebate'
});

export class ResponsiveActionDispatcher {
  constructor({ contract = RESPONSIVE_INPUT_CONTRACT } = {}) {
    this.contract = contract;
  }

  detectDevice(width = 1024, hasTouch = false) {
    return hasTouch || width <= 820 ? 'mobile' : 'desktop';
  }

  normalize(input = {}, context = {}) {
    const device = input.device || context.device || this.detectDevice(context.width, context.hasTouch);
    const map = this.contract[device] || this.contract.desktop;
    const code = input.code || input.key || input.type || input;

    if (map.activate.includes(code)) return { device, action: 'activate' };

    const slot = input.slot ?? this.resolveActionSlot(code, device);
    if (slot !== null && slot !== undefined) return { device, action: 'actionBar', slot: Number(slot) };

    const action = DIRECT_ACTIONS[code];
    return action ? { device, action } : { device, action: 'unknown', raw: code };
  }

  dispatch(input = {}, target = null, context = {}) {
    const normalized = this.normalize(input, context);
    if (!target) {
      const result = { action: normalized.action, source: normalized.device };
      if (normalized.slot !== undefined) result.slot = normalized.slot;
      if (normalized.action === 'unknown') result.code = normalized.raw;
      return result;
    }

    const method = normalized.action === 'actionBar'
      ? target.actionBar || target.activateActionSlot
      : target[normalized.action];

    if (typeof method === 'function') {
      normalized.action === 'actionBar'
        ? method.call(target, normalized.slot, normalized)
        : method.call(target, normalized);
    }

    return normalized;
  }

  resolveActionSlot(code, device = 'desktop') {
    if (device === 'mobile') {
      if (code === 'touchSlot' || code === 'longPressSlot') return 0;
      const touch = /^touchSlot:?(\d+)$/.exec(code || '');
      if (!touch) return null;
      const slot = Number(touch[1]);
      return slot >= 0 && slot < 6 ? slot : null;
    }

    const key = /^Digit([1-6])$/.exec(code || '');
    return key ? Number(key[1]) - 1 : null;
  }
}

export default ResponsiveActionDispatcher;
