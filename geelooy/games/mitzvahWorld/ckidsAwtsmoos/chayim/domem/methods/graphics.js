
/**
 * B"H
 * @file graphics.js
 * Shaders, textures, icons, and grass generation.
 */
import * as THREE from '/games/scripts/build/three.module.js';

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

    async mixTextures({
        baseTexture,      
        overlayTexture,   
        repeatX = 1,
        repeatY = 1,
        childNameToSetItTo = null,
        textureScale = 0.05,
        pathChildName = null, 
        feather = 5.0,
        intensity = 1.0,      
        lowHeight = 0.0,      
        highHeight = 10.0     
    } = {}) {
        var self = this;
        try {
            baseTexture = self.olam.$gc(baseTexture);
            overlayTexture = self.olam.$gc(overlayTexture);
        } catch(e){ console.log("Couldnt get it",e); }
       
        var base, overlay;
        try {
            base = await self.olam.loadTexture({ url: baseTexture, shouldRepeat: true, repeatX, repeatY, nivra: self });
            overlay =  await self.olam.loadTexture({ url: overlayTexture, shouldRepeat: true, repeatX, repeatY, nivra: self });
            base.wrapS = base.wrapT = THREE.RepeatWrapping;
            overlay.wrapS = overlay.wrapT = THREE.RepeatWrapping;
        } catch(e) { console.log("Issue loading!",e); return; }
       
        var targetChild = null;
        if (childNameToSetItTo && this.mesh) {
            this.mesh.traverse((child) => {
                if (!targetChild && child.isMesh && child.name.includes(childNameToSetItTo)) {
                    targetChild = child;
                }
            });
        }
        if (!targetChild) { console.error("Could not find the child mesh:", childNameToSetItTo); return; }

        const MAX_SEGMENTS_FOR_SHADER = 200; 
        let pathObject = null;
        if (pathChildName) {
            this.mesh.traverse(child => {
                if (child.name === pathChildName && child.geometry) {
                    pathObject = child;
                }
            });
        }

        const pathSegments = [];
        let usePathMixing = false;
        let numActualSegments = 0;

        if (pathObject) {
            pathObject.visible = false;
            usePathMixing = true;
            pathObject.updateMatrixWorld(true); 
             
            const positions = pathObject.geometry.attributes.position;
            const worldVertices = [];
            for (let i = 0; i < positions.count; i++) {
                const localPoint = new THREE.Vector3().fromBufferAttribute(positions, i);
                const worldPoint = localPoint.applyMatrix4(pathObject.matrixWorld);
                worldVertices.push(worldPoint);
            }

            const step = Math.max(1, Math.ceil(worldVertices.length / MAX_SEGMENTS_FOR_SHADER));
            for (let i = 0; i < worldVertices.length - 1; i += step) {
                if(pathSegments.length >= MAX_SEGMENTS_FOR_SHADER * 2) break; 
                pathSegments.push(worldVertices[i], worldVertices[i+1]);
            }
            numActualSegments = pathSegments.length / 2;

        } 

        while (pathSegments.length < MAX_SEGMENTS_FOR_SHADER * 2) {
            pathSegments.push(new THREE.Vector3()); 
        }

        var customLambertMaterial = new THREE.MeshLambertMaterial();
        customLambertMaterial.onBeforeCompile = function (shader) {
            shader.uniforms.baseTexture = { value: base };
            shader.uniforms.overlayTexture = { value: overlay };
            shader.uniforms.repeatVector = { value: new THREE.Vector2(repeatX, repeatY) };
            shader.uniforms.textureScale = { value: textureScale };
            shader.uniforms.usePathMixing = { value: usePathMixing };
            shader.uniforms.feather = { value: feather };
            shader.uniforms.intensity = { value: intensity };
            shader.uniforms.lowHeight = { value: lowHeight };
            shader.uniforms.highHeight = { value: highHeight };
            shader.uniforms.pathSegments = { value: pathSegments }; 
            shader.uniforms.numPathSegments = { value: numActualSegments }; 

            shader.vertexShader = `varying vec3 vWorldPosition;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\nvWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`);

            shader.fragmentShader = `
                uniform sampler2D baseTexture, overlayTexture; uniform vec2 repeatVector; uniform float textureScale, feather, lowHeight, highHeight;
                uniform float intensity;
                uniform bool usePathMixing;
                uniform vec3 pathSegments[${MAX_SEGMENTS_FOR_SHADER * 2}]; 
                uniform int numPathSegments; 
                varying vec3 vWorldPosition;
                float distanceToLineSegment(vec3 p, vec3 a, vec3 b) {
                    vec2 p2 = p.xz;
                    vec2 a2 = a.xz;
                    vec2 b2 = b.xz;
                    vec2 pa = p2 - a2, ba = b2 - a2;
                    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                    return length(pa - ba * h);
                }
            ` + shader.fragmentShader;
            
            var fragmentLogic = `
                vec4 dirtColor = texture2D(baseTexture, (vWorldPosition.xz * textureScale) * repeatVector);
                vec4 grassColor = texture2D(overlayTexture, (vWorldPosition.xz * textureScale) * repeatVector);
                float mixFactor = 0.0;
                if (usePathMixing && numPathSegments > 0) {
                    float minDistance = 1e38;
                    for (int i = 0; i < numPathSegments; ++i) {
                        minDistance = min(minDistance, distanceToLineSegment(vWorldPosition, pathSegments[i * 2], pathSegments[i * 2 + 1]));
                    }
                    float smoothFactor = 1.0 - smoothstep(0.0, feather, minDistance);
                    mixFactor = pow(smoothFactor, 1.0 / intensity);
                } else {
                    mixFactor = smoothstep(lowHeight, highHeight, vWorldPosition.y);
                }
                vec4 mixedColor = mix(dirtColor, grassColor, mixFactor);
                diffuseColor *= mixedColor;
            `;

            shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n' + fragmentLogic);
        };

        targetChild.material = customLambertMaterial;
        targetChild.material.needsUpdate = true;
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
