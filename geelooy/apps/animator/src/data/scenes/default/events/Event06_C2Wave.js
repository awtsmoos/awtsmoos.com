
// B"H
/**
 * @file Event06_C2Wave.js
 * @description Elevates the arm into the greeting cycle.
 */
export const Event06_C2Wave = { 
  type: 'action', 
  actor: 'c2', 
  actions: [
    { at: 0, key: 'isWaving', value: true }
  ], 
  duration: 100 
};
