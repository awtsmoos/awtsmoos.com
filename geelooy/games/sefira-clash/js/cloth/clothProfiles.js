/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function clothProfile(c={}){const kind=c.kind||'tunic';return{kind,points:kind==='capelet'?4:kind==='robe'?5:kind==='strips'?3:2,drag:kind==='scarf'?.82:.74,gravity:kind==='robe'?1.4:.8,length:kind==='robe'?34:kind==='scarf'?42:24}}
