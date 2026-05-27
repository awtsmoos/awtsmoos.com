

/**
 * B"H
 * @file tzomayaach.js
 * for now: things that can be
 * interacted with, like clicked, 
 * or if close enough can press
 * a
 * key or something to activate something 
 * else.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import Domem from "./domem.js";
import Utils from "../utils.js";
export default class Tzomayach extends Domem {
    type = "tzomayach";
    
    constructor(options, olam) {
        super(options, olam);
        this.heesHawveh = true;
        
        // B"H: If it's interactable but has no proximity, give it a small default to enable the loop
        let p = options.proximity;
        if(options.interactable && (p === undefined || p === null || p <= 0)) {
            p = 1.0; 
        }

        this.proximity = (typeof(p) == "number") ? p : 0;
        
		this.on("sealayk",() => {
            
			if(this.proximityCollider) {
				this.proximityCollider = null;
			}
		});
        // Additional properties can be set here
    }

    /**
     * @property {Number} proximity
     * represents the radius surrounding the
     * object with which it can be interacted with.
     * 
     * For example when a player (or anything)
     * gets close enough, based on this number,
     * it can activate something, or at least the
     * possibility for something. 
     */
    proximity = 0;

    /**
     * @property {THREE.Sphere} proximityCollider
     * a spehre object that represents the radius
     * with which it can be collided with to be
     * interacted with by other objects.
     * 
     * Initializes in first iteration of update loop
     * if proximity is more than 0;
     */
    proximityCollider = null;

    /**
     * @property {Array} objectsCollidingWith
     * represents the number of objects that
     * are currently within the given
     * proximity. 
     * 
     */
    objectsCollidingWith = [];
    async heescheel(olam) {
        await super.heescheel(olam);
        // Implement Tzomayach-specific behavior here
    }

    async ready() {
        await super.ready();
        
    }
    
	async afterBriyah() {
		await super.afterBriyah(this)
	}

    /**
     * @method heesHawvoos 
     * AKA "creation", happens
     * every frame as its "recreated"
     * @param {*} deltaTime 
     */
    heesHawvoos(deltaTime) {
        super.heesHawvoos(deltaTime);
      
        if(this.proximity > 0) {
            
            // B"H: Safety check - ensure mesh exists
            if(!this.mesh) return;

            if(!this.proximityCollider) {
                // B"H: Initialize proximity sphere if missing
                this.proximityCollider = 
                new THREE.Sphere(
                    this.mesh.position.clone(),
                    this.proximity
                );
            } else if(this.olam) {
                // B"H: Always update proximity collider to current mesh position
                this.proximityCollider.center.copy(this.mesh.position);
                
                var interactables = this.olam.interactableNivrayim;

                if(
                    interactables &&
                    interactables.length
                ) {
                   
                    interactables.forEach(n => {
                        /**
                         * B"H: Prevent self-interaction!
                         * A soul cannot shake its own hand in the physical world.
                         */
                        if (n === this) return;

                        /**
                         * go through each
                         * nivra that can be 
                         * interacted with.
                         * 
                         **/


                        /**
                         * Only check interactions
                         * with nivrayim that have
                         * a capsule collider
                         * 
                         * B"H: Strict check as requested, but safely accessed
                         */
                        var isCapsule = false;
                        try {
                             if(
                                n.collider &&
                                n.collider.constructor &&
                                n.collider.constructor.name == "Capsule"
                            ) {
                                isCapsule = true;
                            }
                        } catch(e) {
                           // Silent fail
                        }

                        if(isCapsule) {
                            
                            // B"H: HYSTERESIS LOGIC
                            // Use a slightly larger radius for EXITing than ENTERing.
                            // This prevents rapid flickering when standing on the edge.
                            
                            const isAlreadyColliding = this.objectsCollidingWith.includes(n);
                            
                            // If already colliding, we allow a buffer (e.g. 1.2x distance) before disconnecting
                            const effectiveRadius = isAlreadyColliding ? 
                                this.proximityCollider.radius * 1.2 : 
                                this.proximityCollider.radius;

                            // Create a temporary sphere with the effective radius for the check
                            const checkSphere = {
                                center: this.proximityCollider.center,
                                radius: effectiveRadius
                            };

                            if(
                                /**
                                 * check if sphere,
                                 * proximity indicator,
                                 * is colliding
                                 * with nivra's capsule
                                 * collider
                                 * 
                                 */
                                Utils.capsuleSphereColliding(
                                    n.collider,
                                    checkSphere
                                )
                            ) {
                               
                                /**
                                 * we are interacting / colliding
                                 * with the proper kind of nivra.
                                 * 
                                 * Now, do something.
                                 */


                                if(!isAlreadyColliding) {
                                    /**
                                     * * If we are NOT 
                                    * already colliding with it,
                                    * then add it to the 
                                    * list of currently 
                                    * colliding nivrayim
                                    * and fire an event that 
                                    * this nivra has entered
                                    * the interactive zone.
                                    */
									
                                    this.objectsCollidingWith.push(n);
                                    this.ayshPeula(
                                        "nivraNeechnas"/**
                                        creation entered */,
                                        n,
                                        this
                                    );
									
                                }
                            } else {
                                /**
                                 * if NOT currently colliding
                                 * with a nivra that we were
                                 * earlier colliding with,
                                 * it means that it left
                                 * the area, so we 
                                 * need to check IF we were
                                 * previously colliding with it
                                 * (if it was in our collision array),
                                 * and if so, if we now aren't,
                                 * then we remove it, and fire an 
                                 * event that this nivra left the area.
                                 * 
                                 */

                                if(isAlreadyColliding) {
                                    /**
                                     * remove it from array
                                     * of currently colliding
                                     * objects, since we aren't
                                     * anymore.
                                     */
                                    this.objectsCollidingWith
                                    .splice(
                                        this.objectsCollidingWith
                                        .indexOf(n), 1
                                    );
                                    
                                    this.ayshPeula(
                                        "nivraYotsee"/**
                                        nivra left */, 
                                        n,
                                        this
                                    );
                                }
                            }
                        }

                        
                    });
                }
            }
        }
    }


}
