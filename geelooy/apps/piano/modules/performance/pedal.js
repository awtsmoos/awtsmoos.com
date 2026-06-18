/* B"H
The sustain pedal is mercy with a broom: it lets notes linger, then releases every remembered vessel.
*/
export const pedalState = { sustain: false, heldReleases: new Map() };
export function setSustainPedal(down, activeNotes, stopSynth) {
    pedalState.sustain = !!down;
    if (pedalState.sustain) return;
    flushDeferred(activeNotes, stopSynth);
}
export function deferRelease(inputId, activeNote) {
    if (!pedalState.sustain) return false;
    pedalState.heldReleases.set(inputId, activeNote);
    return true;
}
export function clearDeferred(inputId) { pedalState.heldReleases.delete(inputId); }
export function clearAllDeferred() { pedalState.heldReleases.clear(); pedalState.sustain = false; }
function flushDeferred(activeNotes, stopSynth) {
    pedalState.heldReleases.forEach((note, id) => { if (!activeNotes.has(id)) stopSynth(note.synthNodes); });
    pedalState.heldReleases.clear();
}
