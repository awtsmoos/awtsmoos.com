// B"H
import { SefirosSceneRegistry } from "./SefirosSceneRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { SefirosRenderPlanStore } from "./SefirosRenderPlanStore.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class SefirosRuntimeBridge { constructor() { this.registry = new SefirosSceneRegistry(); this.store = new SefirosRenderPlanStore(); } install(plan = {}) { this.registry.add(plan.sefiros || plan); this.store.set(plan.id || "sefiros_plan", plan); return this.snapshot(); } snapshot() { return { registry:this.registry.snapshot(), store:this.store.snapshot() }; } }
export default SefirosRuntimeBridge;
