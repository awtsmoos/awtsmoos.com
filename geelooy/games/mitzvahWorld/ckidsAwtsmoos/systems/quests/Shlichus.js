// B"H
/** @file Shlichus.js @description Legacy quest object bridged toward modern MissionRuntime without browser-only utility imports. */
import ProgressTracker from "./ProgressTracker.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const QUEST_STATE = { LOCKED:"locked", AVAILABLE:"available", ACTIVE:"active", COMPLETE:"complete", TURNED_IN:"turned_in" };
function makeId() { return `shlichus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
export default class Shlichus {
  constructor(config = {}) { Object.assign(this, config); this.id ||= makeId(); this.title ||= "Unnamed Shlichus"; this.state ||= QUEST_STATE.AVAILABLE; this.objectives ||= []; this.rewards ||= {}; this.prerequisites ||= []; this.tracker = new ProgressTracker(this); for (const o of this.objectives) this.tracker.setObjective(o.id || o.type || o.label, o.required || 1); }
  canAccept(player = {}) { return this.state === QUEST_STATE.AVAILABLE && (this.prerequisites || []).every(id => player.missionState?.completed?.[id]); }
  accept() { if (this.state !== QUEST_STATE.AVAILABLE) return false; this.state = QUEST_STATE.ACTIVE; return true; }
  progress(objectiveId, amount = 1) { const obj = (this.objectives || []).find(o => o.id === objectiveId || o.type === objectiveId); const row = this.tracker.add(objectiveId, amount, obj?.required || 1); if (this.tracker.completed) this.state = QUEST_STATE.COMPLETE; return row; }
  complete() { this.state = QUEST_STATE.COMPLETE; return this; }
  turnIn() { if (this.state !== QUEST_STATE.COMPLETE) return false; this.state = QUEST_STATE.TURNED_IN; return this.rewards; }
  payload() { return { id:this.id, title:this.title, state:this.state, prerequisites:this.prerequisites, objectives:this.objectives, rewards:this.rewards, tracker:this.tracker.payload() }; }
}
