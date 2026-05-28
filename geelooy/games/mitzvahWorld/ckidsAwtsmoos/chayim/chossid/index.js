// B"H
/**
 * @module Chossid
 * @description
 * Chapter 5: The swift walker keeps his bag and sheds editor errors.
 *
 * The clean Level 1 pipeline keeps the good Chossid GLB, the fun inventory
 * vessel, and a small platformer-safe control surface. Cache-busted controls
 * remove stale building-preview calls such as resetPreviewRotation errors.
 */
import InventoryManager from '../../systems/InventoryManager.js';
import Chai from "../chai/index.js";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';
import controlMethods from './methods/controls.js?v=lean-l1-20260528-bh8';
import interactionMethods from './methods/interaction.js';
import lifecycleMethods from './methods/lifecycle.js?v=lean-l1-20260528-bh8';
import visualMethods from './methods/visuals.js';
import updateMethods from './methods/update.js?v=lean-l1-20260528-bh8';
import inventorySetupMethods from './methods/inventory-setup.js?v=lean-l1-20260528-bh8';

function leanGolem() {
  return {
    guf: { BoxGeometry: [0.9, 1.8, 0.55] },
    toyr: { MeshLambertMaterial: { color: 0x1f6fff } }
  };
}

function makeInventory(chossid) {
  const inventory = new InventoryManager(chossid);
  inventory.equipment ||= {};
  inventory.slots ||= [];
  inventory.actionSlots ||= [];
  return inventory;
}

export default class Chossid extends Chai {
  type = "chossid";
  rayLength = 50;
  approachedEntities = [];

  constructor(options = {}, olam) {
    const lean = options.leanBody === true;
    if (lean) {
      delete options.path;
      options.golem ||= leanGolem();
      options.skipDefaultInventory = true;
    } else if (!Object.prototype.hasOwnProperty.call(options, "path")) {
      options.path = "awtsmoos://awduhm";
    }

    options.height ||= lean ? 2.0 : 1.5;
    options.radius ||= lean ? 0.42 : 0.45;
    options.speed ||= lean ? 12 : 18;
    options.rotationSpeed ||= 3.25;
    options.isSolid = false;
    super(options, olam);

    this.isLeanPlatformerPlayer = lean;
    this.speed = options.speed;
    this._movementSpeed = options.speed;
    this._originalSpeed = options.speed;
    this.speedScale = lean ? 1.6 : 2.25;
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
    this.installLeanSafeEvents();
  }

  installLeanSafeEvents() {
    this.on("jumped", () => this.olam?.ayshPeula("ui event", "effectsOverlay", { triggerDynamicJump: this.jumpHeight || 10 }));
    this.on("heesHawvoos", dt => this.onChossidStepBreath(dt));
    this.on("hit floor", () => {
      this.olam?.ayshPeula("ui event", "effectsOverlay", { triggerDynamicImpact: this._lastVelocityY });
      this._lastVelocityY = 0;
    });
    this.on("started walking", () => { this._isWalking = true; });
    this.on("stopped walking", () => { this._isWalking = false; });
    this.on("approached tzomayach", entity => this.rememberApproach(entity));
    this.on("left tzomayach", entity => this.forgetApproach(entity));
  }

  onChossidStepBreath(dt = 0) {
    if (this.velocity && this.velocity.y < 0) this._lastVelocityY = this.velocity.y;
    if (!(this._isWalking && this.onFloor)) return void (this._stepTimer = 0);
    this._stepTimer += dt;
    if (this._stepTimer <= (this.moving.running ? 0.22 : 0.34)) return;
    this._stepTimer = 0;
    this.olam?.ayshPeula("ui event", "effectsOverlay", { triggerDynamicStep: true });
  }

  getActiveItem() {
    const index = Number.isInteger(this.selectedInventorySlot) ? this.selectedInventorySlot : 0;
    return this.inventory?.actionSlots?.[index] || null;
  }

  getRealActiveItemInstance() {
    const item = this.getActiveItem();
    if (item?.className === 'ElementalStaff') this.olam?.ayshPeula("toolAltAction", item);
    return item;
  }

  resetPreviewRotation() {
    this.placementRotation = 0;
  }

  shoot() {
    this.olam?.ayshPeula("ui event", "gameHUD", { tooltip: { show: true, text: "No active tool selected." } });
  }

  rememberApproach(entity) {
    if (!this.approachedEntities.includes(entity)) this.approachedEntities.unshift(entity);
  }

  forgetApproach(entity) {
    const idx = this.approachedEntities.indexOf(entity);
    if (idx > -1) this.approachedEntities.splice(idx, 1);
  }

  async madeAll() {
    if (this.mesh) this.mesh.userData.isPlayer = true;
    this.updateAppearance?.();
    this.setupDefaultInventory?.();
    this.inventory?.updateUI?.();
    this.recalculateStats();
  }

  recalculateStats() {
    this.currentStats.maxHealth = this.baseStats.health;
    this.currentStats.health ||= this.currentStats.maxHealth;
    this.currentStats.speed = this.baseStats.speed;
    this.olam?.ayshPeula("ui event", "gameHUD", {
      updateStats: { hp: this.currentStats.health || 100, maxHp: this.currentStats.maxHealth || 100, koach: 50, maxKoach: 50, xp: 0, level: 1 }
    });
  }

  getCombatBonus() { return 1; }
}

ChasveiAwtsmoos.emanate(Chossid.prototype, [
  controlMethods,
  interactionMethods,
  lifecycleMethods,
  visualMethods,
  updateMethods,
  inventorySetupMethods
]);
