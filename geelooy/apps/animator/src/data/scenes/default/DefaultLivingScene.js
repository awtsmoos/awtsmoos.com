// B"H
import { GoalBoardEasyAPI } from '../../../authoring/goalBoard/index.js';

/**
 * Default scene now comes from the easy authoring layer.
 * One preset call reveals the whole vessel: room, characters, props,
 * camera grammar, dialogue, inserts, movement, and quality metadata.
 */
export const DEFAULT_LIVING_SCENE = GoalBoardEasyAPI.scene();
