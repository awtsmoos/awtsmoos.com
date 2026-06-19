
// B"H
/**
 * @file Vision50_FlatGeometryMouths.js
 * @brief THE FIFTY GATES OF PURE FLAT GEOMETRY (Nun Sha'arei Tzurah Pshuta).
 * 
 * THE POEM OF THE FAT VECTOR:
 * No shadows to hide in, no gradients to fade,
 * Just solid, thick lines that the Awtsmoos has made!
 * The teeth are like nuggets, bold, white, and distinct,
 * The hair hugs the skull, mathematically linked.
 * A lonely walk down the concrete terrain,
 * Erasing the choppiness, banishing pain.
 * Pure flat geometry, fat vectors, solid hues,
 * Rebuilding the world completely anew!
 * 
 * --- BRAINSTORM: FIXING MOUTHS, FACES, AND MOVEMENT WITHOUT BLURS/SHADOWS ---
 * 
 * THE MOUTH & TEETH ("Nugget" Realism)
 * 1.  THE CLIPPING REVELATION: Teeth disappeared because their Y-coordinates were outside the `lipPoints` clipping mask! The upper teeth MUST start exactly at the dynamic `lipPoints[1].y` to be visible.
 * 2.  CHUNKY "NUGGET" TEETH: Teeth will not be tiny rectangles. They will be massive, bold white polygons with thick black separation lines (2px-3px) so they are aggressively visible on every spoken word.
 * 3.  ABSOLUTE FLAT ABYSS: The inner mouth cavity is 3 distinct, solid flat ellipses: #2a0008 (Outer), #140003 (Mid), #000000 (Void). No rgba or soft shading.
 * 4.  BUTTERY SMOOTH LERPING: `MouthMorpher` friction set to 0.18. Instead of snappy robot mouths, the points drag through space fluidly, connecting syllables organically.
 * 5.  EXAGGERATED OPENINGS: The 'A', 'E', and 'smile' visemes will physically rip the mouth open vertically and horizontally, guaranteeing the chunky teeth are displayed.
 * 6.  TONGUE SOLIDITY: A bright, flat pink polygon (`#ff4d79`) anchored exactly to the bottom lip point (`lipPoints[3].y`), pushing up aggressively for 'L' and 'T'.
 * 7.  MANDIBLE RISING: The lower teeth are anchored exactly to the bottom lip. As the jaw drops, the teeth follow the lip boundary perfectly.
 * 8.  FRICTION LIP-BITE: For 'F'/'V', the upper teeth draw *over* the bottom lip, clipping the flesh path dynamically to create a true overbite.
 * 
 * THE HAIR (Perfect Skull Alignment)
 * 9.  SKULL SYNCHRONIZATION: The skull's top dome is defined exactly by: `c1y: -h.rY * 1.35`. The hair's bottom arch MUST use this exact curve or an offset to ensure it never bleeds onto the forehead or floats above it.
 * 10. FOREHEAD PRESERVATION: Hair begins exactly at `y: -h.rY * 0.45` (upper forehead). It never drops to `y: 0`, which caused it to override the eyes.
 * 11. NO BLOBS, ONLY FAT VECTORS: All hairstyles (Spiky, Curly, Swoop) are built using `G.path` with `lineWidth: 5`, solid colors, and bold black outlines.
 * 
 * THE ENVIRONMENT & CINEMATOGRAPHY
 * 12. THE LONELY SIDEWALK: A stark grey polygon (`#555555`) splitting the park grass and the black asphalt road.
 * 13. INTENSE CAMERA CUTS: The Director will snap between extreme close-ups, wide isolating tracking shots, and dramatic dutch-angles to invoke intense emotion.
 * 14. PURE SOLID HEAVENS: Sky colors are solid hex codes. Zero linear gradients to maximize rendering speed and maintain the "flat" art style.
 * 15. ZERO AMBIENT SHADOWS: The `CutoutShader` drop-shadows are disabled. Depth is achieved entirely through Z-indexing, scaling, and overlapping bold outlines.
 * 
 * THE WALK CYCLE (Hyper-Realistic Swagger)
 * 16. HEAVY HEEL STRIKE: The body (`bob`) plunges deeply on the down-step, holding the squash for a fraction of a second before extending up.
 * 17. FLUID LIMB LAG: Arms swing aggressively but follow a phase-offset sine wave, lagging behind the chest movement for true biological weight.
 */
export const Vision50_FlatGeometryMouths = {
  manifest: () => console.log('B"H - The 50 Gates of Flat Geometry are declared.')
};
