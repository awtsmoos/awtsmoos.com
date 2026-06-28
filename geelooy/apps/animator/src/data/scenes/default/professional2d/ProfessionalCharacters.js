// B"H

const shared = {
  view: 'threeQuarter',
  locomotion: 'idle',
  motionMode: 'alive_idle',
  gazeMode: 'sceneAware',
  renderDetailMode: 'closeup'
};

const face = (emotion, energy, eyes, mouth) => ({
  emotion, energy, eyes, mouth, blinkRate: .72, browAsymmetry: .18,
  microExpressions: ['blink', 'eyeDart', 'breathSmile', 'tinyHeadTilt'],
  actingNotes: 'Face leads body; eyes choose thought before hands explain.'
});

const physics = (hair=.4, cloth=.35, extra=.25) => ({
  hair, cloth, tail: extra, ears: extra, settle: .42, overlap: .55
});

export const PROFESSIONAL_CHARACTERS = {
  inventor_hero: {
    ...shared, id: 'inventor_hero', name: 'Mira the Lantern Maker',
    archetype: 'inventor_child', style: 'professional_2d_appeal',
    position: { x: -132, y: 0, scale: .88 }, emotion: 'hopeful_worried',
    gesture: 'careful_reach', silhouetteShape: 'round_head_small_body_big_goggles',
    expressionProfile: face('hopeful_worried', 1.18, 'wide_glossy_focus', 'small_uncertain_smile'),
    actingPersonality: 'fast_thinking_kind_heart', comedyTiming: 'quick_recoveries',
    colors: { jacket: '#2c7fb8', pants: '#243044', shirt: '#fff1c7', skin: '#d9a16f', hair: '#5b3217', hairDark: '#2b1409', goggles: '#f7c948' },
    physics: physics(.62, .38, .2)
  },
  elder_mentor: {
    ...shared, id: 'elder_mentor', name: 'Orin the Patient', flipX: true,
    archetype: 'warm_elder', style: 'professional_2d_appeal',
    position: { x: 80, y: 0, scale: .98 }, emotion: 'gentle_confidence',
    gesture: 'soft_explain', silhouetteShape: 'large_beard_soft_hat_heavy_coat',
    expressionProfile: face('gentle_confidence', .82, 'soft_half_lids', 'knowing_smile'),
    actingPersonality: 'slow_warm_wise', comedyTiming: 'delayed_blink_then_smile',
    beard: true, hatType: 'softCap', colors: { jacket: '#5c3b2e', pants: '#202022', shirt: '#fff7df', skin: '#c98f67', hair: '#efe1c8', beard: '#efe1c8', beardDark: '#b58d66', hat: '#3e2d29' },
    physics: physics(.2, .55, .15)
  },
  tiny_sidekick: {
    ...shared, id: 'tiny_sidekick', name: 'Pip',
    archetype: 'tiny_creature', style: 'squash_stretch_sidekick',
    position: { x: -26, y: 28, scale: .48 }, emotion: 'overexcited',
    gesture: 'bounce_point', silhouetteShape: 'bean_body_huge_eyes_leaf_tail',
    expressionProfile: face('overexcited', 1.45, 'giant_pupil_spark', 'bean_grin'),
    actingPersonality: 'silent_comic_truth_teller', comedyTiming: 'two_beats_ahead',
    colors: { jacket: '#6ad66a', pants: '#246b38', shirt: '#fbffe8', skin: '#9be27b', hair: '#226b38', hairDark: '#174b29' },
    physics: physics(.3, .22, .85)
  },
  pompous_mayor: {
    ...shared, id: 'pompous_mayor', name: 'Mayor Brindle', flipX: true,
    archetype: 'comic_authority', style: 'professional_2d_appeal',
    position: { x: 178, y: 0, scale: .9 }, emotion: 'nervous_pride',
    gesture: 'tiny_disapproval', silhouetteShape: 'tall_thin_body_tiny_hands_big_brows',
    expressionProfile: face('nervous_pride', 1.05, 'pinched_side_eye', 'tight_frown_pop'),
    actingPersonality: 'loud_status_fragile_ego', comedyTiming: 'puffed_up_then_deflates',
    colors: { jacket: '#7c274b', pants: '#1c1b22', shirt: '#ffe9bd', skin: '#d39b73', hair: '#2f2019', hairDark: '#140b07', hat: '#62183a' },
    physics: physics(.18, .48, .1)
  }
};
