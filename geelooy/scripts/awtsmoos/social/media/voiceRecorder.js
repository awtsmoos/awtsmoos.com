// B"H
/**
 * @module VoiceRecorder
 * @description
 * Chapter 478: The browser records breath, then the alias vault receives it as
 * audio. This module is tiny and optional; unsupported browsers fail softly.
 */

import { uploadAssetFile } from './assetUploader.js';

export async function recordVoiceAsset({ aliasId, state, target = {}, mimeType = 'audio/webm' } = {}) {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Voice recording is not supported here');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];
  recorder.addEventListener('dataavailable', event => event.data?.size && chunks.push(event.data));
  recorder.start();
  return {
    stop: () => new Promise((resolve, reject) => {
      recorder.addEventListener('stop', async () => {
        try {
          stream.getTracks().forEach(track => track.stop());
          const blob = new Blob(chunks, { type: mimeType });
          const file = new File([blob], `voice-${Date.now()}.webm`, { type: mimeType });
          const asset = await uploadAssetFile({ aliasId, file, attachKind: 'comment', ...target });
          state?.add?.(asset);
          resolve(asset);
        } catch (error) { reject(error); }
      }, { once: true });
      recorder.stop();
    })
  };
}
