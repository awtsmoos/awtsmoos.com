/**
 * B"H
 * Hit effect recipes.
 *
 * Chapter 212: effects become data, not chaos. A hit recipe says how many
 * sparks, glyphs, rings, and callouts an impact deserves.
 */
export function hitEffectRecipe(event) {
  const force = event.force || event.damage || 1;
  const huge = event.fullCharge || event.koDanger || force > 36;
  return {
    sparks: huge ? 18 : 10,
    glyphs: huge ? 5 : 2,
    rings: 1,
    callout: huge ? 'MAX' : event.rapid ? 'RAPID' : '',
    color: event.color || '#fff4a8'
  };
}
