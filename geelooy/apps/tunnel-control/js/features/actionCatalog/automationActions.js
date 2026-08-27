// B"H
import { action } from './action.js';

/** B"H: automation actions are explicit tools, never hidden side effects. */
export const AUTOMATION_ACTIONS = Object.freeze([
  action('commandBatch', 'Command batch', 'Run approved command batches.', 'Automation', ['advanced'], {}),
  action('browserDoctor', 'Browser doctor', 'Diagnose browser control.', 'Automation', ['browser'], {})
]);
