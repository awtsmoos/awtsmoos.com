/* B"H
MIDI is the bridge where outside keys whisper velocity into the browser vessel.
*/
export async function initMidi({ onNoteOn, onNoteOff, onPedal }) {
    if (!navigator.requestMIDIAccess) return { ok: false, reason: 'Web MIDI unavailable' };
    const access = await navigator.requestMIDIAccess();
    access.inputs.forEach(input => input.onmidimessage = event => handleMidi(event.data, { onNoteOn, onNoteOff, onPedal }));
    access.onstatechange = () => access.inputs.forEach(input => input.onmidimessage = event => handleMidi(event.data, { onNoteOn, onNoteOff, onPedal }));
    return { ok: true, access };
}
function handleMidi([status, note, value], handlers) {
    const cmd = status & 0xf0;
    if (cmd === 0x90 && value > 0) handlers.onNoteOn?.(midiToName(note), value / 127, note);
    else if (cmd === 0x80 || (cmd === 0x90 && value === 0)) handlers.onNoteOff?.(midiToName(note), note);
    else if (cmd === 0xb0 && note === 64) handlers.onPedal?.(value >= 64);
}
function midiToName(n) { const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']; return names[n%12] + (Math.floor(n/12)-1); }
