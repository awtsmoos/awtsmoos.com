
// B"H
/**
 * @file Event18_AllWave.js
 * @description An array of concurrent actions.
 */
export const Event18_AllWave = [
  { type: 'action', actor: 'c1', actions: [{ at: 0, key: 'isWalking', value: false }, { at: 0, key: 'isWaving', value: true }, { at: 0, key: 'view', value: 'front' }], duration: 2000 },
  { type: 'action', actor: 'c2', actions: [{ at: 0, key: 'isJumping', value: false }, { at: 0, key: 'isWaving', value: true }], duration: 2000 },
  { type: 'action', actor: 'c3', actions: [{ at: 0, key: 'isDancing', value: false }, { at: 0, key: 'isWaving', value: true }, { at: 0, key: 'view', value: 'front' }], duration: 2000 },
  { type: 'action', actor: 'c4', actions: [{ at: 0, key: 'isDancing', value: false }, { at: 0, key: 'isWaving', value: true }], duration: 2000 }
];
