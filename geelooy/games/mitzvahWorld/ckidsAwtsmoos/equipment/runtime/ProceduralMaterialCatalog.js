// B"H
/** @file ProceduralMaterialCatalog.js @description Materials are separate vessels: steel, brass, leather, wood, cloth, crystal, glow, engraving. */
const M=(id,group,color,props={})=>Object.freeze({id,group,color,metalness:props.metalness??0,roughness:props.roughness??.6,emissive:props.emissive||null,emissiveIntensity:props.emissiveIntensity||0,textureHint:props.textureHint||group,normalHint:props.normalHint||null,pattern:props.pattern||null});
export const PROCEDURAL_MATERIALS=Object.freeze({
  "silver-blade":M("silver-blade","blade",0xdde7ff,{metalness:.92,roughness:.22,textureHint:"brushed-steel",normalHint:"fine-edge"}),
  "bright-steel":M("bright-steel","blade",0xf2f7ff,{metalness:.95,roughness:.16,textureHint:"polished-steel",normalHint:"edge-ridge"}),
  "curved-steel":M("curved-steel","blade",0xe8eef8,{metalness:.9,roughness:.2,textureHint:"saber-polish"}),
  "heavy-silver":M("heavy-silver","blade",0xbec9d8,{metalness:.96,roughness:.25,textureHint:"heavy-forged-steel",normalHint:"hammered"}),
  "mitzvah-steel":M("mitzvah-steel","blade",0xf6f1d0,{metalness:.95,roughness:.18,emissive:0x443300,emissiveIntensity:.18,textureHint:"holy-damascus",pattern:"subtle-hebrew-lines"}),
  "silver-holy":M("silver-holy","blade",0xe8ffff,{metalness:.95,roughness:.12,emissive:0x88ddff,emissiveIntensity:.16,textureHint:"moonlit-steel"}),
  "holy-steel":M("holy-steel","blade",0xffffee,{metalness:.9,roughness:.18,emissive:0xffee88,emissiveIntensity:.28,textureHint:"light-steel"}),
  "gold-guard":M("gold-guard","guard",0xffcc55,{metalness:.82,roughness:.28,textureHint:"brass-polished"}),
  "copper":M("copper","guard",0xcc7744,{metalness:.75,roughness:.36,textureHint:"warm-copper"}),
  "iron-head":M("iron-head","head",0x777f88,{metalness:.88,roughness:.42,textureHint:"dark-iron",normalHint:"hammered"}),
  "leather-grip":M("leather-grip","grip",0x3a2116,{roughness:.82,textureHint:"wrapped-leather",normalHint:"wrap-ridges"}),
  "blue-wrap":M("blue-wrap","grip",0x223366,{roughness:.88,textureHint:"dyed-cloth-wrap"}),
  "cloth-wrap":M("cloth-wrap","cloth",0xd8d0b8,{roughness:.9,textureHint:"woven-cloth"}),
  "padded-cloth":M("padded-cloth","cloth",0xb9a88c,{roughness:.94,textureHint:"training-padding"}),
  "wood-grain":M("wood-grain","wood",0x775533,{roughness:.74,textureHint:"procedural-wood-grain",normalHint:"long-grain"}),
  "polished-wood":M("polished-wood","wood",0x8a5c33,{roughness:.48,textureHint:"polished-wood"}),
  "cedar-wood":M("cedar-wood","wood",0x91562c,{roughness:.58,textureHint:"cedar-rings",normalHint:"cedar-grain"}),
  "river-wood":M("river-wood","wood",0x5f6f55,{roughness:.52,textureHint:"water-smoothed-wood"}),
  "holy-wood":M("holy-wood","wood",0x8b6b3a,{roughness:.42,emissive:0x332200,emissiveIntensity:.1,textureHint:"oil-blessed-wood"}),
  "cedar-bow":M("cedar-bow","wood",0x8b5529,{roughness:.55,textureHint:"bent-cedar"}),
  "hebrew-cedar":M("hebrew-cedar","wood",0x9a6430,{roughness:.5,emissive:0x224477,emissiveIntensity:.12,textureHint:"letter-carved-cedar"}),
  "bow-string":M("bow-string","string",0xe8e0d0,{roughness:.7,textureHint:"twisted-string"}),
  "glow-string":M("glow-string","string",0x99ddff,{roughness:.3,emissive:0x66ccff,emissiveIntensity:.55,textureHint:"light-string"}),
  "spark-crystal":M("spark-crystal","crystal",0x88ccff,{roughness:.08,emissive:0x66bbff,emissiveIntensity:.7,textureHint:"faceted-crystal"}),
  "water-glow":M("water-glow","crystal",0x55ccff,{roughness:.06,emissive:0x33aaff,emissiveIntensity:.75,textureHint:"water-crystal"}),
  "ner-glow":M("ner-glow","flame",0xffcc66,{roughness:.18,emissive:0xffaa22,emissiveIntensity:.95,textureHint:"living-flame"}),
  "hebrew-glow":M("hebrew-glow","letter",0x99ddff,{roughness:.2,emissive:0x77ccff,emissiveIntensity:.9,textureHint:"glowing-hebrew-letter"}),
  "holy-engraving":M("holy-engraving","engraving",0xfff1a8,{metalness:.3,roughness:.25,emissive:0xffdd66,emissiveIntensity:.45,textureHint:"engraved-light"}),
  "tiny-engraving":M("tiny-engraving","engraving",0xffe9a0,{metalness:.2,roughness:.35,textureHint:"incised-lettering"}),
  "carving":M("carving","engraving",0x4c2f16,{roughness:.82,textureHint:"wood-carving"}),
  "warm-light":M("warm-light","crystal",0xffe0aa,{roughness:.15,emissive:0xffbb66,emissiveIntensity:.4,textureHint:"warm-orb"}),
  "river-stone":M("river-stone","stone",0x667077,{roughness:.88,textureHint:"smooth-river-stone"})
});
export function proceduralMaterial(id="wood-grain"){ return PROCEDURAL_MATERIALS[id]||M(id,"custom",0xffffff,{textureHint:id}); }
export function materialGroups(parts=[]){ return [...new Set(parts.map(p=>proceduralMaterial(p.material).group))]; }
export default PROCEDURAL_MATERIALS;
