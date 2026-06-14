/**
 * B"H
 * Hero material converter.
 *
 * Chapter 190: flat color becomes suit material. The Awtsmoos separates shell,
 * accent, rim, shadow, and glint so the mockup's gloss can enter the game.
 */
export function heroMaterial(color) {
  return Object.freeze({
    accent: color,
    shell: 'rgba(2,3,7,1)',
    shellSoft: 'rgba(8,10,15,.98)',
    shadow: 'rgba(0,0,0,.88)',
    ink: 'rgba(0,0,0,.94)',
    glint: 'rgba(255,255,255,.76)',
    panel: 'rgba(255,255,255,.16)'
  });
}
