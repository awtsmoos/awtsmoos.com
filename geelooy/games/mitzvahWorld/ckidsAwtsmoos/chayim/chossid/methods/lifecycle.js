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

        self.defaultGarments = {
            jacket: { 
                id: 'chossid_jacket_default',
                className: 'Apparel',
                name: 'Chossid Jacket',
                description: 'A traditional jacket.',
                icon: '/games/mitzvahWorld/icons/items/jacket.svg'
            },
            yarmulke: { 
                id: 'chossid_yarmulke_default',
                className: 'Apparel',
                name: 'Kippah',
                description: 'A sign of reverence.',
                icon: '/games/mitzvahWorld/icons/items/yarmulke.svg'
            }
        };

        if (self.modelMesh) {
            self.modelMesh.traverse((child) => {
                if (child.isMesh) child.frustumCulled = false;
                if(child?.name == ("body")) {
                    self.updateDimensionsFromModel(child);
                    self.olam.ayin.target = self;
	            }
                if(self.defaultGarments && self.defaultGarments[child.name]) {
                    if(!self.garments) self.garments = {};
                    self.garments[child.name] = child;
                }
            });

            if (self.garments && self.garments.jacket) {
                self.inventory.equipment.jacket = self.defaultGarments.jacket;
            }
            if (self.garments && self.garments.yarmulke) {
                self.inventory.equipment.head = self.defaultGarments.yarmulke;
            }
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
        
	    this.inventory.addItem({
            id: 'sparks_hammer',
            className: 'Tool', 
            name: 'Sparks Collector',
            description: 'Use this to retrieve sparks (blocks) from the world.',
            icon: '/games/mitzvahWorld/icons/items/hammer.svg'
        }, 1);
        
        this.inventory.addItem({
            id: 'neshama_maker',
            className: 'CharacterMaker',
            name: 'Neshama Maker',
            description: 'Design and create new souls.',
            icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjIwMCIgZmlsbD0iIzRmNDRmNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIi8+PHBhdGggZD0iTTE1NiAxNTZhMTAwIDEwMCAwIDAgMSAyMDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
        }, 1);

        // Default Building Blocks
	    this.inventory.addItem({
	        id: 'brick_1x1x1',
	        className: 'Brick',
	        name: 'Standard Brick',
	        description: 'A classic 1x1x1 brick.'
	    }, 64);
	
	    this.inventory.addItem({
	        id: 'brick_2x2x2',
	        className: 'Brick',
	        name: 'Cube Brick',
	        description: 'A large 2x2x2 brick.',
	        dimensions: { x: 2, y: 2, z: 2 }
	    }, 32);
	
	    this.inventory.addItem({
	        id: 'brick_1x1x4',
	        className: 'Brick',
	        name: 'Plank Brick',
	        description: 'A long 1x1x4 plank.',
	        dimensions: { x: 1, y: 1, z: 4 }
	    }, 16);
	    
	    this.inventory.addItem({
	        id: 'brick_1x0.5x2',
	        className: 'Brick',
	        name: 'Thin Plank Brick',
	        description: 'A long 1x0.5x2 plank',
	        dimensions: { x: 1, y: 0.5, z: 2 }
	    }, 1024);
	    
	    this.inventory.addItem({
	        id: 'brick_4x0.25x4',
	        className: 'Brick',
	        name: 'Thin Plane Brick',
	        description: 'A long 4x0.25x4 plane',
	        dimensions: { x: 4, y: 0.25, z: 4 }
	    }, 1024);
	    
	    this.inventory.addItem({
	        id: 'brick_40x0.25x40',
	        className: 'Brick',
	        name: 'Giant Brick Plane',
	        description: 'A long 40x0.25x40 plane',
	        dimensions: { x: 40, y: 0.25, z: 40 }
	    }, 1024);
	    
	    this.inventory.addItem({
	        id: 'stairs_brick_1',
	        className: 'Stairs',
	        name: 'Brick Stairs',
	        description: 'Stairs to reach higher levels.',
	        dimensions: { x: 1, y: 1, z: 1 } 
	    }, 64);
	    
	    this.inventory.addItem({
	        id: 'stairs_wide_4',
	        className: 'Stairs',
	        name: 'Wide Stairs',
	        description: 'A very wide staircase (4x1x1).',
	        dimensions: { x: 4, y: 1, z: 1 } 
	    }, 100);

        this.inventory.addItem({
	        id: 'stairs_tall_2',
	        className: 'Stairs',
	        name: 'Tall Stairs',
	        description: 'Steep stairs reaching 2 units high.',
	        dimensions: { x: 2, y: 2, z: 2 } 
	    }, 50);

        this.inventory.addItem({
	        id: 'stairs_grand',
	        className: 'Stairs',
	        name: 'Grand Staircase',
	        description: 'A massive 4x4x4 staircase.',
	        dimensions: { x: 4, y: 4, z: 4 } 
	    }, 50);
    }
};