/*
ב"ה
B"H
*/

/**
 * @file Beriah.js
 * @description The World of Beriah (בריאה): The World of Creation.
 * This is the second world, the great workshop where the blueprints of Atzilut are given form.
 * The scent of sawdust and hot metal hangs in the air. Here, abstract concepts are forged into tangible,
 * though not yet living, objects. BERIAH contains the factories and builders that instantiate geometries,
 * apply materials, and construct the DOM from the sacred data schemas.
 * Every function herein is a complete and indivisible act of creation.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const BERIAH = {
    Olam: null,
    
    /**
     * @description Breathes the spirit of the Olam (World State) into the workshop, allowing it to create.
     * @param {object} Olam - The central world state object.
     */
    init(Olam) { this.Olam = Olam; },

    /**
     * @description The Forge of Forms. This function is the heart of the workshop.
     * It takes a name and parameters from Atzilut and hammers it into a Three.js Geometry.
     * The sound is of a thousand hammers striking in unison, each blow shaping a different facet of reality.
     * @param {string} name - The name of the geometry in ATZILUT.geometries.
     * @returns {THREE.BufferGeometry} A newly forged geometry, pristine and perfect.
     */
    createGeometry(name) {
        const def = this.Olam.ATZILUT.geometries[name];
        if (!def) {
            console.error(`Geometry definition '${name}' not found in ATZILUT.`);
            return new THREE.BoxGeometry(1, 1, 1); // Return a default shape to prevent crashes.
        }
        return new THREE[def.type](...def.args);
    },

    /**
     * @description The Loom of Vestments. Here, spiritual properties are woven into materials.
     * Colors, textures, and the way light interacts with a surface are decided here, based on the patterns from Atzilut.
     * The air shimmers with chromatic energy, smelling of nebulae and molten light.
     * @param {string} name - The name of the material in ATZILUT.materials.
     * @returns {THREE.Material} A newly woven material, ready to clothe a form.
     */
    createMaterial(name) {
        const def = this.Olam.ATZILUT.materials[name];
        if (!def) {
            console.error(`Material definition '${name}' not found in ATZILUT.`);
            return new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Return a default material.
        }
        const props = JSON.parse(JSON.stringify(def.props)); // Deep clone to avoid mutation.
        
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

    /**
     * @description The Assembly Line of Being. This function takes a renderable definition from an archetype
     * and constructs its physical form. It reads the blueprint, requests geometries and materials from the other
     * workshops, and pieces them together into a coherent Three.js Object3D. The scent is of ozone and finality.
     * @param {object} renderableDef - The renderable definition from an ATZILUT archetype.
     * @param {object} entity - The entity this object will represent, to store references to its parts.
     * @returns {THREE.Object3D} The fully assembled 3D object, a golem awaiting its animating soul.
     */
    buildRenderable(renderableDef, entity) {
        const type = renderableDef.type || 'group';
        let obj;
        switch (type) {
            case 'group':
                obj = new THREE.Group();
                break;
            case 'mesh':
                obj = new THREE.Mesh(this.createGeometry(renderableDef.geometry), this.createMaterial(renderableDef.material));
                break;
            case 'sprite':
        const material = this.createMaterial(renderableDef.material);
        obj = new THREE.Sprite(material);
        break;
            default:
                throw new Error(`Unknown renderable type in ATZILUT: ${type}`);
        }

        if (renderableDef.position) obj.position.set(...renderableDef.position);
        if (renderableDef.rotation) obj.rotation.set(...renderableDef.rotation);
        if (renderableDef.scale) obj.scale.set(...renderableDef.scale);
        if (renderableDef.ref) entity.refs[renderableDef.ref] = obj;
        if (renderableDef.webcamTarget) entity.refs.webcamTargets[renderableDef.webcamTarget] = obj;

        const childrenDef = typeof renderableDef.children === 'function' ? renderableDef.children(entity, this.Olam) : renderableDef.children;
        if (childrenDef) {
            for (const key in childrenDef) {
                const childDef = childrenDef[key];
                // Create a temporary entity-like structure for the child to pass down references.
                const childEntity = { id: `${entity.id}_${key}`, refs: { webcamTargets: {} } };
                const childObj = this.buildRenderable(childDef, childEntity);
                // Embed the child's specific data (like its own collision box) into the Object3D's userData.
                if(childDef.userData) Object.assign(childObj.userData, childDef.userData);
                obj.add(childObj);
            }
        }
        return obj;
    },

    /**
     * @description The Genesis of Pools. Before the journey begins, this function pre-fabricates all beings.
     * It reads every archetype from Atzilut, creating a pool of inactive entities, each a perfect golem
     * waiting in the wings of creation for its moment to be called forth into the world of action.
     * The workshop floor is filled with silent, motionless forms, a silent army awaiting the first command.
     */
    // IN Beriah.js - REPLACE THE ENTIRE createPools FUNCTION

createPools() {
    for (const type in this.Olam.ATZILUT.archetypes) {
        const archetype = this.Olam.ATZILUT.archetypes[type];
        this.Olam.pools[type] = [];
        for (let i = 0; i < archetype.poolSize; i++) {
            const entity = {
                id: `${type}_${i}`, type: type,
                components: JSON.parse(JSON.stringify(archetype.components)),
                refs: { webcamTargets: {} }
            };
            if (archetype.renderable) {
                entity.object3D = this.buildRenderable(archetype.renderable, entity);
                entity.object3D.userData.entityId = entity.id;
                entity.object3D.visible = false;

                // *** THE FINAL, CRITICAL FIX IS HERE ***
                // If the entity is a singleton that should always exist (like the Chariot),
                // add it to the scene immediately. Otherwise, keep it out of the scene until it's spawned.
                if (archetype.isSingleton) {
                    this.Olam.three.scene.add(entity.object3D);
                }
            }
            this.Olam.pools[type].push(entity);
        }
    }
},

    // IN Beriah.js - REPLACE THE ENTIRE FUNCTION

// IN Beriah.js - REPLACE THE ENTIRE FUNCTION

createEntityFromPool(type, options = {}) {
    const pool = this.Olam.pools[type];
    if (!pool) {
        console.error(`No pool found for type ${type}`);
        return null;
    }
    
    for(let i=0; i < pool.length; i++) {
        const entity = pool[i];
        if (!entity.components.State.active) {
            // In Beriah.js -> createEntityFromPool
// FIND THIS BLOCK:
// const archetype = ...
// deepCopyAndVectorize(entity.components, archetype.components);
// if(options) { ... }

// REPLACE WITH THIS:
const archetype = this.Olam.ATZILUT.archetypes[type];
            
// Reset components to archetype defaults *first*. This is the key.
entity.components = JSON.parse(JSON.stringify(archetype.components));

// Re-instantiate any declared vector components
if (archetype.vectorComponents) {
    archetype.vectorComponents.forEach(compName => {
        const keys = compName.split('.');
        let target = entity.components;
        let source = archetype.components;
        for (let j = 0; j < keys.length - 1; j++) { target = target[keys[j]]; source = source[keys[j]]; }
        const finalKey = keys[keys.length - 1];
        const sourceVec = source[finalKey];
        target[finalKey] = new THREE.Vector3(sourceVec.x, sourceVec.y, sourceVec.z);
    });
}

// Apply any new options
for(const key in options) {
     if (entity.components[key]) Object.assign(entity.components[key], options[key]);
     else entity.components[key] = options[key];
}
            // This function recursively copies properties, instantiating THREE.Vector3 where needed.
            const deepCopyAndVectorize = (target, source) => {
                for (const key in source) {
                    const sourceProp = source[key];
                    if (sourceProp && typeof sourceProp === 'object' && !Array.isArray(sourceProp)) {
                        // Check if it looks like a vector object
                        if ('x' in sourceProp && 'y' in sourceProp && 'z' in sourceProp) {
                            if (target[key] instanceof THREE.Vector3) {
                                target[key].set(sourceProp.x, sourceProp.y, sourceProp.z);
                            } else {
                                target[key] = new THREE.Vector3(sourceProp.x, sourceProp.y, sourceProp.z);
                            }
                        } else {
                            if (typeof target[key] !== 'object' || target[key] === null) {
                                target[key] = {};
                            }
                            deepCopyAndVectorize(target[key], sourceProp);
                        }
                    } else {
                        target[key] = sourceProp;
                    }
                }
            };

            // Reset components using the new recursive function
            deepCopyAndVectorize(entity.components, archetype.components);
            
            // Apply any new options
            if(options) {
                deepCopyAndVectorize(entity.components, options);
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


    /**
     * @description The Architect of Interfaces. This function constructs the HTML Document Object Model
     * from the UI schemas defined in Atzilut. It is a work of translation, turning pure data into
     * the visible, interactive elements the user will perceive as reality.
     * @param {string} schemaName - The name of the UI schema in ATZILUT.
     * @param {HTMLElement} root - The parent element to append the new UI structure to.
     */
    buildUI(schemaName, root) {
        const schema = this.Olam.ATZILUT.uiSchemas[schemaName];
        const eventHandlers = window.ASSIAH.DAAT.eventHandlers;

        const buildElement = (def) => {
            const el = document.createElement(def.tag);
            if (def.id) el.id = def.id;
            if (def.baseClass) el.className = def.baseClass;
            if (def.class) el.classList.add(...def.class.split(' '));
            if (def.text) el.textContent = def.text;
            if (def.style) el.style.cssText = def.style;
            if (def.placeholder) el.placeholder = def.placeholder;

            
            if (def.onClick && eventHandlers[def.onClick]) {
    // Find which Sefirah holds the target function
    let sefirahContext = null;
    for (const sefirah of Object.values(this.Olam.ASSIAH)) {
        if (typeof sefirah === 'object' && sefirah !== null && sefirah[def.onClick]) {
            sefirahContext = sefirah;
            break;
        }
    }
    // Bind the Sefirah as the 'this' context for the event listener
    if (sefirahContext) {
        el.addEventListener('click', eventHandlers[def.onClick].bind(sefirahContext));
    }
}

            
            if (def.onInput && eventHandlers[def.onInput]) el.addEventListener('input', (e) => eventHandlers[def.onInput](e));
            if (def.onChange && eventHandlers[def.onChange]) el.addEventListener('change', (e) => eventHandlers[def.onChange](e));

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
