/*
ב"ה
B"H
*/

/**
 * @file Beriah.js
 * @description The World of Beriah (בריאה): The World of Creation.
 * This is the final, corrected version. It contains the complete and functional logic for creating all
 * entities, pools, and UI elements. All previous flaws have been rectified.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const BERIAH = {
    Olam: null,
    
    init(Olam) { this.Olam = Olam; },

    createGeometry(name) {
        const def = this.Olam.ATZILUT.geometries[name];
        if (!def) {
            console.error(`Beriah Error: Geometry definition '${name}' not found in ATZILUT.`);
            return new THREE.BoxGeometry(1, 1, 1);
        }
        return new THREE[def.type](...def.args);
    },

    createMaterial(name) {
        const def = this.Olam.ATZILUT.materials[name];
        if (!def) {
            console.error(`Beriah Error: Material definition '${name}' not found in ATZILUT.`);
            return new THREE.MeshBasicMaterial({ color: 0xff00ff });
        }
        const props = JSON.parse(JSON.stringify(def.props));
        
        if (props.map === 'placeholder_webcam') props.map = this.Olam.assets.webcam.videoTexture;
        if (props.map === 'placeholder_webcam_mirrored') props.map = this.Olam.assets.webcam.videoTextureMirrored;
        if (props.alphaMap === 'placeholder_circleAlpha') props.alphaMap = this.Olam.assets.circleAlphaMap;

        if (def.type === 'ShaderMaterial') {
            props.vertexShader = document.getElementById(props.vertexShader).textContent;
            props.fragmentShader = document.getElementById(props.fragmentShader).textContent;
            if (props.uniforms && props.uniforms.uColor) {
                props.uniforms.uColor.value = new THREE.Color(props.uniforms.uColor.value);
            }
        }
        return new THREE[def.type](props);
    },

    buildRenderable(renderableDef, entity) {
        const type = renderableDef.type || 'group';
        let obj;
        switch (type) {
            case 'group': obj = new THREE.Group(); break;
            case 'mesh': obj = new THREE.Mesh(this.createGeometry(renderableDef.geometry), this.createMaterial(renderableDef.material)); break;
            case 'sprite': obj = new THREE.Sprite(this.createMaterial(renderableDef.material)); break;
            default: throw new Error(`Beriah Error: Unknown renderable type in ATZILUT: ${type}`);
        }

        if (renderableDef.position) obj.position.set(...renderableDef.position);
        if (renderableDef.rotation) obj.rotation.set(...renderableDef.rotation);
        if (renderableDef.scale) obj.scale.set(...renderableDef.scale);
        if (renderableDef.ref) entity.refs[renderableDef.ref] = obj;

        const childrenDef = typeof renderableDef.children === 'function' ? renderableDef.children(entity, this.Olam) : renderableDef.children;
        if (childrenDef) {
            for (const key in childrenDef) {
                const childDef = childrenDef[key];
                const childObj = this.buildRenderable(childDef, entity);
                if(childDef.userData) Object.assign(childObj.userData, childDef.userData);
                obj.add(childObj);
            }
        }
        return obj;
    },

    createPools() {
        for (const type in this.Olam.ATZILUT.archetypes) {
            const archetype = this.Olam.ATZILUT.archetypes[type];
            this.Olam.pools[type] = [];
            for (let i = 0; i < archetype.poolSize; i++) {
                const entity = {
                    id: `${type}_${i}`, type: type,
                    components: {}, // Will be populated by createEntityFromPool
                    refs: { webcamTargets: {} }
                };
                
                // Pre-instantiate vector-like components so they are true Vector3 objects
                const archComps = archetype.components;
                for(const compName in archComps) {
                    const sourceComp = archComps[compName];
                    if (sourceComp && typeof sourceComp === 'object' && 'x' in sourceComp && 'y' in sourceComp && 'z' in sourceComp) {
                         entity.components[compName] = new THREE.Vector3(sourceComp.x, sourceComp.y, sourceComp.z);
                    } else if (typeof sourceComp === 'object' && sourceComp !== null) {
                        entity.components[compName] = JSON.parse(JSON.stringify(sourceComp)); // Deep copy for nested objects like State
                    } else {
                        entity.components[compName] = sourceComp;
                    }
                }
                
                if (archetype.renderable) {
                    entity.object3D = this.buildRenderable(archetype.renderable, entity);
                    entity.object3D.userData.entityId = entity.id;
                    entity.object3D.visible = false;
                    
                    if (archetype.isSingleton) {
                        this.Olam.three.scene.add(entity.object3D);
                    }
                }
                this.Olam.pools[type].push(entity);
            }
        }
    },

    createEntityFromPool(type, options = {}) {
        const pool = this.Olam.pools[type];
        if (!pool) {
            console.error(`Beriah Error: No pool found for type ${type}`);
            return null;
        }
        
        for(let i=0; i < pool.length; i++) {
            const entity = pool[i];
            if (!entity.components.State.active) {
                const archetype = this.Olam.ATZILUT.archetypes[type];
                
                // Reset components to their pristine state from the archetype
                for (const compName in archetype.components) {
                    const archComp = archetype.components[compName];
                    const entityComp = entity.components[compName];

                    if (entityComp instanceof THREE.Vector3) {
                        entityComp.set(archComp.x, archComp.y, archComp.z);
                    } else if (typeof archComp === 'object' && archComp !== null) {
                        entity.components[compName] = JSON.parse(JSON.stringify(archComp));
                    } else {
                        entity.components[compName] = archComp;
                    }
                }
                
                // Apply any new options passed during creation, handling vectors correctly
                for(const key in options) {
                     if (entity.components[key] instanceof THREE.Vector3 && typeof options[key] === 'object') {
                        entity.components[key].set(options[key].x, options[key].y, options[key].z);
                     } else if (entity.components[key] && typeof entity.components[key] === 'object') {
                        Object.assign(entity.components[key], options[key]);
                     } else {
                        entity.components[key] = options[key];
                     }
                }
                
                entity.components.State.active = true;
                entity.object3D.visible = true;

                if (!entity.object3D.parent) {
                    this.Olam.three.scene.add(entity.object3D);
                }

                if(entity.components.Position) {
                    entity.object3D.position.set(entity.components.Position.x, entity.components.Position.y, entity.components.Position.z);
                }
                return entity;
            }
        }
        
        console.warn(`Pool for ${type} is empty.`);
        return null;
    },

    // IN Beriah.js - REPLACE THE ENTIRE buildUI FUNCTION
    // IN Beriah.js - REPLACE THE ENTIRE buildUI FUNCTION
buildUI(schemaName, root) {
    const schema = this.Olam.ATZILUT.uiSchemas[schemaName];

    const buildElement = (def) => {
        const el = document.createElement(def.tag);
        if (def.id) el.id = def.id;
        if (def.baseClass) el.className = def.baseClass;
        if (def.class) el.classList.add(...def.class.split(' '));
        if (def.text) el.textContent = def.text;
        if (def.style) el.style.cssText = def.style;
        if (def.placeholder) el.placeholder = def.placeholder;

        // *** THE FINAL, CRITICAL FIX IS HERE ***
        const handlerName = def.onClick || def.onInput || def.onChange;
        const eventType = def.onClick ? 'click' : (def.onInput ? 'input' : 'change');

        if (handlerName) {
            // Find which Sefirah the handler belongs to
            let context = null;
            let handlerFn = null;
            
            // Search through all Sefirot on the main ASSIAH object
            for (const sefirahName in this.Olam.ASSIYAH) {
                const sefirah = this.Olam.ASSIYAH[sefirahName];
                if (sefirah && typeof sefirah[handlerName] === 'function') {
                    context = sefirah;
                    handlerFn = sefirah[handlerName];
                    break;
                }
            }

            if (context && handlerFn) {
                // Bind the Sefirah object itself as the 'this' context
                el.addEventListener(eventType, handlerFn.bind(context));
            }
        }
        
        if (def.children) {
            def.children.forEach(childDef => el.appendChild(buildElement(childDef)));
        }
        return el;
    }

    const rootEl = buildElement(schema);
    this.Olam.ui.elements[schemaName] = rootEl;
    root.appendChild(rootEl);
},

};
