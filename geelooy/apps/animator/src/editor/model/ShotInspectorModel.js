// B"H
export class ShotInspectorModel { static inspect(plan = {}) { return { shotType: plan.shotType || plan.shot, targets: plan.targetActors || [], props: plan.targetProps || [], angle: plan.angle, movement: plan.movement, safe: { x: plan.x, y: plan.y, zoom: plan.zoom } }; } }
