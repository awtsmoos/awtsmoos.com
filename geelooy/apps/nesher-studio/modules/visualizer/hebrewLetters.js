/* B"H
Hebrew letters: sparks that ride the audio wave from alef to tav.
*/
export const HEBREW_LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת'];
export function hebrewAt(index, text = HEBREW_LETTERS.join('')) {
  const letters = [...(text || HEBREW_LETTERS.join(''))];
  return letters[((index % letters.length) + letters.length) % letters.length];
}
