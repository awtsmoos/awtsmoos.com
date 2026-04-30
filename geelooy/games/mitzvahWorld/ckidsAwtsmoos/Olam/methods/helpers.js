
/**
 * B"H
 * @file helpers.js
 * @description
 * 🌌 THE CONSOLIDATION OF ATTRIBUTES (MIDDOT) 🌌
 */

import * as THREE from '/games/scripts/build/three.module.js';
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js';
import Utils from '../../utils.js';
import ShlichusHandler from "../../shleechoosHandler.js";

import LoadersModule from "./helpers/loaders/index.js";
import generateThreeJsMesh from './helpers/generateMesh.js';
import TransformsModule from "./helpers/transforms.js";
import StateModule from "./helpers/state.js";

export default class HelpersBridge {
    
    // --- 1. LOADER HUB ---
    async loadGLTF(url) {
        return await LoadersModule.loadGLTF.call(this, url);
    }
    
    async loadTexture(options) {
        return await LoadersModule.loadTexture.call(this, options);
    }

    async generateThreeJsMesh(golem) {
        return await generateThreeJsMesh(golem, this);
    }

    // --- 2. TRANSFORMATION HUB ---
    getForwardVector() { return TransformsModule.getForwardVector.call(this); }
    getSideVector() { return TransformsModule.getSideVector.call(this); }
    refreshCameraAspect() { return TransformsModule.refreshCameraAspect.call(this); }
    getTransformation(child) { return TransformsModule.getTransformation.call(this, child); }
    setMeshOnTop(s, t) { return TransformsModule.setMeshOnTop.call(this, s, t); }
    placePlaneOnTopOfBox(p, b) { return TransformsModule.placePlaneOnTopOfBox.call(this, p, b); }

    // --- 3. STATE HUB ---
    serialize() { return StateModule.serialize.call(this); }
    getCompiledNivrayimInfo() { return StateModule.getCompiledNivrayimInfo.call(this); }
    getGameState() { return StateModule.getGameState.call(this); }
    setGameState(state) { return StateModule.setGameState.call(this, state); }

    // --- 4. SYSTEM HUB ---
    startShlichusHandler() {
        this.shlichusHandler = new ShlichusHandler(this); 
    }

    async fetchGetSize(url) {
        return await Utils.fetchGetSize(url);
    }

    async fetchWithProgress(url, options = {}, otherOptions) {
        return await Utils.fetchWithProgress(url, options, otherOptions);
    }

    go(ob, id=this.official) {
        return Utils.go(ob, id);
    }

    callMethods(baseObj, methods) {
        return Utils.callMethods(baseObj, methods);
    }

    async getIconFromType(type) {
        let icon;
		if (type && typeof type === "string") {
			const collectableItem = AWTSMOOS[type];
			if(collectableItem && collectableItem.iconId) {
				icon = collectableItem.iconId;
			}
		}
		let iconData = null;
		if (typeof icon === "string") {
			try {
				const iconic = await import("../../../icons/items/" + icon + ".js");
				if(iconic && iconic.default) {
					iconData = iconic.default;
				}
			} catch(e) {
				return null;
			}
		}
		return iconData;
    }

    async htmlActions(ar) {
        return await this.ayshPeula("htmlActions", ar);
    }
    
    async htmlAction(shaym, properties, methods, selector) {
        if(typeof shaym === "object") {
            properties = shaym.properties;
            methods = shaym.methods;
            selector = shaym.selector;
            shaym = shaym.shaym;
        }
        return await this.ayshPeula("htmlAction", { shaym, properties, methods, selector });
    }

    async heescheel() {
        this.isHeesHawvoos = true;
    }
}
