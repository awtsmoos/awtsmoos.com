// B"H
import { AdaptiveRenderer } from '../render/workerRenderer.js';

/**
 * Public renderer gate for Sulam HaSod.
 *
 * Chapter 7: The Awtsmoos hid the fork in one small doorway. Callers still ask
 * for `Renderer` exactly as before; behind the name, a worker may paint with an
 * OffscreenCanvas, or the faithful main-thread painter may carry the frame when
 * the browser lacks the vessel.
 */
export class Renderer extends AdaptiveRenderer {}
