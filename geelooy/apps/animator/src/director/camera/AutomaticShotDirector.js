// B"H

/**
 * @file AutomaticShotDirector.js
 * @description
 * A small director with a loud will: never let a story rot in one flat shot.
 * The Awtsmoos makes the instant new; this director makes the frame new.
 */
export class AutomaticShotDirector {
  static plan({ ctx = {}, state = null, time = 0, camera = {} } = {}) {
    const scene = state?.get ? state.get('scene') || {} : {};
    const characters = state?.get ? state.get('characters') || {} : {};
    const kind = this.sceneKind(scene);
    const width = Number(ctx.canvas?.width || globalThis.innerWidth || 800);
    const height = Number(ctx.canvas?.height || globalThis.innerHeight || 600);
    const mobile = width <= 900 || height > width;
    const enabled = kind !== 'plain';
    const beat = enabled ? this.beat(time, kind) : this.plainBeat();

    return {
      enabled,
      mobile,
      beat,
      sceneKind: kind,
      characterCount: Object.keys(characters).length || 2,
      camera: this.cameraFor(beat, mobile, camera, kind),
      staging: this.stagingFor(beat, kind),
      room: { density: kind === 'storyWorld' ? 'story_world' : kind, table: true },
      qualityTarget: mobile ? 86 : 80
    };
  }

  static sceneKind(scene = {}) {
    const text = `${scene.style || ''} ${scene.id || ''} ${scene.title || ''} ${scene.theme || ''}`;
    if (/authored_world_2d|healthy|lunch|park|picnic|outdoor/i.test(text)) return 'storyWorld';
    if (/goal_board|warm_study|production|scholar/i.test(text)) return 'production';
    return 'plain';
  }

  static beat(time = 0, kind = 'storyWorld') {
    const t = (Number(time) || 0) % 18;
    if (kind === 'storyWorld') {
      if (t < 3) return 'storyEstablishing';
      if (t < 7) return 'healthyTableTwoShot';
      if (t < 10) return 'kidBenefitClose';
      if (t < 13) return 'guideReaction';
      if (t < 15) return 'foodBenefitInsert';
      return 'celebrationMedium';
    }

    if (t < 2) return 'establishing';
    if (t < 6) return 'twoShot';
    if (t < 9) return 'speakerClose';
    if (t < 12) return 'listenerReaction';
    if (t < 14) return 'propInsert';
    return 'mediumDialogue';
  }

  static plainBeat() { return 'plain'; }

  static cameraFor(beat, mobile, camera = {}, kind = 'storyWorld') {
    const story = {
      storyEstablishing: { x: 0, y: 72, zoom: mobile ? 1.24 : 1.02, shot: 'establishing', cameraId: 'hl_establish' },
      healthyTableTwoShot: { x: 0, y: 84, zoom: mobile ? 1.68 : 1.24, shot: 'twoShot', cameraId: 'hl_table' },
      kidBenefitClose: { x: -82, y: 88, zoom: mobile ? 2.12 : 1.68, shot: 'closeUp', cameraId: 'hl_kid' },
      guideReaction: { x: 92, y: 88, zoom: mobile ? 2.02 : 1.58, shot: 'reaction', cameraId: 'hl_guide' },
      foodBenefitInsert: { x: 0, y: 122, zoom: mobile ? 2.32 : 1.88, shot: 'insert', cameraId: 'hl_food_insert' },
      celebrationMedium: { x: 0, y: 78, zoom: mobile ? 1.56 : 1.2, shot: 'mediumDialogue', cameraId: 'hl_celebrate' }
    };
    const production = {
      establishing: { x: 0, y: 42, zoom: mobile ? 1.18 : 0.92, shot: 'establishing' },
      twoShot: { x: 0, y: 48, zoom: mobile ? 1.62 : 1.18, shot: 'twoShot' },
      speakerClose: { x: -118, y: 54, zoom: mobile ? 2.18 : 1.72, shot: 'closeUp' },
      listenerReaction: { x: 118, y: 54, zoom: mobile ? 2.08 : 1.62, shot: 'reaction' },
      propInsert: { x: 0, y: 112, zoom: mobile ? 2.35 : 1.9, shot: 'insert' },
      mediumDialogue: { x: 0, y: 44, zoom: mobile ? 1.72 : 1.28, shot: 'mediumDialogue' }
    };
    const plain = { x: camera.x || 0, y: camera.y || 0, zoom: camera.zoom || 1, shot: camera.shot || 'group', cameraId: camera.cameraId || 'group' };
    const table = kind === 'storyWorld' ? story : kind === 'production' ? production : { plain };
    return { ...(table[beat] || table.twoShot || plain), cinematicDirector: beat !== 'plain' };
  }

  static stagingFor(beat, kind = 'storyWorld') {
    return {
      tableAnchor: kind !== 'plain',
      priority: /close|reaction/.test(beat) ? 'face' : /insert/.test(beat) ? 'prop' : 'relationship',
      beat,
      kind
    };
  }
}
