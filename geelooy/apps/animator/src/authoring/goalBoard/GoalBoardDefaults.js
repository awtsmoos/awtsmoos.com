// B"H

export const GOAL_BOARD_ROOM = {
  id: 'goal_board_warm_study_full_v3',
  style: 'goal_board_warm_study',
  groundY: 210,
  cameraPolicy: 'safe_centered_mobile',
  detailDensity: 'very_high',
  emotionalContinuity: 'face_first',
  mobileSafe: true,
  visualPromise: 'centered_stable_beautiful_story_driven'
};

export const GOAL_BOARD_SHOT_FLOW = [
  ['establishingShot', 200], ['twoShot', 1900], ['overTheShoulder', 3600],
  ['mediumCloseUp', 5200], ['reactionShot', 6800], ['foodInsert', 8400],
  ['objectInsert', 10000], ['mediumShot', 11800], ['twoShot', 13600],
  ['lowAngle', 15400], ['highAngle', 17200], ['profileShot', 19000], ['wideShot', 20800]
].map(([name, at]) => ({ at, name, purpose: name.replace(/([A-Z])/g, ' $1').toLowerCase().trim() }));

export const GOAL_BOARD_CAMERA_RIGS = [
  ['establishing', 'establishingShot', .82, 128], ['two_shot', 'twoShot', 1.03, 132],
  ['ots_left', 'overTheShoulder', 1.18, 134], ['left_close', 'reactionShot', 1.34, 138],
  ['right_close', 'reactionShot', 1.34, 138], ['soup_insert', 'foodInsert', 1.5, 138],
  ['book_insert', 'objectInsert', 1.48, 138], ['final_wide', 'wideShot', .84, 128]
].map(([id, type, zoom, y]) => ({ id, name: id.replaceAll('_', ' '), type, targetMode: type.includes('Insert') ? 'prop' : 'multi', targetActors: ['rabbi_left', 'rabbi_right'], x: 0, y, zoom, transition: id === 'establishing' ? 'cut' : 'ease' }));
