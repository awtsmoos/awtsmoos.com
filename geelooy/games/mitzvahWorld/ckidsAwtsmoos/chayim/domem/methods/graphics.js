
/**
 * B"H
 * @file graphics.js
 * Shaders, textures, icons, and grass generation.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import TextureMixer from './graphics/textureMixer/index.js';

export default {
    disperseInstance(w, h) {
        if(this.instanced) {
            for (let i = 0; i < this.instanced; i++) {
                var position = new THREE.Vector3(
                    Math.random() * w, 0, Math.random() * h
                );
                var rotation = new THREE.Euler(0, Math.random() * Math.PI * 2, 0);
                var quaternion = new THREE.Quaternion().setFromEuler(rotation);
                var scale = new THREE.Vector3(1, Math.random() + 0.5, 1);
                var matrix = new THREE.Matrix4().compose(position, quaternion, scale);
                
                this.mesh.setMatrixAt(i, matrix);
            }
        }
    },

    async dynamicGrass({
        assetURL="awtsmoos://grassModel",
        GRASS_COUNT = 101801,
    }) {
        if(this.olam.isGPU()) {
            return console.log("No grass, GPU!");
        }
        return console.log("Grass in development");
    },

    async mixTextures(options = {}) {
        await TextureMixer.mix(this, options);
    },

    async getIcon() {
        if(this.iconItem) {
            var iconData = await this.olam.getIconFromType(this.constructor.name)
            return iconData;
        } else if(this.iconPath) {
            var img = "../../icons/"+this.iconPath;
            var f = await fetch(img);
            var t = await f.text()
            return t;
        }
    }
};
