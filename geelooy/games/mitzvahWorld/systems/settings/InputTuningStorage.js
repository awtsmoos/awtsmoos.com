// B"H
import { normalizeInputTuning } from "./InputTuning.js";
const KEY = "awtsmoosJoystickSettings";
export function readInputTuning(win = globalThis.window) { try { return normalizeInputTuning(JSON.parse(win?.localStorage?.getItem?.(KEY) || "{}")); } catch { return normalizeInputTuning(); } }
export function writeInputTuning(value = {}, win = globalThis.window) { const next = normalizeInputTuning(value); try { win?.localStorage?.setItem?.(KEY, JSON.stringify(next)); } catch {} return next; }
export default readInputTuning;
