/* B"H
 * DOM assembly: separate maps pour into one familiar `dom` export.
 * The old callers remain compatible while the inner palace is split.
 */
import { coreDom } from './dom/coreDom.js';
import { inspectorDom } from './dom/inspectorDom.js';
import { nleDom } from './dom/nleDom.js';
import { sourceDom } from './dom/sourceDom.js';
import { streamDom } from './dom/streamDom.js';

export const dom = { ...coreDom(), ...sourceDom(), ...streamDom(), ...inspectorDom(), ...nleDom() };
export const ctx = dom.stage.getContext('2d', { alpha:false });

export function setStatus(text) { dom.status.textContent = text; }

export function setStreamHealth({ state='Idle', session='—', frames=0, segments=0, uploaded=0, errors=0 } = {}) {
  dom.streamState.textContent = state; dom.streamSession.textContent = session || '—';
  dom.streamFrames.textContent = String(frames || 0); dom.streamSegments.textContent = String(segments || 0);
  dom.streamUploaded.textContent = formatBytes(uploaded || 0); dom.streamErrors.textContent = String(errors || 0);
}

export function setProviderUi(provider, summary) {
  dom.streamProviderName.textContent = provider.name; dom.providerNote.textContent = provider.note; dom.streamCodec.textContent = summary;
}

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}
