// B"H
/**
 * @module RenderVoiceNote
 * @description
 * Chapter 475: The voice note is not merely an audio tag. It carries transcript,
 * source path, and the memory that speech too becomes part of the living graph.
 */

import { renderGallery } from './renderGallery.js';

function safe(value) {
  return String(value || '').replace(/[<>]/g, '').slice(0, 4000);
}

export function renderVoiceNote({ audioNoteText = '', assets = [] } = {}) {
  const transcript = audioNoteText ? `<p class="bh-social-voice-transcript">${safe(audioNoteText)}</p>` : '';
  const gallery = renderGallery(assets, 'Voice note media');
  if (!transcript && !gallery) return '';
  return `<section class="bh-social-voice-note"><strong>Voice note</strong>${gallery}${transcript}</section>`;
}
