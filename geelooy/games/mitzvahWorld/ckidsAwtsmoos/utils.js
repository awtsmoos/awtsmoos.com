
/**
 * B"H
 * 
 * Utils
 * 
 * @file a utils file
 * @description utilities for ckids
 */

import * as AWTSMOOS from "../ckidsAwtsmoos/awtsmoosCkidsGames.js";
import createProfile from "/scripts/awtsmoos/social/profileDropdown.js";
import * as THREE from '/games/scripts/build/three.module.js';

var IDs = 0;

export default class Utils {
    static getForwardVector(object3D, direction) {
        var dir = direction;
        object3D.getWorldDirection(dir).clone();
        dir.y = 0;
        dir.normalize();
        return dir;
    }
    
    static getSideVector(object3D, direction) {
        var dir = direction;
        object3D.getWorldDirection(dir).clone();
        dir.y = 0;
        dir.normalize();
        dir.cross(object3D.up);
        return dir;
    }
    
    static clone(event) {
        if(event instanceof KeyboardEvent) {
            return {
                isTrusted: event.isTrusted, key: event.key, code: event.code, location: event.location,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                repeat: event.repeat, isComposing: event.isComposing, charCode: event.charCode, keyCode: event.keyCode,
                which: event.which, type: event.type, timeStamp: event.timeStamp
            };
        }
        if(event instanceof MouseEvent) {
            return {
                isTrusted: event.isTrusted, screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                movementX: event.movementX, movementY: event.movementY, button: event.button, buttons: event.buttons,
                relatedTarget: event.relatedTarget, region: event.region, type: event.type, timeStamp: event.timeStamp,
                deltaX: event.deltaX, deltaY: event.deltaY, deltaZ: event.deltaZ, deltaMode: event.deltaMode
            };
        }
        if(event instanceof WheelEvent) {
            return {
                isTrusted: event.isTrusted, screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                button: event.button, buttons: event.buttons, relatedTarget: event.relatedTarget, region: event.region,
                deltaX: event.deltaX, deltaY: event.deltaY, deltaZ: event.deltaZ, deltaMode: event.deltaMode,
                type: event.type, timeStamp: event.timeStamp
            };
        }
        if(event instanceof Touch) {
            return {
                screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                radiusX: event.radiusX, radiusY: event.radiusY, deltaX: event.screenX, deltaY: event.screenY
            };
        }
        return {};
    }

    static replaceMaterialsWithLambert(gltf) {
        gltf.scene.traverse((child) => {
            Utils.replaceMaterialWithLambert(child)
        });
    }

    static replaceMaterialWithLambert(mesh) {
        if (mesh.isMesh && mesh.material instanceof THREE.MeshStandardMaterial) {
            let oldMat = mesh.material;
            let newMat = new THREE.MeshLambertMaterial();
            Object.keys(oldMat).forEach(k => {
                newMat[k] = oldMat[k]
            });
            mesh.material = newMat;
            return newMat;
        }
        return null;
    }

    static getSolid(mesh) {
        return this.searchForMesh(mesh, "solid");
    }

    static copyObj(obj) {
        if(!obj || typeof(obj) != "object") return obj;
        let objCopy = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                objCopy[key] = this.copyObj(obj[key]);
            } else {
                objCopy[key] = obj[key];
            }
        }
        return objCopy;
    }
    
    static copySerializableValues(sourceObj, targetObj) {
        for (const key in sourceObj) {
            const value = sourceObj[key];
            if (Utils.isSerializable(value)) { 
                targetObj[key] = value;
            } else if (Array.isArray(value)) { 
                targetObj[key] = []; 
                for (const item of value) {
                    if (Utils.isSerializable(item)) {
                        targetObj[key].push(item);
                    }
                }
            } else if (value instanceof Date) { 
                targetObj[key] = new Date(value); 
            } 
        }
    }
  
    static isSerializable(value) {
        return (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint' || value === null || value === undefined);
    }

    static generateID() {
        return "BH_" + Date.now() + "_" + (IDs++);
    }

    static capsuleSphereColliding(capsule, sphere) {
		var _vector1 = new THREE.Vector3();
        var direction = new THREE.Vector3().subVectors(capsule.end, capsule.start);
        var halfDirection = direction.multiplyScalar(0.5);
        var emtsaCapsule = _vector1.addVectors(capsule.start, halfDirection);
        var emtsaSphere = sphere.center;
        var radius = capsule.radius + sphere.radius;
        var r2 = radius * radius;
		var ar = [capsule.start, capsule.end, emtsaCapsule];
        for(var nikooduh of ar) {
            var reechook2 = nikooduh.distanceToSquared(emtsaSphere);
            if(reechook2 < r2) {
                return true;
            }
        }
        return false;
    }

    static stringifyFunctions(obj) {
        let objCopy = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (typeof obj[key] === 'function') {
                let str = obj[key].toString();
                // Check for method shorthand vs arrow function
                // Arrow functions typically contain '=>' and do not start with 'function'
                // Method shorthands: foo() {}
                // Async shorthands: async foo() {}
                
                let trimmed = str.trim();
                let isAsync = trimmed.startsWith("async");
                let core = trimmed;
                
                // Determine if it needs 'function' prepended
                // It needs it if it's a method shorthand.
                // It DOES NOT need it if it's an arrow function, or already has 'function' keyword, or is a getter/setter.
                
                let needsPrefix = true;
                
                if (core.startsWith("function") || core.startsWith("async function")) needsPrefix = false;
                if (core.startsWith("get ") || core.startsWith("set ")) needsPrefix = false;
                
                // Arrow function detection: look for => before the first opening brace
                let arrowIndex = core.indexOf("=>");
                let braceIndex = core.indexOf("{");
                if (arrowIndex !== -1 && (braceIndex === -1 || arrowIndex < braceIndex)) {
                     needsPrefix = false;
                }
                
                if (needsPrefix) {
                    if (isAsync) {
                        // "async foo() {}" -> "async function foo() {}"
                        core = core.replace("async", "async function");
                    } else {
                        // "foo() {}" -> "function foo() {}"
                        core = "function " + core;
                    }
                }
                
                objCopy[key] = `/*B"H\nThis has been stringified with Awtsmoos!\n*/\n${core}`;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                objCopy[key] = this.stringifyFunctions(obj[key]);
            } else {
                objCopy[key] = obj[key];
            }
        }
        return objCopy;
    }

    static evalStringifiedFunctions(obj, context=null) {
        var objCopy = Array.isArray(obj) ? [] : {};
        var comment = '/*B"H\nThis has been stringified with Awtsmoos!\n*/\n';
        
        for (let key in obj) {
            try {
                if (typeof obj[key] === 'string' && obj[key].startsWith(comment)) {
                    var code = obj[key].substring(comment.length);
                    // Wrap in parens to force expression evaluation
                    var evaled = '(' + code + ')';
                    
                    if(context) {
                         // Context injection placeholder
                    }
                    
                    try {
                        objCopy[key] = eval(evaled);
                    } catch(e) {
                        console.error("B\"H - Error evaluating stringified function:", e);
                        console.log("Code:", code);
                        // Fallback: try raw eval if parens failed
                        try { objCopy[key] = eval(code); } catch(e2) {} 
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    objCopy[key] = this.evalStringifiedFunctions(obj[key], context);
                } else {
                    objCopy[key] = obj[key];
                }
            } catch(e) {
                console.log("key in function problem", e, obj[key])
            }
        }
        return objCopy;
    }

    static searchForMesh(mesh,name) {
        if(mesh && mesh instanceof THREE.Object3D) {
            var found = null;
            mesh.traverse(child => {
                if(child.name == name) {
                    found = child;
                }
            });
            return found;
        }
        return null;
    }
}
