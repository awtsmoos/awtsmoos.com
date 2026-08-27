// B"H
import { IdlePose } from './poses/IdlePose.js';
import { WalkPose } from './poses/WalkPose.js';
import { TalkPose } from './poses/TalkPose.js';
import { GesturePose } from './poses/GesturePose.js';
import { ThrowPose } from './poses/ThrowPose.js';
import { CatchPose } from './poses/CatchPose.js';
import { ReactionPose } from './poses/ReactionPose.js';

/**
 * @file PoseRegistry.js
 * @description
 * Maps every active action name to a whole-body pose.
 */
export const PoseRegistry = {
  idle: IdlePose,
  listen_idle: IdlePose,
  walk: WalkPose,
  run: WalkPose,

  explain: TalkPose,
  talking: TalkPose,
  speak: TalkPose,

  point: {
    sample: (data, view, time) => GesturePose.sample(data, view, time, 'point')
  },
  open_hand: {
    sample: (data, view, time) => GesturePose.sample(data, view, time, 'open_hand')
  },

  throw_windup: {
    sample: (data, view, time) => ThrowPose.sample(data, view, time, 'throw_windup')
  },
  throw_release: {
    sample: (data, view, time) => ThrowPose.sample(data, view, time, 'throw_release')
  },
  throw_follow: {
    sample: (data, view, time) => ThrowPose.sample(data, view, time, 'throw_follow')
  },

  catch_ready: {
    sample: (data, view, time) => CatchPose.sample(data, view, time, 'catch_ready')
  },
  catch: {
    sample: (data, view, time) => CatchPose.sample(data, view, time, 'catch')
  },
  show_prop: {
    sample: (data, view, time) => CatchPose.sample(data, view, time, 'catch')
  },

  react_nod: {
    sample: (data, view, time) => ReactionPose.sample(data, view, time, 'react_nod')
  },
  react_smile: {
    sample: (data, view, time) => ReactionPose.sample(data, view, time, 'react_smile')
  },
  look_action: {
    sample: (data, view, time) => ReactionPose.sample(data, view, time, 'look_action')
  }
};