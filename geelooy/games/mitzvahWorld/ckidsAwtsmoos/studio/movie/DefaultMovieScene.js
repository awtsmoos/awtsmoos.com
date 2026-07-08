// B"H
/** Default movie scene: one canonical busy Chossid clip, ready for render proof. */
import { CHOSSID_ACTION_SAMPLE_PROJECT } from "./ChossidActionSampleClip.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const DEFAULT_MOVIE_SCENE_ID = "default_chossid_busy_action_scene";
export const DEFAULT_MOVIE_RENDER_SECONDS = 20;
export function defaultMovieScene() {
  return {
    id: DEFAULT_MOVIE_SCENE_ID,
    title: "Default Chossid Busy Action Scene",
    durationSec: DEFAULT_MOVIE_RENDER_SECONDS,
    sourceProject: CHOSSID_ACTION_SAMPLE_PROJECT.id,
    outputName: "default-chossid-busy-action-scene.mp4",
    requiredActions: ["busyWalkTalk", "busyRun", "busyJump", "busyTalkHands"],
    requiredWords: ["walk", "run", "jump", "talk"],
    video: CHOSSID_ACTION_SAMPLE_PROJECT.video,
    render: { width: 1280, height: 720, fps: 30, codec: "h264", audio: true }
  };
}
export default defaultMovieScene;
