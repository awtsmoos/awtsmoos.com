// B"H
/** Touch packets carry real finger coordinates through the worker veil. */
import { UI_SELECTOR } from "./MobileTouchConstants.js";
export function point(touch) { return { clientX:touch.clientX, clientY:touch.clientY, pageX:touch.pageX, pageY:touch.pageY, x:touch.clientX, y:touch.clientY }; }
export function distance(a, b) { return Math.hypot((b.pageX || 0) - (a.pageX || 0), (b.pageY || 0) - (a.pageY || 0)); }
export function uiBlocked(touch) { return Boolean(touch?.target?.closest?.(UI_SELECTOR)); }
export function packet(touch, extra = {}) { return { ...point(touch), button:0, buttons:extra.up ? 0 : 1, pointerType:"touch", pointerId:touch.identifier, source:"mobile-real-touch", ...extra }; }
export function transmit(eved, type, payload = {}) { eved.postMessage({ [type]:{ ...payload, isTouch:true, touchEnabled:true } }); }
