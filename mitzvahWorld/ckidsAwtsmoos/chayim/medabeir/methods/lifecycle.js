
/**
 * B"H
 * @file lifecycle.js
 * Lifecycle methods for the Medabeir entity.
 */
import Chai from "../../chai/index.js";

export default {
    async heescheel(olam) {
        await Chai.prototype.heescheel.call(this, olam);
        
        if(this.garments) {
	        var keys = Object.keys(this.garments);
	        keys.forEach(k => {
		        if(!this.garmentsDefault[k]) {
			        this.garments[k].visible = false;
		        }
	        })
        }
        
        // Handle Goof (Body) options if they are paths
        if(this.goofOptions && typeof(this.goofOptions) == "string" && this.goofOptions.startsWith("awtsmoos://")) {
            this.goofOptions = olam.getComponent(this.goofOptions)
        }
        if(this.goofOptions && typeof(this.goofOptions) == "object") {
            this.goofParts = this.goofOptions;
        }
    },
	
	async afterBriyah() {
		await Chai.prototype.afterBriyah.call(this, this)
	},

    async ready() {
        if(this.dialogue) {
            this.handleDialogue()  
        }
        
        this.setupGoof();
        
        await Chai.prototype.ready.call(this);
    },

    heesHawvoos(deltaTime) {
        Chai.prototype.heesHawvoos.call(this, deltaTime);
    }
};
