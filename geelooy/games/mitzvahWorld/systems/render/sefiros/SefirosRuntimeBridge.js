// B"H
import { SefirosSceneRegistry } from "./SefirosSceneRegistry.js";
import { SefirosRenderPlanStore } from "./SefirosRenderPlanStore.js";
export class SefirosRuntimeBridge { constructor() { this.registry = new SefirosSceneRegistry(); this.store = new SefirosRenderPlanStore(); } install(plan = {}) { this.registry.add(plan.sefiros || plan); this.store.set(plan.id || "sefiros_plan", plan); return this.snapshot(); } snapshot() { return { registry:this.registry.snapshot(), store:this.store.snapshot() }; } }
export default SefirosRuntimeBridge;
