
// B"H
/**
 * @file Event02_C1Running.js
 * @description Initiates the walking cycle and camera perspective shifts for character 1.
 */
export const Event02_C1Running = { 
  type: 'action', 
  actor: 'c1', 
  actions: [
    { at: 0, key: 'isWalking', value: true },
    { at: 0, key: 'view', value: 'side' },
    { at: 1500, key: 'view', value: 'threeQuarter' },
    { at: 3000, key: 'view', value: 'front' }
  ], 
  duration: 4500 
};
