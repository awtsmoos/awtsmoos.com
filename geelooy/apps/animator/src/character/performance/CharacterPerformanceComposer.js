// B"H
import { PerformanceStateNormalizer } from './state/PerformanceStateNormalizer.js';
import { PoseDefaults } from './core/PoseDefaults.js';
import { PerformanceLayerRunner } from './core/PerformanceLayerRunner.js';
import { LocomotionLayer } from './layers/LocomotionLayer.js';
import { GestureLayer } from './layers/GestureLayer.js';
import { SpeechLayer } from './layers/SpeechLayer.js';
import { EmotionLayer } from './layers/EmotionLayer.js';
import { FaceLayer } from './layers/FaceLayer.js';
import { FacingResolver } from './facing/FacingResolver.js';
import { CinematicFaceSignal } from './CinematicFaceSignal.js';
import { PerformanceRenderBridge } from './render/PerformanceRenderBridge.js';

/** Natural acting composer. It never replaces the stable puppet; it whispers life into it. */
export class CharacterPerformanceComposer {
  static compose(data = {}, view = {}, time = 0, world = {}) {
    const state = this.normalizeState(data);
    const pose = this.basePose(data, state, view, time, world);
    pose.facing = FacingResolver.resolve(data, state, world);
    for (const layer of [LocomotionLayer, GestureLayer, SpeechLayer, EmotionLayer, FaceLayer]) PerformanceLayerRunner.run(layer, pose, state, view, time, world);
    this.naturalMotion(pose, data, state, time);
    this.faceGuarantees(pose, data, state, time);
    this.bodyPerformance(pose, data, state, time);
    this.aliases(pose);
    return pose;
  }

  static normalizeState(data) {
    let state = {};
    try { state = PerformanceStateNormalizer.normalize(data) || {}; } catch { state = { ...data }; }
    state.raw = data; state.data = data;
    state.action ||= data.action || data.currentPerformance?.locomotion || 'idle';
    state.gesture ||= data.gesture || data.currentPerformance?.gesture || 'none';
    state.emotion ||= data.emotion || data.currentPerformance?.emotion || 'calm';
    state.speech ||= data.speech || data.currentPerformance?.speech || (data.speaking ? 'talk' : 'none');
    state.dialogue ||= data.dialogue || '';
    return state;
  }

  static basePose(data, state, view, time, world) {
    let pose; try { pose = PoseDefaults.create(); } catch { pose = {}; }
    pose.body ||= {}; pose.face ||= {}; pose.arms ||= { left: {}, right: {} }; pose.legs ||= { left: {}, right: {} };
    pose.arms.left ||= {}; pose.arms.right ||= {}; pose.legs.left ||= {}; pose.legs.right ||= {};
    pose.meta = { action: state.action, gesture: state.gesture, emotion: state.emotion, speech: state.speech, time, view, world };
    return pose;
  }

  static naturalMotion(pose, data, state, time) {
    const talk = this.talking(data, state);
    const seed = Number(data._index || 0) * 0.73;
    const breath = Math.sin(time * 0.0017 + seed);
    pose.body.bob = Number(pose.body.bob || 0) + breath * 1.2;
    pose.body.torsoLean = Number(pose.body.torsoLean || 0) + Math.sin(time * 0.001 + seed) * 0.55;
    pose.body.headNod = Number(pose.body.headNod || 0) + Math.sin(time * (talk ? 0.006 : 0.0015) + seed) * (talk ? 2.1 : 0.55);
    pose.body.headRotation = Number(pose.body.headRotation || 0) + Math.sin(time * 0.0012 + seed) * 0.018;
    pose.body.torsoBreathScale = 1 + breath * 0.014;
    this.armIdle(pose, 'left', time, talk, state); this.armIdle(pose, 'right', time, talk, state);
  }

  static armIdle(pose, side, time, talk, state) {
    const sign = side === 'right' ? 1 : -1;
    const pulse = Math.sin(time * (talk && side === 'right' ? 0.005 : 0.0016) + sign);
    const emph = talk && side === 'right' ? 1 : 0;
    pose.arms[side].elbowX = Number(pose.arms[side].elbowX || 14) + pulse * (1.4 + emph * 4);
    pose.arms[side].elbowY = Number(pose.arms[side].elbowY || 38) + pulse * (0.8 - emph * 2.4);
    pose.arms[side].handX = Number(pose.arms[side].handX || 10) + pulse * (1.8 + emph * 6);
    pose.arms[side].handY = Number(pose.arms[side].handY || 30) + Math.cos(time * 0.002 + sign) * (1.4 + emph * 3.8);
    if (emph && !/point|raise|celebrate/.test(state.gesture || '')) pose.arms[side].handPose = 'open';
  }

  static faceGuarantees(pose, data, state, time) {
    const talk = this.talking(data, state);
    const signal = CinematicFaceSignal.from({ ...data, _directorTime: time, _renderTime: time });
    const rp = data.renderPerformance || PerformanceRenderBridge.from(data);
    const f = rp.face || {};
    const syllable = talk ? Math.max(0, Math.sin(time * 0.014) * 0.35 + Math.sin(time * 0.021) * 0.18) : 0;
    pose.face = { ...pose.face,
      eyeOpen: f.eyeOpenAmount ?? pose.face.eyeOpen ?? signal.eyeOpen,
      pupilX: (pose.face.pupilX ?? Math.sin(time * 0.0011) * 0.045) + Number(f.pupilOffsetX || 0) * 0.16,
      pupilY: (pose.face.pupilY ?? Math.cos(time * 0.001) * 0.035) + Number(f.pupilOffsetY || 0) * 0.12,
      mouthOpen: Math.max(Number(f.mouthOpenAmount || 0), Number(signal.mouthOpen || 0), syllable),
      mouthWide: pose.face.mouthWide ?? Math.max(0, Number(f.mouthSmileAmount || signal.mouthSmile || 0) * 0.26),
      mouthSmile: f.mouthSmileAmount ?? signal.mouthSmile,
      browInner: f.browInner ?? signal.browInner,
      browOuter: f.browOuter ?? signal.browOuter,
      browPinch: f.browSqueeze ?? pose.face.browPinch ?? Math.max(0, -signal.browOuter),
      cheekLift: f.cheekRaiseAmount ?? pose.face.cheekLift ?? Math.max(0.02, signal.mouthSmile * 0.4),
      blink: f.blinkAmount || data.blinkNow || 0,
      squint: f.squintAmount || (talk ? 0.04 : 0)
    };
  }

  static bodyPerformance(pose, data, state, time) {
    const rp = data.renderPerformance || PerformanceRenderBridge.from(data);
    const b = rp.body || {}; const talk = this.talking(data, state);
    pose.body.bob = Number(pose.body.bob || 0) + Number(data.breathMotion || 0) * 16;
    pose.body.torsoLean = Number(pose.body.torsoLean || 0) + Number(b.weightShiftAmount || 0) * 0.8;
    pose.body.headNod = Number(pose.body.headNod || 0) + Number(b.headOffsetY || 0);
    pose.body.headRotation = Number(pose.body.headRotation || 0) + Number(b.headRotation || 0);
    pose.body.torsoBreathScale = b.torsoBreathScale || pose.body.torsoBreathScale || 1;
    const handPose = b.handPose || (talk ? 'open_explain' : state.gesture);
    if (/point/.test(handPose)) this.emphasize(pose, 'right', 42, 2, 'point');
    if (/raise|celebrate|wave/.test(handPose)) this.emphasize(pose, 'right', 20, -38, 'open');
    if (/open_explain|explain|talk|present/.test(handPose)) this.emphasize(pose, 'right', 30 + Math.sin(time * 0.006) * 5, 0, 'open');
  }

  static emphasize(pose, side, x, y, handPose = 'open') { pose.arms[side] = { ...pose.arms[side], elbowX: x * .75, elbowY: y + 18, handX: x, handY: y, swing: 1, handPose }; }
  static talking(data, state) { return Boolean(data.isTalking || data.speaking || (state.speech && state.speech !== 'none') || state.dialogue); }
  static aliases(pose) { for (const side of ['left', 'right']) { pose.arms[side].elbowX = Number(pose.arms[side].elbowX || 14); pose.arms[side].elbowY = Number(pose.arms[side].elbowY || 38); pose.arms[side].handX = Number(pose.arms[side].handX || 10); pose.arms[side].handY = Number(pose.arms[side].handY || 30); pose.legs[side].hipX ||= 0; pose.legs[side].kneeX ||= 0; pose.legs[side].ankleX ||= 0; pose.legs[side].footX ||= 0; pose.legs[side].kneeY ||= 0; pose.legs[side].ankleY ||= 0; } }
}
