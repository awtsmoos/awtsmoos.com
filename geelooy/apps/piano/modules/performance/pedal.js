/* B"H
The sustain pedal is patience: released fingers still sing until the foot opens the gate.
*/
export const pedalState = { sustain: false, heldReleases: new Map() };
export function setSustainPedal(down, activeNotes, stopSynth) {
    pedalState.sustain = !!down;
    if (pedalState.sustain) return;
    pedalState.heldReleases.forEach((note, id) => {
        if (!activeNotes.has(id)) stopSynth(note.synthNodes);
    });
    pedalState.heldReleases.clear();
}
export function deferRelease(inputId, activeNote) {
    if (!pedalState.sustain) return false;
    pedalState.heldReleases.set(inputId, activeNote);
    return true;
}
export function clearDeferred(inputId) { pedalState.heldReleases.delete(inputId); }
