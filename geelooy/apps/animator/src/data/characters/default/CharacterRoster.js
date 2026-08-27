// B"H

/**
 * @file CharacterRoster.js
 * @description
 * ============================================================================
 * CHAPTER: THE PEOPLE WHO STOPPED BEING DUPLICATES
 * ============================================================================
 *
 * The default world needs separate humans with separate faces, separate hair,
 * separate clothing, separate colors, separate motion identities. This roster
 * is pure data. Renderers interpret it; they do not invent character identity.
 *
 * The Awtsmoos recreates each person every instant. Here each drawn vessel
 * receives its own name, face, hair, clothing, posture, and role.
 */

export const DEFAULT_CHARACTER_ROSTER = {
  c1_runner: {
    id: 'c1_runner',
    name: 'Ari Runner',
    archetype: 'human',
    style: 'believable_cartoon_human',
    faceProfile: 'narrow_focus',
    hairProfile: 'short_wave',
    clothingProfile: 'fitted_cardigan',
    position: { x: -430, y: 0, scale: 0.82 },
    view: 'side',
    flipX: false,
    emotion: 'focused',
    acting: 'run',
    isWalking: true,
    colors: {
      skin: '#efb486',
      hair: '#3a2116',
      hairDark: '#170c08',
      jacket: '#d44972',
      jacketDark: '#73213f',
      jacketLight: '#ff8aaa',
      pants: '#151927'
    }
  },

  c2_speaker: {
    id: 'c2_speaker',
    name: 'Mendel Speaker',
    archetype: 'human',
    style: 'believable_cartoon_human',
    faceProfile: 'oval_bright',
    hairProfile: 'neat_side_part',
    clothingProfile: 'blazer_modern',
    position: { x: -115, y: 0, scale: 0.84 },
    view: 'front',
    flipX: false,
    emotion: 'happy',
    acting: 'explain',
    colors: {
      skin: '#f0b184',
      hair: '#25130e',
      hairDark: '#120806',
      jacket: '#6f45c9',
      jacketDark: '#32195f',
      jacketLight: '#aa86f0',
      pants: '#171927'
    }
  },

  c3_thrower: {
    id: 'c3_thrower',
    name: 'Dovid Thrower',
    archetype: 'human',
    style: 'believable_cartoon_human',
    faceProfile: 'round_warm',
    hairProfile: 'swept_curls',
    clothingProfile: 'blazer_modern',
    position: { x: 170, y: 0, scale: 0.84 },
    view: 'threeQuarter',
    flipX: true,
    emotion: 'curious',
    acting: 'idle',
    colors: {
      skin: '#d99a72',
      hair: '#17100d',
      hairDark: '#080404',
      jacket: '#2f6fc2',
      jacketDark: '#12366a',
      jacketLight: '#6fa8ff',
      pants: '#182542'
    }
  },

  c4_catcher: {
    id: 'c4_catcher',
    name: 'Levi Catcher',
    archetype: 'human',
    style: 'believable_cartoon_human',
    faceProfile: 'oval_bright',
    hairProfile: 'short_wave',
    clothingProfile: 'fitted_cardigan',
    position: { x: 420, y: 0, scale: 0.84 },
    view: 'side',
    flipX: true,
    emotion: 'surprised',
    acting: 'wave',
    colors: {
      skin: '#bd7a59',
      hair: '#5a351e',
      hairDark: '#20120b',
      jacket: '#2f8f66',
      jacketDark: '#135238',
      jacketLight: '#7fe0aa',
      pants: '#1b2b24'
    }
  },

  c5_sage: {
    id: 'c5_sage',
    name: 'The Sage',
    archetype: 'sage',
    style: 'illustrated_sage',
    faceProfile: 'sage_long',
    hairProfile: 'sage_silver',
    clothingProfile: 'sage_robe',
    position: { x: -620, y: 0, scale: 0.78 },
    view: 'threeQuarter',
    flipX: false,
    emotion: 'calm',
    acting: 'thinker',
    colors: {
      skin: '#efc09a',
      hair: '#eee7dc',
      hairDark: '#bfb7aa',
      beard: '#eee7dc',
      beardDark: '#b7afa4',
      robe: '#20283a',
      robeDark: '#0e121d',
      robeLight: '#404a64',
      sash: '#b8913e'
    }
  }
};