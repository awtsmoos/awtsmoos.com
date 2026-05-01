
/**
 * B"H
 * @module Chossid
 * @description
 * * Chapter 12: The Chossid - The Soul of Interaction
 */
import * as THREE from '/games/scripts/build/three.module.js';
import InventoryManager from '../../systems/InventoryManager.js';
import Medabeir from '../medabeir/index.js';

// Import Modular Faculties
import controlMethods from './methods/controls.js';
import interactionMethods from './methods/interaction.js';
import lifecycleMethods from './methods/lifecycle.js';
import visualMethods from './methods/visuals.js';
import updateMethods from './methods/update.js';
import inventorySetupMethods from './methods/inventory-setup.js'; 

export default class Chossid extends Medabeir {
    type = "chossid";
    rayLength = 50;
    _optionsSpeed = null;
    approachedEntities =[];
    
    constructor(options, olam) {
        super(options, olam);
        this.inventory = new InventoryManager(this);
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
}

Object.assign(Chossid.prototype, controlMethods);
Object.assign(Chossid.prototype, interactionMethods);
Object.assign(Chossid.prototype, lifecycleMethods);
Object.assign(Chossid.prototype, visualMethods);
Object.assign(Chossid.prototype, updateMethods);
Object.assign(Chossid.prototype, inventorySetupMethods);
