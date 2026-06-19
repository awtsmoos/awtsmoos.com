// B"H
import { GOAL_BOARD_CAMERA_RIGS, GOAL_BOARD_ROOM, GOAL_BOARD_SHOT_FLOW } from './GoalBoardDefaults.js';
import { GoalBoardBeatCompiler } from './GoalBoardBeatCompiler.js';
import { SCHOLAR_CHARACTERS } from '../../data/scenes/default/scholarCharacters.js';
import { STUDY_ROOM_PROPS } from '../../data/scenes/default/studyRoomProps.js';

export class GoalBoardScenePreset {
  static build(options = {}) {
    const beats = GoalBoardBeatCompiler.normalize(options.beats || GoalBoardBeatCompiler.defaultBeats());
    return {
      duration: options.duration || 22600,
      scene: { ...GOAL_BOARD_ROOM, ...(options.scene || {}) },
      shotFlow: options.shotFlow || GOAL_BOARD_SHOT_FLOW,
      cameras: options.cameras || GOAL_BOARD_CAMERA_RIGS,
      initialCharacters: options.characters || SCHOLAR_CHARACTERS,
      initialProps: options.props || STUDY_ROOM_PROPS,
      authoring: this.authoring(options, beats),
      events: GoalBoardBeatCompiler.build(beats)
    };
  }

  static authoring(options, beats) {
    return {
      system: 'goalBoardEasyAPI',
      version: 3,
      title: options.title || 'Centered Stable Warm Scholar Room',
      beats: beats.length,
      promise: 'one preset produces room, characters, props, cameras, events, and quality signals'
    };
  }
}
