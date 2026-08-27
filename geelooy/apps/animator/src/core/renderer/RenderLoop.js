// B"H
export { RenderLoop } from './pipeline/RenderLoop.js';

/**
 * @file RenderLoop.js
 * @description
 * Legacy render-loop entry point. It deliberately re-exports the authoritative
 * pipeline loop so the project has one heartbeat and no competing RAF vessel.
 */
