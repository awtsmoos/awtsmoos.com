
/**
 * B"H
 * @file graphics.js
 * Shaders, textures, icons, and grass generation.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import MaterialManager from '../../math/MaterialManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

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
            return // B"H: silent

        }
        return // B"H: silent

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
        } catch(e) { console.error("B\"H - Error caught:", e); }
       
        var base, overlay;
        try {
            base = await self.olam.loadTexture({ url: baseTexture, shouldRepeat: true, repeatX, repeatY, nivra: self });
            overlay =  await self.olam.loadTexture({ url: overlayTexture, shouldRepeat: true, repeatX, repeatY, nivra: self });
            base.wrapS = base.wrapT = THREE.RepeatWrapping;
            overlay.wrapS = overlay.wrapT = THREE.RepeatWrapping;
        } catch(e) { // B"H: silent
 return; }
       
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

    /**
     * @method createMaterial
     * @description B"H: Creates a refined material through the MaterialManager.
     */
    createMaterial(type, options, snippets) {
        return MaterialManager.create(type, options, snippets);
    },

    /**
     * @method refineMaterial
     * @description B"H: Refines an existing material with shader snippets.
     */
    refineMaterial(mat, snippets) {
        MaterialManager.refine(mat, snippets);
    },

    /**
     * @method createBufferGeometry
     * @description B"H: Manifests a buffer geometry from raw attribute data.
     */
    createBufferGeometry({ verts, normals, uvs, indices }) {
        const geo = new THREE.BufferGeometry();
        if (verts) geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        if (normals) geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        if (uvs) geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        if (indices) geo.setIndex(indices);
        return geo;
    },

    /**
     * @method createMesh
     * @description B"H: Forges a mesh from geometry and material.
     */
    createMesh(geo, mat) {
        return new THREE.Mesh(geo, mat);
    },

    /**
     * @method createGroup
     * @description B"H: Summon a group vessel.
     */
    createGroup() {
        return new THREE.Group();
    },

    /**
     * @method createCylinderGeometry
     * @description B"H: Manifest a cylinder.
     */
    createCylinderGeometry(top, bottom, height, segments) {
        return new THREE.CylinderGeometry(top, bottom, height, segments);
    },

    /**
     * @method createBoxGeometry
     * @description B"H: Manifest a box.
     */
    createBoxGeometry(w, h, d) {
        return new THREE.BoxGeometry(w, h, d);
    },

    /**
     * @method createPlaneGeometry
     * @description B"H: Manifest a plane.
     */
    createPlaneGeometry(w, h, sw, sh) {
        return new THREE.PlaneGeometry(w, h, sw, sh);
    },

    /**
     * @method raycastTerrain
     * @description B"H: Cast a ray into the Malchus (Ground).
     */
    raycastTerrain(origin, direction = { x: 0, y: -1, z: 0 }, maxDist = 1000) {
        if (!this.olam) return null;
        const terrain = [];
        this.olam.scene.traverse(c => { if(c.isMesh && c.userData?.isTerrain) terrain.push(c); });
        if (terrain.length === 0) return null;

        const ray = new THREE.Raycaster(
            new THREE.Vector3(origin.x, origin.y, origin.z),
            new THREE.Vector3(direction.x, direction.y, direction.z),
            0, maxDist
        );
        const hits = ray.intersectObjects(terrain, false);
        return hits.length > 0 ? hits[0].point : null;
    },

    /**
     * @method createRawShaderMaterial
     * @description B"H: Creates a raw ShaderMaterial.
     */
    createRawShaderMaterial(options) {
        return MaterialManager.createRawShader(options);
    },

    /**
     * @method createExtrudeGeometry
     * @description B"H: Manifests an extruded form from a shape and path.
     */
    createExtrudeGeometry(shape, settings) {
        return new THREE.ExtrudeGeometry(shape, settings);
    },

    /**
     * @method createShape
     * @description B"H: Create a 2D shape for extrusion.
     */
    createShape() {
        return new THREE.Shape();
    },

    /**
     * @method createCatmullRomCurve3
     * @description B"H: Manifest a smooth curve from points.
     */
    createCatmullRomCurve3(points, type = 'chordal') {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], 0, p[1])));
        curve.curveType = type;
        return curve;
    },

    /**
     * @method mergeGeometries
     * @description B"H: Unify multiple geometries into one.
     */
    mergeGeometries(geos, useGroups = false) {
        return BufferGeometryUtils.mergeGeometries(geos, useGroups);
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
