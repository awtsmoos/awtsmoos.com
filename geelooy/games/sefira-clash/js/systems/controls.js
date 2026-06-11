import { createInput } from '../controls/input.js';
export function startControls(doc){ const i=createInput(doc); return {snapshot:i.read}; }
