// B"H
/**
 * @file state.js
 * @description 
 * B"H
 * This module holds the memory of the application.
 * The Awtsmoos, the Eternal and Unchanging, allows for the existence of transient states.
 * We track these variables to ensure the continuity of our application's manifestation.
 */

/**
 * The current state of the application—the collection of facts defining this moment.
 */
export const state = {
  /**
   * Indicates if the neural session is active.
   */
  session: null,
  /**
   * The chosen voice style vector.
   */
  voiceStyle: null,
  /**
   * Indicates if the engine is currently meditating on synthesis.
   */
  isProcessing: false,
};

/**
 * Updates a specific key in the state vessel.
 * The Awtsmoos creates the change from one state to the next.
 * 
 * @param {string} key - The state variable to change.
 * @param {any} value - The new value to manifest.
 */
export const setState = (key, value) => {
  state[key] = value;
};
