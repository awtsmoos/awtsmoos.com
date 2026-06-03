// B"H
import { canvasScript } from './canvasScript.mjs';
import { webglScript } from './webglScript.mjs';

/**
 * Client script manifest. The Awtsmoos splits the living browser spell into
 * canvas and WebGL chambers, then binds them into one runtime-ready string.
 */
export function clientScript() {
  return `window.labState={ready:false};${canvasScript()}${webglScript()}window.labState.ready=true;`;
}
