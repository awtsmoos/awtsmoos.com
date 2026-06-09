#!/usr/bin/env node
/**
 * B"H
 * @file runtimeHookAudit.mjs
 * @description Chapter 525: The Emerald entry systems must be live runtime
 * hooks, not only manifest data. Camera cue storage and visible cue rendering
 * are audited across their split modules.
 */
import fs from 'node:fs';
const read = file => fs.readFileSync(file, 'utf8');
const files = {
  load: read('ckidsAwtsmoos/Olam/methods/loadNivrayim/index.js'),
  entryRuntime: read('ckidsAwtsmoos/Olam/methods/loadNivrayim/entryRuntime/entryRuntimeUiEvents.js'),
  fallbacks: read('ckidsAwtsmoos/Olam/worker/handlers/ui/fallbacks.js'),
  audio: read('ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldAudio/emeraldAudioMixer.js'),
  cameraCue: read('ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldCamera/emeraldCameraCue.js'),
  cameraState: read('ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldCamera/emeraldCameraState.js')
};
const details = {
  loadCallsRuntime: files.load.includes('applyEntryRuntime(this, nivrayim || {})'),
  emitsHudQuestPortrait: files.entryRuntime.includes('emeraldEntryHud') && files.entryRuntime.includes('emeraldQuestCard') && files.entryRuntime.includes('emeraldNpcPortrait'),
  emitsCameraAudio: files.entryRuntime.includes('emeraldCameraCue') && files.entryRuntime.includes('emeraldAmbientAudio'),
  fallbackHandlesCameraAudio: files.fallbacks.includes('handleEmeraldCameraFallback') && files.fallbacks.includes('handleEmeraldAudioFallback'),
  audioUsesWebAudio: files.audio.includes('ensureAudioContext') && files.audio.includes('startEmeraldAmbience'),
  cameraStoresCue: files.cameraState.includes('__emeraldCameraCue') && files.cameraCue.includes('Emerald reveal camera ready')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
