// B"H
/** @file AnimationStateMachine.js @description A tiny state machine so actors stop snapping like hollow puppets. */
const TRANSITIONS = { idle:["walk","talk","pray","study","sleep"], walk:["idle","run","carry"], run:["walk","jump","dodge"], talk:["idle","wave","point"], combat:["block","dodge","parry","light-attack","heavy-attack","stagger"] };
export function createAnimationStateMachine(initial = "idle") { return { state:initial, previous:null, transition(to) { const allowed = TRANSITIONS[this.state] || TRANSITIONS.combat; const next = allowed.includes(to) ? to : "idle"; this.previous = this.state; this.state = next; return this.snapshot(); }, snapshot() { return { state:this.state, previous:this.previous, allowed:TRANSITIONS[this.state] || [] }; } }; }
export default createAnimationStateMachine;
