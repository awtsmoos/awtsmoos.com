//B"H
/**
 * Ayin - An enhanced Three.js camera class that follows a target object in the scene. 
 * Provides functionalities for rotating around the target, zooming in/out, 
 * and collision avoidance with scene objects.
 */
import * as THREE from '/games/scripts/build/three.module.js';

 export default class Ayin {
    constructor(olam) {
        var width, height, target;
        this.olam = olam;
        this.width = width;
        this.height = height;
        this.target = target;
        this.isFPS = false;

        this.mouseX = 0;
        this.mouseY = 0;
        this.deltaY =0;

        this.targetHeight = 1;

        this.amountToStartHidingTarget = 1.52
        this.amountToHideTargetCompletely = 1.508
        

        this.distance = 5.0;
        this.offsetFromWall = 3.6

        this.maxDistance = 20;
        this.minDistance = 0.1;
        this.speedDistance = 5;

        this.xSpeed = 75.0;
        this.ySpeed = 75.0;

        this.yMinLimit = -40;
        this.yMaxLimit = 80;

        this.movedRotation = null;

        this.zoomRate = .01;

        this.rotationDampening = 3.0;
        this.zoomDampening = 5.0;

        this.xDeg = 0.0;
        this.yDeg = 0.0;
        this.currentDistance = this.distance;
        this.desiredDistance = this.distance;
        this.correctedDistance = this.distance;
        this.previousResults = new Map(); // Cache for storing previous results

        
        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
        this.cameraFollower = this.camera.clone();
        olam.scene.add(this.camera);
        this.camera.rotation.order = 'YXZ';
        this.group = new THREE.Group();
        this.camera.add(this.group);

        this.raycaster = new THREE.Raycaster();

        this.mouseRaycaster = new THREE.Raycaster();
        
         this.playerCollisionBuffer = 0.770;


        this.objectsInScene = [];

        this.userInputTheta = 0;
        this.userInputPhi = 0;
     
        this.mouseIsDown = false;

        this.lastDistance = null;

        this.panAmount = 0.5;
        this.modelMesh = null;
    }

    get target() {
        return this._target;
    }

    set target(v) {
        this._target = v;
        if(v?.collider) {
	       /* this.targetHeight = 
	        (v.collider.end.y - 
	        v.collider.start.y)*/
        }
        if(v && typeof(v.height) == "number") {
             this.targetHeight = v.height;
        }
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    updateSceneObjects(newObjects) {
        this.objectsInScene = newObjects;
        this.previousResults.clear(); // Clear cache when scene objects change
    }

    performOptimizedRaycasting(isCorrected) {
        let isSceneChanged = this.isSceneChanged();

        for (let obj of this.objectsInScene) {
            let collisionResults;
            if (isSceneChanged || !this.previousResults.has(obj)) {
                collisionResults = this.raycaster.intersectObject(obj, true);
                this.previousResults.set(obj, collisionResults);
            } else {
                collisionResults = this.previousResults.get(obj);
            }

            if (collisionResults.length > 0) {
                let distanceToObject = collisionResults[0].distance - this.offsetFromWall;
                if (distanceToObject < this.correctedDistance) {
                    this.correctedDistance = distanceToObject;
                    isCorrected = true;
                }
            }
        }

        return isCorrected;
    }

    isSceneChanged() {
        // Implement logic to determine if scene objects have changed
        // This can be based on a flag that is set when objects are added/removed/modified
        return false;
    }

    clampAngle(angle, min, max) {
        if (angle < -360)
            angle += 360;
        if (angle > 360)
            angle -= 360;
        return Math.max(Math.min(angle, max), min);
    }
    
    sensitivity = 0.001;

    sentToOlam = false;
    update() {
        if (!this.target) return;

        this.newMovement=false
        if(
            this.rightMouseIsDown &&
            this.mouseIsDown
        ) {
            if(this.target.olam) {
                this.target.olam.ayshPeula("setInput", {
                    code: "KeyW"
                })
                this.sentToOlam = true;
            }    
        } else {
            if(this.sentToOlam) {
                this.sentToOlam = false;
                this.target.olam.ayshPeula("setInputOut", {
                    code: "KeyW"
                })
            }
        }


        if(!this.isFPS) {
            if(this.lastDistance) {
                this.desiredDistance = this.lastDistance;
                this.lastDistance = null; 
                var f = this.target.modelMesh || this.target.mesh;
                f.visible = true;

                this.target.rotation.y = this.userInputTheta 
                * THREE.MathUtils.DEG2RAD;
                this.previousTargetRotation = this.target.rotation.y * 180/Math.PI;

                this.target.rotateOffset = 0;
            } else {
                // B"H: Safety check for deltaY to prevent NaN propagation
                const dY = (typeof this.deltaY === 'number' && !isNaN(this.deltaY)) ? this.deltaY : 0;
                this.desiredDistance -= dY * 0.02 * this.zoomRate * Math.abs(this.desiredDistance) * this.speedDistance;
                this.desiredDistance = Math.max(Math.min(this.desiredDistance, this.maxDistance), this.minDistance);
            }
        } else {
            if(this.lastDistance === null) {
                this.lastDistance = this.desiredDistance;
                var f = this.target.modelMesh || this.target.mesh;

                f.visible = false;
                this.target.rotation.y = this.userInputTheta 
                * THREE.MathUtils.DEG2RAD;
                this.previousTargetRotation = this.target.rotation.y * 180/Math.PI;

                this.target.rotateOffset = 0;
            }
            this.desiredDistance = 0;
        }
        let vTargetOffset;
    
        // Get the target's rotation in degrees
        this.targetRotation = this.target.mesh.rotation.y * 180 / Math.PI;
 
        // If it's the first update call, set the previous rotation to the current one
        if (this.previousTargetRotation === undefined) {
            this.previousTargetRotation = this.targetRotation;
        }
    
        // Compute the change in the target's rotation
        let rotationDelta = this.targetRotation - this.previousTargetRotation;
    
        
        // The rest of your code...
         // Calculate the desired distance

        if(!this.isFPS) {
            
          // Update the camera's horizontal rotation based on the target's rotation and the user's input
            if (this.mouseIsDown || this.rightMouseIsDown) {
                // If the mouse button is down, allow the user to control the rotation
                this.userInputTheta -= this.mouseX * this.xSpeed * this.sensitivity;
            } else {
                // If the mouse button is not down, make the camera follow the target
                this.userInputTheta += rotationDelta;
            }
        
            // Update the camera's vertical rotation based on the user's input
            // Subtracting the mouseY component inverts the controls
            this.userInputPhi -= this.mouseY * this.ySpeed * this.sensitivity;
        
            


            // Remember the target's current rotation for the next update call
            this.previousTargetRotation = this.targetRotation;

            
        } 

        
        // Reset deltaY
        this.deltaY = 0;
        this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);
    
        let rotation = null;
        let position = null;

        // If there was a collision, correct the camera position and calculate the corrected distance
        let isCorrected = false;
        // Set camera rotation
        this.euler = new THREE.Euler(this.userInputPhi * THREE.MathUtils.DEG2RAD, this.userInputTheta * THREE.MathUtils.DEG2RAD, 0, 'YXZ');
        rotation = new THREE.Quaternion();
        rotation.setFromEuler(this.euler);
    
        
        this.correctedDistance = this.desiredDistance;
    
        // Calculate desired camera position
        vTargetOffset = new THREE.Vector3(0, -this.targetHeight, 0);
        position = new THREE.Vector3().copy(this.target.mesh.position);
        position.sub(vTargetOffset);
        position.sub(new THREE.Vector3(0, 0, this.desiredDistance).applyQuaternion(rotation)); 
    
        
        
        
        if(this.isFPS) {
            if(this.mouseIsDown) {
               
            } else {

               
            }
        } else {
    


            
            // Check for collision using the true target's desired registration point as set by user using height
            let trueTargetPosition = new THREE.Vector3().copy(this.target.mesh.position);
            trueTargetPosition.sub(vTargetOffset);
        
            
        
            this.raycaster.set(trueTargetPosition, position.clone().sub(trueTargetPosition).normalize());
        
       
            
            // Assuming raycaster is set up and pointing in the right direction
            let collisionResult = this.olam.worldOctree.rayIntersect(this.raycaster.ray);

            if (collisionResult) {
                // collisionResult contains the nearest intersection
                let distanceToObject = collisionResult.distance - this.offsetFromWall;
                if (distanceToObject < this.correctedDistance) {
                    this.correctedDistance = distanceToObject;
                    isCorrected = true;
                }
            }
            
             const playerRaycaster = new THREE.Raycaster(
                position, // from the camera's potential new position
                trueTargetPosition.clone().sub(position).normalize() // toward the player
            );
            
		
            
            
           

            

        }
        
       
    
        // 1. Calculate the ideal distance based on user input and wall collision smoothing.
	let smoothedDistance = (!isCorrected || this.correctedDistance > this.currentDistance) ?
	    this.lerp(this.currentDistance, this.correctedDistance, 0.02 * this.zoomDampening) :
	    this.correctedDistance;
	
	// 2. Calculate the absolute minimum allowed distance based on player collision geometry.
	let minimumAllowedDistance = this.minDistance;
	
	if (!this.isFPS && this.target.collider) {
	    const collider = this.target.collider;
	    const pivotPoint = this.target.mesh.position.clone().sub(vTargetOffset);
	    const sphereCenter = new THREE.Vector3().addVectors(collider.start, collider.end).multiplyScalar(0.5);
	    const safetyRadius = collider.radius + this.playerCollisionBuffer;
	
	    // We solve a quadratic equation to find the intersection of the camera's view ray
	    // with the player's safety sphere. This correctly handles all camera angles.
	    const pivotToCameraDir = new THREE.Vector3(0, 0, 1).applyQuaternion(rotation);
	    const pivotToSphereCenterVec = sphereCenter.clone().sub(pivotPoint);
	
	    const a = 1; // pivotToCameraDir.lengthSq(), which is 1
	    const b = -2 * pivotToCameraDir.dot(pivotToSphereCenterVec);
	    const c = pivotToSphereCenterVec.lengthSq() - safetyRadius * safetyRadius;
	
	    const discriminant = b * b - 4 * a * c;
	
	    if (discriminant >= 0) {
	        // If the discriminant is non-negative, the line intersects the sphere.
	        const sqrtDiscriminant = Math.sqrt(discriminant);
	        const dist1 = (-b - sqrtDiscriminant) / (2 * a);
	        const dist2 = (-b + sqrtDiscriminant) / (2 * a);
	
	        // We want the closest positive intersection point.
	        if (dist1 > 0 && dist1 < dist2) {
	             minimumAllowedDistance = Math.max(this.minDistance, dist1);
	        } else if (dist2 > 0) {
	             minimumAllowedDistance = Math.max(this.minDistance, dist2);
	        }
	    }
	    // If discriminant is negative, the ray doesn't intersect, so no player collision is possible.
	}
	
	// 3. The final distance is the LARGER of the smoothed distance and the calculated minimum.
	let finalDistance = Math.max(minimumAllowedDistance, smoothedDistance);
	finalDistance = Math.min(this.maxDistance, finalDistance); // And then clamp by the max distance.
	
	// 4. If we were clamped by the player, sync the desiredDistance to prevent zoom-out lag.
	if (finalDistance === minimumAllowedDistance && smoothedDistance < minimumAllowedDistance) {
	    this.desiredDistance = minimumAllowedDistance;
	}
	
	// 5. Apply the final, guaranteed-safe distance.
	this.currentDistance = finalDistance;
	
        // Recalculate position based on the new currentDistance
        position = new THREE.Vector3().copy(this.target.mesh.position);
        position.sub(vTargetOffset);
        position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation)); 
        
        
       

        
        var did = false;
        if(this.isFPS) {
            if(
                this.mouseIsDown ||
                this.rightMouseIsDown
            ) {
               
                this.target.rotation.y = this.euler.y;
                
            }
            else {
                did = true;
                
                this.euler.y = this.target.rotation.y
                rotation = new THREE.Quaternion();
                rotation.setFromEuler(this.euler);
                position = new THREE.Vector3().copy(this.target.mesh.position);
                position.sub(vTargetOffset);
                position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation)); 
                this.userInputTheta = this.euler.y * 180/Math.PI
               
           
            }
        } else if(this.rightMouseIsDown) {
            this.target.rotation.y = this.euler.y;
        }
        
        

        this.camera.rotation.copy(this.euler);
        if(position) {
            this.camera.position.copy(position);
            this.cameraFollower.position.copy(position);
        }
        

        var pos = this.target.mesh.position.clone();
        pos.y += this.targetHeight
        this.camera.lookAt(pos);
        this.cameraFollower.lookAt(pos)
        if(did) {
          //  this.userInputTheta = this.euler.y
        }
   
    }
    _lastFocalDepth;
    

    newMovement=false
    
    lerp(start, end, percent) {
        return (start + percent*(end - start));
    }

    lerpAngle(start, end, percent) {
        let difference = Math.abs(end - start);
        if (difference > 180) {
            // We need to add on to one of the values.
            if (end > start) {
                // We'll add it on to start...
                start += 360;
            } else {
                // Add it on to end.
                end += 360;
            }
        }

        // Interpolate it.
        let value = (start + ((end - start) * percent));

        // Wrap it..
        let rangeZero = 360;

        if (value >= 0 && value <= 360)
            return value;

        return (value % rangeZero);
    }

    zoom(deltaY) {
        this.newMovement=true;
        // B"H: Ensure deltaY is a valid number to prevent NaN
        this.deltaY = (typeof deltaY === 'number' && !isNaN(deltaY)) ? deltaY : 0;
    }

    panDown(amount) {
        this.userInputPhi += amount || this.panAmount
    }

    panUp(amount) {
        this.userInputPhi -= amount || this.panAmount
    }

    rotateAroundTarget(dx, dy) {
        this.newMovement=true
        // Convert degrees to radians
        var degreeToRadian = Math.PI / 180;
        // Update the theta and phi values based on the mouse movement
        this.userInputTheta += dx * this.xSpeed * degreeToRadian;
        this.userInputPhi -= dy * this.ySpeed * degreeToRadian;
    }

    getHovered(
        startAlternative,
        directionAlternative
    ) {
        if (startAlternative && directionAlternative) {
            // If startAlternative and directionAlternative are provided, set the ray manually
            this
            .mouseRaycaster
            .set(
                startAlternative, 
                directionAlternative.multiplyScalar(-1)
            );
        } else {
            // Otherwise, default to raycasting from the camera using the mouse pointer
            this.mouseRaycaster.setFromCamera(
                this.olam.pointer,
                this.camera
    
            );
        }
        
        
       
        // 1. Check Static Octree (Buildings, Landscape)
        let closest = null;
        var oct = this
            .olam
            .interactiveOctree
            .rayIntersect(this.mouseRaycaster.ray);
       
        if(oct) {
            oct.object = oct.triangle.awtsmoosification || oct.object; // Support older way or standard way
            closest = oct;
        }

        // 2. B"H FIX: Check Dynamic Entities (NPCs) that were skipped from Octree
        // We iterate over all interactable entities and check if they are dynamic
        if (this.olam.interactableNivrayim) {
            for (const nivra of this.olam.interactableNivrayim) {
                // Skip Chossid (Player) usually, unless desired
                if (nivra.type === 'chossid') continue;

                // Only check dynamic types that we excluded from the octree
                if (nivra.mesh && (nivra.type === 'customNpc' || nivra.type === 'medabeir' || nivra.type === 'chai')) {
                    const hits = this.mouseRaycaster.intersectObject(nivra.mesh, true); // Recursive for complex models
                    if (hits.length > 0) {
                        const hit = hits[0];
                        
                        // Ensure the hit object is linked back to the Nivra for logic to work
                        // The mesh should have 'nivraAwtsmoos' attached to it
                        // If not, we can manually attach it or just rely on the fact that 'hit.object' is part of the hierarchy
                        
                        // Check if this hit is closer than the octree hit
                        if (!closest || hit.distance < closest.distance) {
                            closest = hit;
                            
                            // Ensure robustness: bubble up to find the root mesh that has nivraAwtsmoos
                            // hit.object is the specific mesh part (e.g. 'Head'). We need the parent Nivra.
                            let curr = hit.object;
                            while(curr && !curr.nivraAwtsmoos) {
                                curr = curr.parent;
                            }
                            if (curr && curr.nivraAwtsmoos) {
                                // Fake the octree return structure for compatibility
                                closest.object = curr; 
                            }
                        }
                    }
                }
            }
        }
        
        if(closest) return closest;

        return null;

        //
    }

    onMouseDown(event) {
        if (event.button === 0) {
            this.mouseIsDown  = true;
        }

        if(event.button == 2) {
            this.rightMouseIsDown = true;
        }

    }

    onRightMouseDown() {
        this.rightMouseIsDown = true;
    }

    onRightMouseUp() {
        this.rightMouseIsDown = true;
    }

    onMouseMove(event) {
        
        if(
            (this.mouseIsDown || this.rightMouseIsDown)
            && 
            (event.movementX !== 0 || event.movementY !== 0)
        ) {
            let dx = event.movementX * (this.xSpeed / this.width);
            let dy = event.movementY * (this.ySpeed / this.height);
            
            
            this.rotateAroundTarget(dx, dy);
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            this.mouseIsDown = false;
        }

        if(event.button == 2) {
            this.rightMouseIsDown = false;
        }
    }
}