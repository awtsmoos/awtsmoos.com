
/**
 * B"H
 * @module Chossid
 * @description
 * * Chapter 12: The Chossid - The Soul of Interaction
 */
import * as THREE from '/games/scripts/build/three.module.js';
import InventoryManager from '../../systems/InventoryManager.js';
import StudyManager from '../../systems/StudyManager.js';
import MadreigaSystem from '../../systems/MadreigaSystem.js';
import Medabeir from '../medabeir/index.js';

import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';

// Import Modular Faculties
import controlMethods from './methods/controls.js';
import interactionMethods from './methods/interaction.js';
import lifecycleMethods from './methods/lifecycle.js?v=old-camera-distance-20260527';
import visualMethods from './methods/visuals.js';
import updateMethods from './methods/update.js';
import inventorySetupMethods from './methods/inventory-setup.js'; 

export default class Chossid extends Medabeir {
    type = "chossid";
    rayLength = 50;
    _optionsSpeed = null;
    approachedEntities =[];
    
    constructor(options, olam) {
        options = options || {};
        options.path = null;
        options.golem = options.golem || {
            guf: { BoxGeometry: [1.1, 2.2, 1.1] },
            toyr: { MeshLambertMaterial: { color: 0x1f6fff } }
        };
        options.height = options.height || 2.2;
        options.radius = options.radius || 0.45;
        options.speed = options.speed || 6;
        options.isSolid = false;
        super(options, olam);
        this.speedScale = 1;
        
        // B"H: Spiritual Attributes
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

        this.inventory = new InventoryManager(this);
        this.studyManager = new StudyManager(this);
        this.madreigaSystem = new MadreigaSystem(this);
        
        this.slottedPassages = []; // Max 4 for the Action Bar
        this.selectedInventorySlot = 0;
        
        /**
         * B"H: THE NATURAL GROUNDING
         * With the `visualYOffset` math rectified, we no longer need an artificial 
         * massive downward force. The heels will perfectly align with the floor.
         */
        this.groundingOffset = 0; 
        
        this.rotateOffset = 0;
        this.optionsSpeed = options.speed;
        
        this.on("jumped", () => {
             if (this.olam) {
                 this.olam.ayshPeula("ui event", "effectsOverlay", { triggerDynamicJump: this.jumpHeight || 10 });
             }
        });
        
        this._lastVelocityY = 0;
        this.on("heesHawvoos", () => {
             if (this.velocity && this.velocity.y < 0) {
                 this._lastVelocityY = this.velocity.y;
             }
        });

        this.on("hit floor", () => {
             if (this.olam) {
                 this.olam.ayshPeula("ui event", "effectsOverlay", { triggerDynamicImpact: this._lastVelocityY });
             }
             this._lastVelocityY = 0;
        });

        this._stepTimer = 0;
        this.on("started walking", () => { this._isWalking = true; });
        this.on("stopped walking", () => { this._isWalking = false; });

        // B"H: Listen for approaches to interactables (doors, etc)
        this.on("approached tzomayach", (entity) => {
            if (!this.approachedEntities.includes(entity)) {
                this.approachedEntities.unshift(entity); // Add to front of stack
            }
        });
        
        this.on("left tzomayach", (entity) => {
            const idx = this.approachedEntities.indexOf(entity);
            if (idx > -1) {
                this.approachedEntities.splice(idx, 1);
            }
        });

        this.on("heesHawvoos", (dt) => {
            if (this._isWalking && this.onFloor) {
                this._stepTimer += dt;
                const stepThreshold = this.moving.running ? 0.25 : 0.4;
                if (this._stepTimer > stepThreshold) {
                    this._stepTimer = 0;
                    if (this.olam) this.olam.ayshPeula("ui event", "effectsOverlay", { triggerDynamicStep: true });
                }
            } else {
                this._stepTimer = 0;
            }
        });
    }

    /**
     * B"H: Marks only the capsule anchor as the player vessel.
     * The loaded GLB remains untouched, exactly like an NPC model after loading.
     */
    async madeAll() {
        if (this.mesh) {
            this.mesh.userData.isPlayer = true;
        }
        this.recalculateStats();
    }

    /**
     * B"H: Recalculate all soul-stats.
     */
    recalculateStats() {
        const torahBonuses = this.studyManager.getBonuses();
        const apparelStats = { chochmah: 0, binah: 0, daas: 0, defense: 0, attack: 0 };

        // Sum up equipped apparel
        if (this.inventory && this.inventory.equipment) {
            for (const item of Object.values(this.inventory.equipment)) {
                if (item && item.type === "apparel") {
                    apparelStats.chochmah += item.chochmah || 0;
                    apparelStats.binah += item.binah || 0;
                    apparelStats.daas += item.daas || 0;
                    apparelStats.defense += item.defense || 0;
                    apparelStats.attack += item.attack || 0;
                }
            }
        }

        this.currentStats.chochmah = this.baseStats.chochmah + torahBonuses.chochmah + apparelStats.chochmah;
        this.currentStats.binah = this.baseStats.binah + torahBonuses.binah + apparelStats.binah;
        this.currentStats.daas = this.baseStats.daas + torahBonuses.daas + apparelStats.daas;
        
        this.currentStats.defense = this.baseStats.defense + torahBonuses.defense + apparelStats.defense;
        this.currentStats.attack = this.baseStats.attack + torahBonuses.attack + apparelStats.attack;
        
        this.currentStats.maxHealth = this.baseStats.health + torahBonuses.health;
        this.currentStats.speed = this.baseStats.speed * torahBonuses.speed;

        // B"H: Trigger UI updates if needed
        if (this.olam) {
            this.olam.ayshPeula("ui event", "gameHUD", { updateStats: {
                hp: this.currentStats.health || this.currentStats.maxHealth || 100,
                maxHp: this.currentStats.maxHealth || 100,
                koach: this.currentStats.koach || 50,
                maxKoach: this.currentStats.maxKoach || 50,
                xp: this.currentStats.xp || 0,
                level: this.currentStats.level || 1
            }});
        }
    }

    /**
     * B"H: Get special bonuses against specific enemies.
     * @param {Object} enemy 
     */
    getCombatBonus(enemy) {
        const specials = this.studyManager.getBonuses().specials;
        let multiplier = 1;

        if (specials.includes("mazik_vision") && enemy.type === "mazik") {
            multiplier *= 1.2; // 20% more damage against Mazikim
        }
        
        // Dynamic bonuses based on PaRDeS levels can be expanded here
        return multiplier;
    }

}

// B"H - Grafting the modular limbs onto the trunk with Divine Emanation
ChasveiAwtsmoos.emanate(Chossid.prototype, [
    controlMethods,
    interactionMethods,
    lifecycleMethods,
    visualMethods,
    updateMethods,
    inventorySetupMethods
]);
