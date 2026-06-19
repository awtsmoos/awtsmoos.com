// B"H
import { EventProcessorRegistry } from './EventProcessorRegistry.js';

/**
 * @file ActiveEventRouter.js
 * @description
 * Tiny active router from event type to processor.
 */
export class ActiveEventRouter {
  /**
   * Routes an active event.
   *
   * @param {Object} state - App state.
   * @param {Object} event - Event.
   * @param {number} progress - Progress.
   * @returns {void}
   */
  static route(state, event, progress) {
    const Processor = EventProcessorRegistry[event.type];

    if (!Processor || typeof Processor.process !== 'function') {
      return;
    }

    Processor.process(state, event, progress);
  }
}