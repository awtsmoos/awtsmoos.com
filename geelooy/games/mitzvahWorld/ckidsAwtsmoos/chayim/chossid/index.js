// B"H
/**
 * @module Chossid
 * @description
 * Chapter 413: The player enters as one living root.
 *
 * The Awtsmoos reveals a Chossid as a single covenant: input, collider, camera,
 * model, and fallback must all point to the same living root. This constructor
 * now drinks from the visible-root Chai seal so the robe is not merely loaded,
 * but fastened to the body that the joystick moves.
 */
import InventoryManager from '../../systems/InventoryManager.js';
import Chai from "../chai/index.js?v=visible-root-binding-20260610-bh710";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';
import controlMethods from './methods/controls.js?v=direct-mobile-move-20260610-bh704';
import interactionMethods from './methods/interaction.js?v=explicit-npc-click-payload-20260604-bh447';
import lifecycleMethods from './methods/lifecycle.js?v=visible-root-binding-20260610-bh710';
import visualMethods from './methods/visuals.js?v=lean-l1-20260528-bh36';
import updateMethods from './methods/update.js?v=visible-root-binding-20260610-bh710';
import inventorySetupMethods from './methods/inventory-setup.js?v=lean-l1-20260528-bh36';

function leanGolem() { return { guf: { BoxGeometry: [0.9, 1.8, 0.55] }, toyr: { MeshLambertMaterial: { color: 0x1f6fff } } }; }
function makeInventory(chossid) { const inventory = new InventoryManager(chossid); inventory.equipment ||= {}; inventory.slots ||= []; inventory.actionSlots ||= []; return inventory; }

export default class Chossid extends Chai {
  type = "chossid";
  rayLength = 50;
  approachedEntities = [];

  constructor(options = {}, olam) {
    const lean = options.leanBody === true;
    if (lean) { delete options.path; options.golem ||= leanGolem(); options.skipDefaultInventory = true; }
    else if (!Object.prototype.hasOwnProperty.call(options, "path")) options.path = "awtsmoos://awduhm";
    options.height ||= 1.5;
    options.radius ||= 0.45;
    options.visualGroundBiasY = 0;
    options.speed ||= lean ? 16 : 18;
    options.rotationSpeed ||= 4.2;
    options.lerpTurnSpeed ||= 0.38;
    options.movementResponsiveness ||= 18;
    options.stopResponsiveness ||= 28;
    options.animationBlendDuration ||= 0.055;
    options.animationActionTimeScale ||= 1.18;
    options.animationSpeedScale ||= 1.2;
    options.isSolid = false;
    super(options, olam);
    this.isLeanPlatformerPlayer = lean;
    this.speed = options.speed;
    this._movementSpeed = options.speed;
    this._originalSpeed = options.speed;
    this.speedScale = Number.isFinite(options.speedScale) ? options.speedScale : 1.2;
    this.jumpHeight = options.jumpHeight || 13;
    this.baseStats = { chochmah: 10, binah: 10, daas: 10, health: 100, defense: 5, attack: 10, speed: options.speed };
    this.currentStats = { ...this.baseStats };
    this.inventory = makeInventory(this);
    this.slottedPassages = [];
    this.selectedInventorySlot = 0;
    this.groundingOffset = 0;
    this.rotateOffset = 0;
    this.placementRotation = 0;
    this.optionsSpeed = options.speed;
    this._lastVelocityY = 0;
    this._stepTimer = 0;
    this.__spikeDefeated = false;
    this.__spikeDeathControlsFrozen = false;
    this.installLeanSafeEvents();
  }

  installLeanSafeEvents() {
    this.on("started walking", () => { this._isWalking = true; });
    this.on("stopped walking", () => { this._isWalking = false; });
    this.on("approached tzomayach", entity => this.rememberApproach(entity));
    this.on("left tzomayach", entity => this.forgetApproach(entity));
  }
  onChossidStepBreath() {}
  getActiveItem() { const index = Number.isInteger(this.selectedInventorySlot) ? this.selectedInventorySlot : 0; return this.inventory?.actionSlots?.[index] || null; }
  getRealActiveItemInstance() { const item = this.getActiveItem(); if (item?.className === 'ElementalStaff') this.olam?.ayshPeula("toolAltAction", item); return item; }
  resetPreviewRotation() { this.placementRotation = 0; }
  shoot() {}
  rememberApproach(entity) { if (!this.approachedEntities.includes(entity)) this.approachedEntities.unshift(entity); }
  forgetApproach(entity) { const idx = this.approachedEntities.indexOf(entity); if (idx > -1) this.approachedEntities.splice(idx, 1); }
  async madeAll() { if (this.mesh) this.mesh.userData.isPlayer = true; this.updateAppearance?.(); this.setupDefaultInventory?.(); this.inventory?.updateUI?.(); this.recalculateStats(); }
  recalculateStats() { this.currentStats.maxHealth = this.baseStats.health; this.currentStats.health ||= this.currentStats.maxHealth; this.currentStats.speed = this.baseStats.speed; this.olam?.ayshPeula("ui event", "gameHUD", { updateStats: { hp: this.currentStats.health || 100, maxHp: this.currentStats.maxHealth || 100, koach: 50, maxKoach: 50, xp: 0, level: 1 } }); }
  getCombatBonus() { return 1; }
}

ChasveiAwtsmoos.emanate(Chossid.prototype, [controlMethods, interactionMethods, lifecycleMethods, visualMethods, updateMethods, inventorySetupMethods]);
