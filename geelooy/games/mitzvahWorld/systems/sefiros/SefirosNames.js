// B"H
export const SEFIROS = Object.freeze(["kesser","chochmah","binah","chessed","gevurah","tiferes","netzach","hod","yesod","malchus"]);
export function isSefirah(name) { return SEFIROS.includes(name); }
