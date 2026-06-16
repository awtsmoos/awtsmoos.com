// B"H
/** @file CarcassPanelUI.js @description Pure view-model for educational carcass/kosher-processing UI. */
export function carcassPanelView(payload = {}) {
  const c = payload.carcass || null;
  return { type:"CarcassPanelUI", open:payload.open === true, blocked:Boolean(payload.blocked), reason:payload.reason || null, carcass:c ? { id:c.id, species:c.species, name:c.name, kosherSpecies:Boolean(c.kosherSpecies), requiresShechitaKnife:Boolean(c.requiresShechitaKnife), processed:Boolean(c.processed), outputs:c.outputs || [] } : null, choices:payload.choices || [], disclaimer:payload.disclaimer || "Educational gameplay only." };
}
export function craftingView(payload = {}) { return { type:"CraftingUI", ok:Boolean(payload.ok), recipe:payload.recipe || null, reason:payload.reason || null }; }
export default { carcassPanelView, craftingView };
