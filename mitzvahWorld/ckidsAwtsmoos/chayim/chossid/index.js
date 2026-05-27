

/**
 * B"H
 * Player = Chossid
 */
import * as THREE from '/games/scripts/build/three.module.js';
import InventoryManager from '../../systems/InventoryManager.js';
import Medabeir from '../medabeir.js';

// Import Methods
import controlMethods from './methods/controls.js';
import interactionMethods from './methods/interaction.js';
import lifecycleMethods from './methods/lifecycle.js';
import visualMethods from './methods/visuals.js';
import updateMethods from './methods/update.js';
import inventorySetupMethods from './methods/inventory-setup.js'; // B"H

export default class Chossid extends Medabeir {
    type = "chossid";
    rayLength = 50;
    
    _optionsSpeed = null;
    approachedEntities = [];
    
    constructor(options, olam) {
        super(options, olam);
        this.inventory = new InventoryManager(this);
        this.selectedInventorySlot = 0;
        
        this.rotateOffset = 0;
        this.optionsSpeed = options.speed;
    }
}

// B"H - Apply Modular Methods
Object.assign(Chossid.prototype, controlMethods);
Object.assign(Chossid.prototype, interactionMethods);
Object.assign(Chossid.prototype, lifecycleMethods);
Object.assign(Chossid.prototype, visualMethods);
Object.assign(Chossid.prototype, updateMethods);
Object.assign(Chossid.prototype, inventorySetupMethods); // B"H
