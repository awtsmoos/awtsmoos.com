/* B"H
Macros are small kings: one gesture bends many rivers at once.
*/
export const MACROS = {
    dream: { reverb: .82, chorus: .62, filter: .85, fm: .72 },
    glass: { reverb: .58, chorus: .42, filter: 1.15, fm: 1.25 },
    dark: { reverb: .46, chorus: .24, filter: .52, fm: .55 },
    huge: { reverb: .9, chorus: .75, filter: .95, fm: .9 }
};
export function applyMacroToPreset(preset, id) {
    const m = MACROS[id] || MACROS.dream;
    return { ...preset, reverbSend: m.reverb, chorusSend: m.chorus, filterCutoff: preset.filterCutoff * m.filter, fmIndex: preset.fmIndex * m.fm };
}
