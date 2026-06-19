
// B"H

/**
 * @file IntenseCharacters.js
 * @description
 * ============================================================================
 * CHAPTER: THE CAST BECOMES AN ANIME-CARTOON-REAL CROWD
 * ============================================================================
 *
 * Different hair, shirts, expressions, personalities, effects, and motions.
 */
export const IntenseCharacters = {
  c1_husband: {
    id: 'c1_husband',
    archetype: 'sage',
    style: 'illustrated_sage',
    clothes: 'robe',
    hatType: 'yarmulke',
    glasses: 'shades',
    hairType: 'standard',
    shoeType: 'boots',
    tshirt: 'cream_torah',
    easyMotion: 'think',
    expression: 'curious',
    animationPersonality: 'dramatic',
    lensFlare: 'softGold',
    colors: {
      skin: '#f2c1a2',
      clothes: '#0055ff',
      pants: '#1133aa',
      hair: '#f8f8f8',
      eyes: '#111111'
    },
    position: { x: -260, y: 0, scale: 0.82 },
    view: 'threeQuarter',
    flipX: false,
    mood: 'thoughtful',
    concentration: 0.55,
    morphParams: { squint: 1, bx: 0, bi: 0, bo: 0, ba: -15 }
  },

  c2_wife: {
    id: 'c2_wife',
    archetype: 'human',
    style: 'realistic',
    clothes: 'default_jacket',
    hairType: 'long',
    shoeType: 'boots',
    tshirt: 'purple_light',
    easyMotion: 'shrug',
    expression: 'warm',
    animationPersonality: 'gentle',
    lensFlare: 'blueAnime',
    colors: {
      skin: '#e0ac69',
      clothes: '#8e44ad',
      pants: '#152333',
      hair: '#222222',
      eyes: '#2a1608'
    },
    position: { x: 230, y: 0, scale: 0.82 },
    view: 'threeQuarter',
    flipX: true,
    mood: 'warm',
    joy: 0.18,
    warmth: 0.62,
    morphParams: { squint: 1, bx: 0, bi: 0, bo: 0, ba: -10 }
  },

  c3_walker: {
    id: 'c3_walker',
    archetype: 'human',
    style: 'realistic',
    clothes: 'default_jacket',
    hairType: 'wavy',
    shoeType: 'boots',
    tshirt: 'sky_blue',
    easyMotion: 'walk',
    expression: 'neutral',
    animationPersonality: 'bouncy',
    colors: {
      skin: '#c98f5d',
      clothes: '#2f7dbb',
      pants: '#1a2a3a',
      hair: '#2b1b12',
      eyes: '#111111'
    },
    position: { x: -520, y: 0, scale: 0.68 },
    view: 'threeQuarter',
    flipX: false,
    mood: 'calm',
    isWalking: true
  },

  c4_friend: {
    id: 'c4_friend',
    archetype: 'human',
    style: 'realistic',
    clothes: 'default_jacket',
    hairType: 'bob',
    shoeType: 'boots',
    tshirt: 'forest_green',
    easyMotion: 'wave',
    expression: 'laughing',
    animationPersonality: 'fiery',
    colors: {
      skin: '#f0b184',
      clothes: '#3b8f5a',
      pants: '#23354a',
      hair: '#3a2618',
      eyes: '#111111'
    },
    position: { x: 520, y: 0, scale: 0.68 },
    view: 'threeQuarter',
    flipX: true,
    mood: 'warm',
    joy: 0.65
  },

  c5_coder: {
    id: 'c5_coder',
    archetype: 'human',
    style: 'realistic',
    clothes: 'default_jacket',
    hairType: 'pixie',
    shoeType: 'boots',
    tshirt: 'coder_black',
    easyMotion: 'think',
    expression: 'thinking',
    animationPersonality: 'curious',
    lensFlare: 'dramaticRed',
    colors: {
      skin: '#d6a06f',
      clothes: '#333333',
      pants: '#101a22',
      hair: '#111111',
      eyes: '#111111'
    },
    position: { x: 0, y: 0, scale: 0.62 },
    view: 'threeQuarter',
    flipX: false,
    mood: 'thoughtful',
    concentration: 0.75
  },

  c6_runner: {
    id: 'c6_runner',
    archetype: 'human',
    style: 'realistic',
    clothes: 'default_jacket',
    hairType: 'spiky',
    shoeType: 'boots',
    tshirt: 'red_spark',
    easyMotion: 'walk',
    expression: 'heroic',
    animationPersonality: 'heroic',
    cartoonHero: true,
    colors: {
      skin: '#c88755',
      clothes: '#d94a3d',
      pants: '#202a35',
      hair: '#1b100b',
      eyes: '#111111'
    },
    position: { x: -720, y: 0, scale: 0.64 },
    view: 'threeQuarter',
    flipX: false,
    mood: 'euphoric',
    isWalking: true
  }
};
