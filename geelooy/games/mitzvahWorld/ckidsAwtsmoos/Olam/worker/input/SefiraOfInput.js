// B"H
/**
 * @file SefiraOfInput.js
 * @description
 * Chapter 28: UI touch vessels are sacred boundaries.
 *
 * The Awtsmoos separates world-drag from menu-touch. Inventory, bag, action
 * dock, context menu, equipment slots, and close buttons are all hard UI. Touch
 * on them must never become camera rotation or right-mouse gaze.
 */
export default class SefiraOfInput {
  /** Returns true when an element should capture touch/click for UI only. */
  static isUI(el) {
    if (!el || !el.closest) return false;
    const markers = [
      'button', 'a', 'input', 'select', 'textarea', '[role="button"]',
      '[awtsmoosClick]', '[data-awts-ui]', '[shaym="inventoryScreen"]',
      '#inventoryScreen', '.awtsmoosInventoryViewer', '.awtsmoosContextMenu',
      '#itemContextMenu', '.ctx-btn', '.inventory-slot', '.equipment-slot',
      '.slot', '.slots', '.actionSlot', '.bag-slot', '#actionBar',
      '.awtsmoosAction', '.compact-action-dock', '.dock-arrow', '.slotBtn',
      '.innerSlot', '.close', '.back-inv-btn', '#joystick-container',
      '#joystick-base', '#joystick-thumb', '.controller-button',
      '.awtsmoosBtn', '.mitzvahBtn', '.gameMenu', '.store-container',
      '.quest-log', '.characterDesigner'
    ];
    return !!el.closest(markers.join(', '));
  }

  /** Converts DOM events into worker-safe packets. */
  static cleanseEvent(e) {
    if (!e) return null;
    const packet = { type: e.type, timeStamp: e.timeStamp, isOverUI: this.isUI(e.target) };
    if (e.clientX !== undefined || (e.touches && e.touches.length)) {
      const src = (e.touches && e.touches.length) ? e.touches[0] : e;
      packet.clientX = src.clientX;
      packet.clientY = src.clientY;
      packet.pageX = src.pageX;
      packet.pageY = src.pageY;
      packet.button = e.button !== undefined ? e.button : 0;
      packet.movementX = e.movementX || 0;
      packet.movementY = e.movementY || 0;
    }
    if (e.code !== undefined) {
      packet.code = e.code;
      packet.key = e.key;
    }
    if (e.deltaY !== undefined) packet.deltaY = e.deltaY;
    return packet;
  }
}
