// B"H
/**
 * @file emeraldCameraCue.js
 * @description Chapter 508: A camera cue is rendered as a short cinematic label
 * and stored for any active camera controller to consume.
 */
import { rememberEmeraldCameraCue } from './emeraldCameraState.js';
export function showEmeraldCameraCue(payload = {}) {
  const cue = rememberEmeraldCameraCue(payload.camera || {});
  document.getElementById('emerald-camera-cue')?.remove();
  const el = document.createElement('div');
  el.id = 'emerald-camera-cue';
  el.textContent = 'Emerald reveal camera ready';
  el.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:2147482600;background:rgba(0,0,0,.55);color:#ffe18a;border:1px solid #d8aa3d;border-radius:999px;padding:8px 16px;font:bold 13px Arial;pointer-events:none;';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
  return cue;
}
