// B"H
export class SefirosRenderPlanStore { constructor() { this.plans = new Map(); } set(id, plan) { this.plans.set(id, plan); return plan; } snapshot() { return { plans:this.plans.size, ids:[...this.plans.keys()] }; } }
export default SefirosRenderPlanStore;
