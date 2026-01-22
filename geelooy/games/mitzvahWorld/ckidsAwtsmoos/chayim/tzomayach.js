// B"H
/**
 * Tzomayach - Entities that flourish and interact within the Olam.
 * Represents inanimate matter with a spiritual spark of connectivity.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import Domem from "./domem.js";
import Utils from "../utils.js";

export default class Tzomayach extends Domem {
    type = "tzomayach";
    
    constructor(options, olam) {
        super(options, olam);
        this.heesHawveh = true;
        
        let p = options.proximity;
        if(options.interactable && (p === undefined || p === null || p <= 0)) {
            p = 4.0; // B"H: Increased default to be more forgiving
        }

        this.proximity = (typeof(p) == "number") ? p : 0;
        
		this.on("sealayk",() => {
			if(this.proximityCollider) {
				this.proximityCollider = null;
			}
		});
    }

    proximity = 0;
    proximityCollider = null;
    objectsCollidingWith = [];

    async heescheel(olam) {
        await super.heescheel(olam);
    }

    async ready() {
        await super.ready();
    }
    
	async afterBriyah() {
		await super.afterBriyah(this)
	}

    /**
     * heesHawvoos - Constant recreation of the vessel.
     * Manages proximity events and triggers interaction potentials.
     */
    heesHawvoos(deltaTime) {
        super.heesHawvoos(deltaTime);
      
        if(this.proximity > 0 && this.mesh) {
            if(!this.proximityCollider) {
                this.proximityCollider = new THREE.Sphere(this.mesh.position.clone(), this.proximity);
            } else if(this.olam) {
                this.proximityCollider.center.copy(this.mesh.position);
                
                var interactables = this.olam.interactableNivrayim;

                if(interactables && interactables.length) {
                    interactables.forEach(n => {
                        if (n === this) return;

                        var isCapsule = n.collider && n.collider.constructor && n.collider.constructor.name == "Capsule";

                        if(isCapsule) {
                            const isAlreadyColliding = this.objectsCollidingWith.includes(n);
                            
                            // B"H: Hysteresis - larger exit radius to prevent flickering
                            const effectiveRadius = isAlreadyColliding ? 
                                this.proximityCollider.radius * 1.35 : 
                                this.proximityCollider.radius;

                            const checkSphere = {
                                center: this.proximityCollider.center,
                                radius: effectiveRadius
                            };

                            if(Utils.capsuleSphereColliding(n.collider, checkSphere)) {
                                if(!isAlreadyColliding) {
                                    this.objectsCollidingWith.push(n);
                                    
                                    /**
                                     * B"H: The Spark of Connection
                                     * If a soul (Chossid) enters an interactable's field, illuminate the path to speech.
                                     */
                                    this.ayshPeula("nivraNeechnas", n, this);
                                    
                                    if (n.type === 'chossid' && this.interactable) {
                                         // Automatically show the "Press B" prompt via UI event
                                         this.olam.htmlAction({
                                            shaym: "approach npc msg",
                                            properties: { textContent: this.name },
                                            methods: { classList: { remove: "hidden" } }
                                         });
                                    }
                                }
                            } else if(isAlreadyColliding) {
                                this.objectsCollidingWith.splice(this.objectsCollidingWith.indexOf(n), 1);
                                this.ayshPeula("nivraYotsee", n, this);
                                
                                if (n.type === 'chossid') {
                                     this.olam.htmlAction({
                                        shaym: "approach npc msg",
                                        methods: { classList: { add: "hidden" } }
                                     });
                                }
                            }
                        }
                    });
                }
            }
        }
    }
}
