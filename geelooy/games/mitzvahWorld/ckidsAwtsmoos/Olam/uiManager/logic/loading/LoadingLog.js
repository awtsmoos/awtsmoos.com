// B"H
/** Loader log: several concise facts so users see what is happening. */
import { IDS } from './LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { state } from './LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { text } from './LoadingText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function record(line) {
  const clean = String(line || '').replace(/\s+/g, ' ').slice(0, 180);
  if (!clean || state.log[state.log.length - 1] === clean) return;
  state.log.push(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }) + '  ' + clean);
  state.log = state.log.slice(-5);
  text(IDS.log, state.log.join('\n'));
}
