







/**
 * B"H
 * @file lifecycle.js
 * Initialization logic for the player.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Medabeir from "../../medabeir/index.js";

export default {
    async heescheel(olam) {
        await Medabeir.prototype.heescheel.call(this, olam);
        this.setPosition(new THREE.Vector3());
        
        this.on("you approached", npc => {
            var exists = this.approachedEntities.indexOf(npc);
            if(exists < 0) this.approachedEntities.push(npc);
        });

        var removeNpc = npc => {
            if(!npc) return;
            var ind = this.approachedEntities.indexOf(npc);
            if(ind > -1) this.approachedEntities.splice(ind, 1);
        };

        this.on("the dialogue was closed from", npc => removeNpc(npc));
        this.on("you moved away from", npc => removeNpc(npc));

        this.setupInputListeners(olam);
    },

    async ready() {
        await Medabeir.prototype.ready.call(this);
	    
        this.olam.chossid = this;
        this.olam.player = this;
        this.olam.ayin.target = this;
        
        this.inventory.hydrateItems();
        
        if(this.optionsSpeed) {
            this.speed = this.optionsSpeed;
        }

        var self = this;
        
        // B"H: The EXACT names provided by the user
        const targetGarments = [
            "jacket",
            "jacket-teffilin",
            "outer-shirt",
            "teffilin-arm-straps",
            "glasses",
            "head-teffilin-straps",
            "teffilin-head-box",
            "top-hat",
            "teffiln-arm-box",
            "yamulka" // Adding this just in case
        ];

        if (self.modelMesh) {
            if(!self.garments) self.garments = {};

            self.modelMesh.traverse((child) => {
                if (child.isMesh) child.frustumCulled = false;
                
                if(child?.name == ("body")) {
                    self.updateDimensionsFromModel(child);
                    self.olam.ayin.target = self;
	            }

                // B"H: Explicit Registration
                if (targetGarments.includes(child.name)) {
                    self.garments[child.name] = child;
                    // Default to hidden to let updateAppearance handle it
                    child.visible = false; 
                }
            });

            // B"H: Force an update now that we have the meshes
            // If default equipment exists (like a jacket), this will show it.
            if (!self.inventory.equipment.jacket && self.garments["jacket"]) {
                // If nothing equipped, maybe default to jacket?
                // Or rely on inventory saving.
            }
            
            // This call is crucial to set initial state correctly
            self.updateAppearance();
            self.inventory.updateUI();
        }
    },

    async afterBriyah() {
		await Medabeir.prototype.afterBriyah.call(this, this);
		
	    this.olam.ayshPeula("save player position");
	    this.distanceFromRay = 5; 

	    this.on("activeObjectAction", async a => {
	        if(this.selected) {
	            var act = this.actionList[a];
	            if(act) act?.(this);
	            var dist = this?.intersected?.hit?.distance;
	            if(dist) this.distanceFromRay = dist;
	        }
	    });

	    this.olam.on("mousemove", e => {
	        if(!this.activeRay) {
	            if(this.olam.isLookingForSomething) this.olam.isLookingForSomething = false;
	            return;
	        }

	        if(this.activeObject) {
	            if(this.olam.isLookingForSomething) this.olam.isLookingForSomething = false;
	            return;
	        }
	        if(!this.olam.isLookingForSomething) this.olam.isLookingForSomething = true;

	        this.checkHover(this.olam);
	    });

	    this.olam.on("wheel", ({deltaY}) => {
	        if(this.activeObject) {
	            var baseFactor = 0.003;
	            var factor = baseFactor * Math.max(0.5, Math.min(2, this.distanceFromRay / 10));
	            this.distanceFromRay += deltaY * factor; 
	            this.distanceFromRay = Math.max(1, Math.min(this.rayLength, this.distanceFromRay)); 
	            this.setDistanceFromRay(this.distanceFromRay);
	        } else {
	            this.olam.ayin.deltaY = deltaY;
	            this.olam.ayin.zoom(deltaY);
	        }
	    });
	},

    async started() {
        this.iconPath = "chossid.svg";
        this.iconType = "centered";
        
        await this.olam?.minimap?.setMinimapItems?.([this], "chossid");
        
        // B"H: Initialize Inventory via the dedicated module
        if (typeof this.setupDefaultInventory === 'function') {
            this.setupDefaultInventory();
        }
    }
};