
/**
 * B"H
 * @file lifecycle.js
 * Lifecycle methods for the Medabeir entity.
 * "From the void, the soul is drawn down, clothed in garments of light."
 * 
 * Chapter 4: The Breath of Life.
 * We must ensure the soul has movement (Ruach). If the entity is a Speaker, 
 * we must ignite its animation cycle immediately upon creation.
 */
import Chai from "../../chai/index.js";

export default {
    async heescheel(olam) {
        // B"H: THE DECREE OF MOVEMENT
        // All speakers must pulse with life.
        this.heesHawveh = true;

        await Chai.prototype.heescheel.call(this, olam);
        
        if(this.garments) {
	        var keys = Object.keys(this.garments);
            var defaults = this.garmentsDefault || {}; 
	        keys.forEach(k => {
		        if(!defaults[k] && this.garments[k]) {
			        this.garments[k].visible = false;
		        }
	        });
        }
        
        if(this.goofOptions && typeof(this.goofOptions) == "string" && this.goofOptions.startsWith("awtsmoos://")) {
            this.goofOptions = olam.getComponent(this.goofOptions);
        }
    },
	
	async afterBriyah() {
		await Chai.prototype.afterBriyah.call(this, this);
	},

    async ready() {
        // B"H: silent

        
        if(this.dialogue) {
            this.handleDialogue();
        }
        
        if (typeof this.setupGoof === 'function') {
            this.setupGoof();
        }
        
        await Chai.prototype.ready.call(this);

        // B"H: THE ANIMATION SPARK
        // If the soul has a body and a mixer, we start the first breath.
        if (this.animationMixer && this.animations && this.animations.length > 0) {
            // B"H: silent

            // Try to play 'idle' by default, or the first available clip
            const idle = this.animations.find(a => a.name.toLowerCase().includes('idle'));
            const first = idle ? idle.name : this.animations[0].name;
            if (this.playChaweeyoos) {
                this.playChaweeyoos(first);
            }
        }
    },

    heesHawvoos(deltaTime) {
        // B"H: Standard Chai (Living) update loop
        Chai.prototype.heesHawvoos.call(this, deltaTime);
    }
};
