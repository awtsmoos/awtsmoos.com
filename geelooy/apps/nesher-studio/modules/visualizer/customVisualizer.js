/* B"H
Custom JS runner: local studio code may paint after presets, without breaking render.
*/
import { visualizerHelpers } from './visualizerHelpers.js';
export function runCustomVisualizer(ctx, source, frame) {
  const code = source.settings?.customJs?.trim(); if (!code) return false;
  const runtime = source.visualizerRuntime ||= {};
  try { if (runtime.customCode !== code) compile(runtime, code); runtime.customFn(ctx, source, frame, visualizerHelpers, source.settings); runtime.customError = ''; return true; }
  catch (e) { runtime.customError = e.message; return false; }
}
function compile(runtime, code) { runtime.customCode = code; runtime.customFn = new Function('ctx', 'source', 'frame', 'helpers', 'settings', `"use strict";
${code}`); }
