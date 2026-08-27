// B"H
import { IdleAction } from './IdleAction.js';
import { WalkAction } from './WalkAction.js';
import { RunAction } from './RunAction.js';
import { TalkAction } from './TalkAction.js';
import { ThrowAction } from './ThrowAction.js';
import { CatchAction } from './CatchAction.js';
import { WaveAction } from './WaveAction.js';
import { PointAction } from './PointAction.js';

/**
 * @file ActionPoseRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE REGISTRY WHERE EVERY ACTION HAS ITS OWN HOME
 * ============================================================================
 */

export const ACTION_POSE_REGISTRY = {
  idle: IdleAction,
  walk: WalkAction,
  run: RunAction,
  explain: TalkAction,
  talk: TalkAction,
  throw: ThrowAction,
  catch: CatchAction,
  wave: WaveAction,
  point: PointAction
};