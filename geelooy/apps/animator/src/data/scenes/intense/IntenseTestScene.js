
// B"H
import { IntenseCharacters } from './IntenseCharacters.js';

/**
 * @file IntenseTestScene.js
 * @description
 * CHAPTER: THE SCENE PLAYS AGAIN
 *
 * The crash was from invalid JavaScript in locomotion.
 * This scene now gives the Director plenty to play:
 * speech, walking, waving, pointing, shrugging, thinking, bouncing, and shirts.
 */
export const INTENSE_SCENE = {
  id: 'cinematic_epic_rich_rectified',
  name: 'The Restored Park of Living Souls',
  duration: 30000,

  camera: {
    mode: 'fitCharacters',
    x: 0,
    y: -150,
    zoom: 1.08,
    safePadding: 120,
    mobileZoom: 1.18,
    mobileY: -155
  },

  scene: {
    timeOfDay: 0.3,
    weather: 'clear',
    groundY: 120,
    composition: {
      characterLane: { minX: -650, maxX: 650, minY: -430, maxY: 120 },
      propClearance: 190,
      backgroundDepth: -10,
      characterDepth: 10,
      foregroundDepth: 30
    },
    mountains: [
      { x: -1200, y: 120, w: 1000, h: 480, color: '#1a1e24', depth: -30 },
      { x: 200, y: 120, w: 1250, h: 520, color: '#222222', depth: -30 }
    ],
    buildings: [
      { type: 'skyscraper', x: -850, y: 120, w: 220, h: 680, color: '#14181a', depth: -20 },
      { type: 'cyberpunk', x: 780, y: 120, w: 240, h: 620, color: '#1a1e22', depth: -20 }
    ],
    foliage: [
      { id: 'bg_oak_left', type: 'oak', x: -700, y: 120, size: 160, depth: -12 },
      { id: 'bg_oak_right', type: 'oak', x: 700, y: 120, size: 160, depth: -12 }
    ],
    props: []
  },

  initialCharacters: IntenseCharacters,

  events: [
    {
      type: 'scene_change',
      start: 0,
      end: 30000,
      sceneType: 'park'
    },

    {
      type: 'character',
      id: 'c1_husband',
      start: 0,
      end: 30000,
      actions: [
        { at: 0, key: 'position', value: { x: -260, y: 0, scale: 0.82 } },
        { at: 0, key: 'mood', value: 'thoughtful' },
        { at: 0, key: 'easyMotion', value: 'think' },
        { at: 600, key: 'isTalking', value: true },
        { at: 600, key: 'easyMotion', value: 'talk' },
        { at: 3600, key: 'isTalking', value: false },
        { at: 3600, key: 'easyMotion', value: 'think' },
        { at: 7000, key: 'isWalking', value: true },
        { at: 7000, key: 'easyMotion', value: 'walk' },
        { at: 11200, key: 'position', value: { x: -190, y: 0, scale: 0.82 } },
        { at: 11500, key: 'isWalking', value: false },
        { at: 11500, key: 'easyMotion', value: 'point' }
      ]
    },

    {
      type: 'character',
      id: 'c2_wife',
      start: 0,
      end: 30000,
      actions: [
        { at: 0, key: 'position', value: { x: 230, y: 0, scale: 0.82 } },
        { at: 0, key: 'mood', value: 'warm' },
        { at: 0, key: 'easyMotion', value: 'idle' },
        { at: 3800, key: 'isTalking', value: true },
        { at: 3800, key: 'easyMotion', value: 'shrug' },
        { at: 6500, key: 'isTalking', value: false },
        { at: 6500, key: 'easyMotion', value: 'wave' },
        { at: 9000, key: 'easyMotion', value: 'bounce' },
        { at: 11200, key: 'easyMotion', value: 'idle' }
      ]
    },

    {
      type: 'character',
      id: 'c3_walker',
      start: 0,
      end: 30000,
      actions: [
        { at: 0, key: 'isWalking', value: true },
        { at: 0, key: 'easyMotion', value: 'walk' },
        { at: 0, key: 'position', value: { x: -520, y: 0, scale: 0.68 } },
        { at: 14000, key: 'position', value: { x: -360, y: 0, scale: 0.68 } },
        { at: 14500, key: 'isWalking', value: false },
        { at: 14500, key: 'easyMotion', value: 'wave' }
      ]
    },

    {
      type: 'character',
      id: 'c4_friend',
      start: 0,
      end: 30000,
      actions: [
        { at: 0, key: 'easyMotion', value: 'wave' },
        { at: 0, key: 'position', value: { x: 520, y: 0, scale: 0.68 } },
        { at: 8000, key: 'easyMotion', value: 'point' },
        { at: 14000, key: 'isWalking', value: true },
        { at: 14000, key: 'easyMotion', value: 'walk' },
        { at: 14000, key: 'position', value: { x: 360, y: 0, scale: 0.68 } },
        { at: 14500, key: 'isWalking', value: false },
        { at: 14500, key: 'easyMotion', value: 'idle' }
      ]
    },

    {
      type: 'character',
      id: 'c5_coder',
      start: 0,
      end: 30000,
      actions: [
        { at: 0, key: 'easyMotion', value: 'think' },
        { at: 5000, key: 'easyMotion', value: 'point' },
        { at: 9000, key: 'easyMotion', value: 'clap' },
        { at: 12000, key: 'easyMotion', value: 'think' }
      ]
    },

    {
      type: 'speech',
      id: 'c1_husband',
      start: 600,
      end: 3600,
      text: 'Why do I feel like my very existence is a simulation?!'
    },

    {
      type: 'speech',
      id: 'c2_wife',
      start: 3800,
      end: 6500,
      text: "You're overthinking it again, dear. Just relax."
    },

    {
      type: 'speech',
      id: 'c5_coder',
      start: 9000,
      end: 12000,
      text: 'The bug was escaped JavaScript. The world can move again.'
    }
  ]
};
