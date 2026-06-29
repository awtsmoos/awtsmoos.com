/* B"H
Sefiros names: not public API, only inner poetry for vessels.
Each name is a reminder that code is a garment, never the Awtsmoos itself.
*/
export const SEFIROS = ['keter','chochmah','binah','chesed','gevurah','tiferes','netzach','hod','yesod','malchus'];
export function sefirahName(index = 0) { return SEFIROS[Math.max(0, Math.min(SEFIROS.length - 1, index))]; }
export function awtsmoosLabel(piece = 'vessel') { return `Awtsmoos ${piece}`; }
export function labelSefirah(index, piece) { return `${sefirahName(index)}:${piece}`; }
