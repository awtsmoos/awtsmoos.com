/* B"H
The Awtsmoos lets one small desktop become a ladder of notes.
Every glyph is a vessel; every release returns the sound to silence.
*/
const printable = Array.from('`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?');
const named = ['Backspace','Insert','Home','PageUp','Delete','End','PageDown','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
export const DESKTOP_BINDING_KEYS = [...printable, ...named];
const namedSet = new Set(named);
const flats = { 'C#':'Db', 'D#':'Eb', 'F#':'Gb', 'G#':'Ab', 'A#':'Bb' };
export function bindingAt(index) { return DESKTOP_BINDING_KEYS[index] || ''; }
export function bindingLabel(key) { return key === 'Backspace' ? 'Bksp' : key; }
export function noteDisplayName(noteName) {
    const match = noteName.match(/^([A-G]#?)(\d+)$/); if (!match) return noteName;
    const [, note, octave] = match; return flats[note] ? `${note}${octave}/${flats[note]}${octave}` : noteName;
}
export function keyForEvent(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return '';
    if (e.key.length === 1 || namedSet.has(e.key)) return e.key;
    return '';
}
export function keyboardInputId(e) { return `kb-${e.code || e.key}`; }
export function boundNoteForKey(key, root = document) {
    const el = Array.from(root.querySelectorAll('.key[data-keyboard-binding]')).find(k => k.dataset.keyboardBinding === key);
    return el?.dataset.note || '';
}
export function keyElementForBinding(key, noteName, root = document) {
    return Array.from(root.querySelectorAll('.key')).find(k => k.dataset.note === noteName && k.dataset.keyboardBinding === key)
        || root.querySelector(`.key[data-note="${noteName}"]`);
}
