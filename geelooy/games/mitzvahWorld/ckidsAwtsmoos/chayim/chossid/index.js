// B"H
/**
 * @module Chossid
 * @description
 * Chapter 2: The lone walker sheds the crowded disguise.
 *
 * The Awtsmoos breathes a lean platformer player into Level 1. When a level
 * passes `leanBody: true`, this class refuses the old default Awduhm model and
 * uses a tiny local box-body instead. That prevents remote GLB payloads or
 * hidden model contents from looking like stacked NPCs at Dust Gate.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import InventoryManager from '../../systems/InventoryManager.js';
import Chai from "../chai/index.js";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';
import controlMethods from './methods/controls.js';
import interactionMethods from './methods/interaction.js';
import lifecycleMethods from './methods/lifecycle.js?v=lean-l1-20260528-bh6';
import visualMethods from './methods/visuals.js';
import updateMethods from './methods/update.js?v=lean-l1-20260528-bh6';
import inventorySetupMethods from './methods/inventory-setup.js?v=lean-l1-20260528-bh6';

/** Builds the small local player body used by lean platform levels. */
function leanGolem() {
  return {
    guf: { BoxGeometry: [0.9, 1.8, 0.55] },
    toyr: { MeshLambertMaterial: { color: 0x1f6fff } }
  };
}

/** Keeps legacy inventory calls alive while avoiding heavy starter payloads. */
function makeInventory(chossid) {
  const inventory = new InventoryManager(chossid);
  inventory.hydrateItems ||= () => {};
  inventory.updateUI ||= () => {};
  inventory.addItem ||= () => {};
  inventory.equipment ||= {};
  inventory.slots ||= [];
  inventory.actionSlots ||= [];
  return inventory;
}

export default class Chossid extends Chai {
  type = "chossid";
  rayLength = 50;
  _optionsSpeed = null;
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

    options.height ||= lean ? 2.0 : 2.2;
    options.radius ||= lean ? 0.42 : 0.45;
    options.speed ||= lean ? 10 : 6;
    options.isSolid = false;
    super(options, olam);

    this.isLeanPlatformerPlayer = lean;
    this.speedScale = 1;
    this.baseStats = {
      chochmah: 10,
      binah: 10,
      daas: 10,
      health: 100,
      defense: 5,
      attack: 10,
      speed: options.speed || 6
    };
    this.currentStats = { ...this.baseStats };
    this.inventory = makeInventory(this);
    this.slottedPassages = [];
    this.selectedInventorySlot = 0;
    this.groundingOffset = 0;
    this.rotateOffset = 0;
    this.optionsSpeed = options.speed;
    this._lastVelocityY = 0;
    this._stepTimer = 0;
    this.installLeanSafeEvents();
  }

  /** Connects only small platformer-safe events. */
  installLeanSafeEvents() {
    this.on("jumped", () => {
      this.olam?.ayshPeula("ui event", "effectsOverlay", { triggerDynamicJump: this.jumpHeight || 10 });
    });
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

  /** Small step/effect loop with no NPC or dialogue scan. */
  onChossidStepBreath(dt = 0) {
    if (this.velocity && this.velocity.y < 0) this._lastVelocityY = this.velocity.y;
    if (!(this._isWalking && this.onFloor)) {
      this._stepTimer = 0;
      return;
    }
    this._stepTimer += dt;
    const threshold = this.moving.running ? 0.25 : 0.4;
    if (this._stepTimer <= threshold) return;
    this._stepTimer = 0;
    this.olam?.ayshPeula("ui event", "effectsOverlay", { triggerDynamicStep: true });
  }

  /** Records the closest simple interactable. */
  rememberApproach(entity) {
    if (!this.approachedEntities.includes(entity)) this.approachedEntities.unshift(entity);
  }

  /** Removes an interactable from the approach stack. */
  forgetApproach(entity) {
    const idx = this.approachedEntities.indexOf(entity);
    if (idx > -1) this.approachedEntities.splice(idx, 1);
  }

  /** Marks the physical capsule as the player vessel. */
  async madeAll() {
    if (this.mesh) this.mesh.userData.isPlayer = true;
    this.updateAppearance?.();
    this.recalculateStats();
  }

  /** Recalculates only the stats needed by the HUD. */
  recalculateStats() {
    this.currentStats.maxHealth = this.baseStats.health;
    this.currentStats.health ||= this.currentStats.maxHealth;
    this.currentStats.speed = this.baseStats.speed;
    this.olam?.ayshPeula("ui event", "gameHUD", {
      updateStats: {
        hp: this.currentStats.health || 100,
        maxHp: this.currentStats.maxHealth || 100,
        koach: this.currentStats.koach || 50,
        maxKoach: this.currentStats.maxKoach || 50,
        xp: this.currentStats.xp || 0,
        level: this.currentStats.level || 1
      }
    });
  }

  /** Legacy combat hook kept inert for lean Level 1. */
  getCombatBonus() {
    return 1;
  }
}

ChasveiAwtsmoos.emanate(Chossid.prototype, [
  controlMethods,
  interactionMethods,
  lifecycleMethods,
  visualMethods,
  updateMethods,
  inventorySetupMethods
]);
