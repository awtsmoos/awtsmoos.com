// B"H
/**
 * @file MovieDirectorRuntime.js
 * @description Runtime director for generated movie scenes.
 *
 * The director does not demand that the whole world stop. It prepares the film,
 * samples the rail, publishes dialogue/action packets, and only moves the
 * camera when a caller asks with intention.
 */
import { compileMovieProject, compileMovieScene } from "./MovieTimelineCompiler.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

/**
 * Converts array vector into object vector.
 *
 * @param {number[]} value Array vector.
 * @returns {object} Object vector.
 */
function vec(value = [0,0,0]) { return { x:Number(value[0]) || 0, y:Number(value[1]) || 0, z:Number(value[2]) || 0 }; }

/**
 * Copies vector-like values.
 *
 * @param {object} to Destination.
 * @param {object} from Source.
 * @returns {void}
 */
function copyVec(to, from) { if (to?.set) to.set(from.x, from.y, from.z); else Object.assign(to, from); }

/**
 * Linear interpolation.
 *
 * @param {number} a Start.
 * @param {number} b End.
 * @param {number} t Unit progress.
 * @returns {number} Value.
 */
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Samples camera beats into one pose.
 *
 * @param {object[]} camera Camera beats.
 * @param {number} timeSec Time in seconds.
 * @returns {object|null} Pose.
 */
export function sampleMovieCamera(camera = [], timeSec = 0) {
  if (!camera.length) return null;
  let current = camera[0], next = camera[camera.length - 1];
  for (let i = 0; i < camera.length - 1; i++) if (timeSec >= camera[i].at && timeSec <= camera[i + 1].at) { current = camera[i]; next = camera[i + 1]; break; }
  const span = Math.max(.001, next.at - current.at), local = Math.max(0, Math.min(1, (timeSec - current.at) / span)), t = local * local * (3 - 2 * local);
  const a = vec(current.pos), b = vec(next.pos), la = vec(current.look), lb = vec(next.look);
  return { id:next.id, pos:{ x:lerp(a.x,b.x,t), y:lerp(a.y,b.y,t), z:lerp(a.z,b.z,t) }, look:{ x:lerp(la.x,lb.x,t), y:lerp(la.y,lb.y,t), z:lerp(la.z,lb.z,t) }, lens:lerp(current.lens || 50, next.lens || 50, t), shake:Math.max(current.shake || 0, next.shake || 0) };
}

/**
 * Runtime movie director.
 */
export class MovieDirectorRuntime {
  /**
   * Creates a director.
   *
   * @param {object} holder Olam-like world vessel.
   * @param {object} projectInput Movie JSON.
   */
  constructor(holder = {}, projectInput = {}) { this.holder = holder; this.project = compileMovieProject(projectInput); this.history = []; }

  /**
   * Compiles an ad-hoc scene.
   *
   * @param {object} input Scene JSON.
   * @returns {object} Compiled scene.
   */
  generateScene(input = {}) { return compileMovieScene(input); }

  /**
   * Gets a scene by id.
   *
   * @param {string} id Scene id.
   * @returns {object|null} Compiled scene.
   */
  scene(id) { return this.project.scenes.find(scene => scene.id === id) || null; }

  /**
   * Returns a static preview packet.
   *
   * @param {string} id Scene id.
   * @returns {object} Preview report.
   */
  preview(id) { const scene = this.scene(id) || this.project.scenes[0]; return { ok:Boolean(scene), scene, report:scene?.report || null, firstPose:sampleMovieCamera(scene?.camera || [], 0) }; }

  /**
   * Plays a scene camera rail if a camera and update loop exist.
   *
   * @param {string} id Scene id.
   * @returns {object} Playback report.
   */
  play(id) {
    const scene = this.scene(id) || this.project.scenes[0], camera = this.holder.camera;
    const report = { ok:Boolean(scene), id:scene?.id || null, cameraFound:Boolean(camera), startedAt:Date.now(), durationSec:scene?.durationSec || 0, finished:false };
    if (!scene || !camera?.position || !this.holder.tzimtzum?.onUpdate) return report;
    const original = { x:camera.position.x, y:camera.position.y, z:camera.position.z }, started = performance.now();
    let done = false;
    this.holder.tzimtzum.onUpdate(() => {
      if (done) return;
      const elapsed = (performance.now() - started) / 1000;
      if (elapsed > scene.durationSec) { copyVec(camera.position, original); report.finished = true; report.finishedAt = Date.now(); done = true; return; }
      const pose = sampleMovieCamera(scene.camera, elapsed);
      if (!pose) return;
      copyVec(camera.position, pose.pos); camera.lookAt?.(pose.look.x, pose.look.y, pose.look.z); report.lastPose = pose.id;
    });
    this.history.push(report); return report;
  }

  /**
   * Returns runtime status.
   *
   * @returns {object} Runtime report.
   */
  report() { return { project:this.project.id, title:this.project.title, ...this.project.report, history:this.history.slice(-8) }; }
}

export default MovieDirectorRuntime;
