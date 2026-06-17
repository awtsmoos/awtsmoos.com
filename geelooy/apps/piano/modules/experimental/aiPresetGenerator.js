/* B"H
No remote prophet is invoked here; this local seed turns words into a first preset guess.
*/
export function generatePresetFromPrompt(prompt, base) { const p=prompt.toLowerCase(); return { ...base, label: `AI Seed: ${prompt.slice(0,32)}`, reverbSend: p.includes('ambient') ? .82 : base.reverbSend, filterCutoff: p.includes('dark')?base.filterCutoff*.55:base.filterCutoff, fmIndex: p.includes('glass')?base.fmIndex*1.35:base.fmIndex }; }
