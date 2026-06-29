// B"H
/**
 * @module Chossid
 * @description
 * Chapter 627: The player body now wakes with explicit MMO progression fields.
 * The Awtsmoos has no body and no form, yet the avatar needs hp, koach, xp,
 * combatXp, torahXp, shlichusXp, and explorationXp before the first step.
 */
import InventoryManager from '../../systems/InventoryManager.js';
import Chai from "../chai/index.js?v=zone-reality-20260614-bh812";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';
import controlMethods from './methods/controls.js?v=zone-reality-20260614-bh812';
import interactionMethods from './methods/interaction.js?v=mobile-target-select-20260614-bh1';
import lifecycleMethods from './methods/lifecycle.js?v=visible-root-binding-20260610-bh710';
import visualMethods from './methods/visuals.js?v=lean-l1-20260528-bh36';
import updateMethods from './methods/update.js?v=zone-reality-20260614-bh812';
import inventorySetupMethods from './methods/inventory-setup.js?v=lean-l1-20260528-bh36';
import { ensurePlayerLevel } from '../../systems/progression/PlayerLevelRuntime.js';
import { isAttackableTarget } from './methods/ClickTargetPolicy.js?v=click-target-policy-20260629-bh1';
function leanGolem() { return { guf: { BoxGeometry: [0.9, 1.8, 0.55] }, toyr: { MeshLambertMaterial: { color: 0x1f6fff } } }; }
function makeInventory(chossid) { const inventory = new InventoryManager(chossid); inventory.equipment ||= {}; inventory.slots ||= []; inventory.actionSlots ||= []; return inventory; }
function numberOr(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
export default class Chossid extends Chai {
  type = "chossid"; rayLength = 50; approachedEntities = [];
  constructor(options = {}, olam) {
    const lean = options.leanBody === true;
    if (lean) { delete options.path; options.golem ||= leanGolem(); options.skipDefaultInventory = true; }
    else if (!Object.prototype.hasOwnProperty.call(options, "path")) options.path = "awtsmoos://awduhm";
    options.height ||= 1.5; options.radius ||= 0.45; options.visualGroundBiasY = 0; options.speed ||= lean ? 16 : 18; options.visualFacingOffsetY ??= Math.PI;
    options.rotationSpeed ||= 4.2; options.lerpTurnSpeed ||= 0.48; options.movementResponsiveness ||= 18; options.stopResponsiveness ||= 28;
    options.animationBlendDuration ||= 0.055; options.animationActionTimeScale ||= 1.18; options.animationSpeedScale ||= 1.2; options.isSolid = false;
    super(options, olam);
    this.isLeanPlatformerPlayer = lean; this.speed = options.speed; this._movementSpeed = options.speed; this._originalSpeed = options.speed;
    this.speedScale = Number.isFinite(options.speedScale) ? options.speedScale : 1.2; this.jumpHeight = options.jumpHeight || 13;
    this.level = numberOr(options.level, 1); this.xp = numberOr(options.xp, 0); this.xpToNext = numberOr(options.xpToNext, 120);
    this.combatXp = numberOr(options.combatXp, 0); this.torahXp = numberOr(options.torahXp, 0); this.shlichusXp = numberOr(options.shlichusXp, 0); this.explorationXp = numberOr(options.explorationXp, 0);
    const maxHealth = numberOr(options.maxHp, numberOr(options.hp, 100)), health = Math.max(0, Math.min(maxHealth, numberOr(options.hp, maxHealth)));
    this.baseStats = { chochmah: 10, binah: 10, daas: 10, health: maxHealth, defense: 5, attack: 10, speed: options.speed };
    this.currentStats = { ...this.baseStats, health, maxHealth }; this.hp = health; this.maxHp = maxHealth; this.maxKoach = numberOr(options.maxKoach, 50); this.koach = Math.max(0, Math.min(this.maxKoach, numberOr(options.koach, this.maxKoach)));
    this.inventory = makeInventory(this); this.slottedPassages = []; this.selectedInventorySlot = 0; this.groundingOffset = 0; this.rotateOffset = 0; this.placementRotation = 0; this.optionsSpeed = options.speed; this._lastVelocityY = 0; this._stepTimer = 0;
    this.__spikeDefeated = false; this.__spikeDeathControlsFrozen = false; this.__lastDamageAt = 0; this.installLeanSafeEvents(); ensurePlayerLevel(this, olam);
  }
  installLeanSafeEvents() { this.on("started walking", () => { this._isWalking = true; }); this.on("stopped walking", () => { this._isWalking = false; }); this.on("approached tzomayach", e => this.rememberApproach(e)); this.on("left tzomayach", e => this.forgetApproach(e)); }
  onChossidStepBreath() {}
  getActiveItem() { return this.inventory?.actionSlots?.[Number.isInteger(this.selectedInventorySlot) ? this.selectedInventorySlot : 0] || null; }
  getRealActiveItemInstance() { const item = this.getActiveItem(); if (item?.className === 'ElementalStaff') this.olam?.ayshPeula("toolAltAction", item); return item; }
  resetPreviewRotation() { this.placementRotation = 0; }
  shoot() {
    const target = this.combatTarget || this.olam?.__selectedCombatTarget || this.olam?.combatManager?.target;
    if (!isAttackableTarget(target)) {
      this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "Select an enemy first.", color: "#ffd95a" });
      return false;
    }
    return this.olam?.combatManager?.attack?.({ source: "chossid-shoot", target });
  }
  rememberApproach(entity) { if (!this.approachedEntities.includes(entity)) this.approachedEntities.unshift(entity); }
  forgetApproach(entity) { const idx = this.approachedEntities.indexOf(entity); if (idx > -1) this.approachedEntities.splice(idx, 1); }
  async madeAll() { if (this.mesh) this.mesh.userData.isPlayer = true; this.updateAppearance?.(); this.setupDefaultInventory?.(); this.inventory?.updateUI?.(); this.recalculateStats(); ensurePlayerLevel(this, this.olam); }
  recalculateStats() { ensurePlayerLevel(this, this.olam); this.currentStats.speed = this.baseStats.speed; this.emitHudStats(); }
  emitHudStats() { this.olam?.ayshPeula("ui event", "gameHUD", { updateStats: { hp: this.currentStats.health || 0, maxHp: this.currentStats.maxHealth || this.baseStats.health || 100, koach: this.koach ?? 50, maxKoach: this.maxKoach ?? 50, xp: this.xp || 0, xpToNext: this.xpToNext || 120, level: this.level || 1, combatXp: this.combatXp || 0, torahXp: this.torahXp || 0, shlichusXp: this.shlichusXp || 0, explorationXp: this.explorationXp || 0 } }); }
  takeDamage(amount = 0) { const damage = Math.max(0, numberOr(amount, 0) - Math.max(0, numberOr(this.baseStats.defense, 0) * 0.12)); this.currentStats.maxHealth ||= this.baseStats.health || 100; this.currentStats.health = Math.max(0, numberOr(this.currentStats.health, this.currentStats.maxHealth) - damage); this.hp = this.currentStats.health; this.maxHp = this.currentStats.maxHealth; this.__lastDamageAt = Date.now(); this.emitHudStats(); this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `-${Math.round(damage)} HP`, color: "#ff4b43" }); this.mesh?.traverse?.(child => child.material?.emissive?.setHex?.(0x661111)); setTimeout(() => this.mesh?.traverse?.(child => child.material?.emissive?.setHex?.(0x000000)), 110); if (this.currentStats.health <= 0) this.ayshPeula?.("player defeated", this); return damage; }
  getCombatBonus() { return 1; }
}
ChasveiAwtsmoos.emanate(Chossid.prototype, [controlMethods, interactionMethods, lifecycleMethods, visualMethods, updateMethods, inventorySetupMethods]);
