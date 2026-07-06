// B"H
/** @file EquipmentActionRouter.js @description Resolves actor state into animation, projectile, and mesh descriptors. */
export class EquipmentActionRouter {
  constructor({ runtime, state, projectiles, motion, meshFactory, resolver }) { Object.assign(this, { runtime, state, projectiles, motion, meshFactory, resolver }); }
  equip(actorId, item, attachFn, actorRoot, mesh = null) { const descriptor = this.meshFactory(item); const attachment = attachFn(actorId, item.id, actorRoot, mesh || { position:{}, rotation:{}, scale:{}, descriptor }); return this.state.equip(actorId, item, { ...attachment, descriptor }); }
  act(actorId, action = "attack") { const current = this.state.current(actorId); const resolved = this.resolver({ item:current?.item, action }); let projectile = null, moving = null, mesh = null; if (resolved.projectile === "hebrew-letter") { projectile = this.projectiles.fire({ actorId, itemId:current?.itemId }); mesh = this.meshFactory({ id:"hebrewProjectile" }, { projectile }); moving = this.motion.launch({ ...projectile, mesh }); } return { actorId, action, item:current?.item || null, resolved, projectile, moving, mesh }; }
}
export function createEquipmentActionRouter(args) { return new EquipmentActionRouter(args); }
export default createEquipmentActionRouter;
