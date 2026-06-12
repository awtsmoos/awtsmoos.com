/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export function clothingArchetype(f){const kinds=['tunic','shortCoat','scarf','capelet','robe','strips'];const n=Math.abs(Math.round((f.dna?.hue||0)+(f.id?.length||0)))%kinds.length;const kind=f.human?'shortCoat':kinds[n];return{kind,sleeve:kind==='robe'?.85:.45,lower:kind==='robe'?1:.45,stripCount:kind==='strips'?3:1,colorShift:f.human?26:10,trim:f.human?'#fff7b5':'#ffffff66'}}
