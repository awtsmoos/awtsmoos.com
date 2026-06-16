// B"H
/** @file TorahDebateController.js @description Parser-clear Torah debate rewards and pirush validation. */
function playerOf(olam) { return olam && (olam.player || olam.chossid) ? (olam.player || olam.chossid) : null; }
function gainXp(player, xp) { if (player && typeof player.gainXp === "function" && xp) player.gainXp(xp); }
function addItems(player, items) { const inv = player && player.inventory ? player.inventory : null; if (!inv || typeof inv.addItem !== "function" || !Array.isArray(items)) return; for (const item of items) inv.addItem(item, item.amount || 1); }
function passagePirush(passage, type) { return passage && passage.pirushim ? passage.pirushim[type] : null; }
export class TorahDebateController {
  constructor({ olam = null, passages = {}, rewards = {} } = {}) { this.olam = olam; this.passages = passages; this.rewards = rewards; }
  getPassage(id) { return this.passages[id] || null; }
  startDebate(passageId, type) { const passage = this.getPassage(passageId); if (!passagePirush(passage, type)) throw new Error(`Passage cannot use pirush type: ${type}`); return { passageId, type, state:"active", startedAt:Date.now() }; }
  complete(result = {}) { const rewards = this.rewards[result.outcome] || this.rewards.default || {}; const player = playerOf(this.olam); gainXp(player, rewards.xp); addItems(player, rewards.items); return { ok:true, rewards }; }
}
export default TorahDebateController;
