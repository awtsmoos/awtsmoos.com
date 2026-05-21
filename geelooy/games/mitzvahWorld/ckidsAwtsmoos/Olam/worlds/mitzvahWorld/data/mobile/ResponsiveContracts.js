/**
 * B"H
 * Chapter 10: Two Hands On One Vessel.
 *
 * The Awtsmoos makes one world walk through thumb and keyboard alike. Mobile
 * receives tap, swipe, safe-area, and large controls; desktop receives keys,
 * pointer precision, and wide HUD panels. Same action names, different limbs.
 */

export const RESPONSIVE_INPUT_CONTRACT = Object.freeze({
  mobile: Object.freeze({
    activate: ['tap', 'doubleTap'],
    actionBar: ['touchSlot', 'longPressSlot'],
    movement: ['virtualJoystick', 'swipeCamera'],
    safeArea: true,
    minTouchTargetPx: 44
  }),
  desktop: Object.freeze({
    activate: ['click', 'Enter', 'KeyE'],
    actionBar: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'],
    movement: ['WASD', 'ArrowKeys', 'mouseLook'],
    wideHud: true,
    pointerPrecision: true
  })
});

export const HUD_LAYOUT_CONTRACT = Object.freeze({
  actionBar: Object.freeze({ slots: 6, mobileDock: 'bottom-safe-area', desktopDock: 'bottom-center' }),
  inventory: Object.freeze({ mobileMode: 'drawer', desktopMode: 'panel' }),
  chumashReader: Object.freeze({ mobileMode: 'full-screen-sheet', desktopMode: 'right-panel' }),
  debate: Object.freeze({ mobileMode: 'stacked-cards', desktopMode: 'split-arena' })
});
