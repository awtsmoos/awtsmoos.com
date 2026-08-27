/* B"H
 * Recording UI: the red button speaks phase, elapsed time, frames, and failure instead of silence.
 * Tiny DOM vessels receive the living state without touching the sacred encoder guard.
 */
import { RECORDING_PHASE, refreshRecordingSession } from './RecordingSessionState.js';

export function updateRecordingUi(dom, state, note = '') {
  const session = refreshRecordingSession(state);
  const phase = label(session.phase), errors = session.errors?.length || 0;
  if (dom.recordPhase) dom.recordPhase.textContent = phase;
  if (dom.recordElapsed) dom.recordElapsed.textContent = formatElapsed(session.elapsedMs);
  if (dom.recordFrames) dom.recordFrames.textContent = String(session.frames || 0);
  if (dom.recordErrors) dom.recordErrors.textContent = String(errors);
  if (dom.recordNote) dom.recordNote.textContent = note || session.lastMessage || 'Manual recorder idle.';
  updateButton(dom.recordButton, session.phase);
  return session;
}

function updateButton(button, phase) {
  if (!button) return;
  button.disabled = phase === RECORDING_PHASE.STARTING || phase === RECORDING_PHASE.STOPPING;
  button.textContent = ({ starting:'Starting...', recording:'Stop Recording', stopping:'Finalizing...', failed:'Start Recording' })[phase] || 'Start Recording';
}

function label(phase) { return ({ idle:'Idle', starting:'Starting', recording:'Recording', stopping:'Finalizing', failed:'Failed' })[phase] || 'Idle'; }
function formatElapsed(ms = 0) { const total = Math.floor(ms / 1000), m = Math.floor(total / 60), s = total % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
