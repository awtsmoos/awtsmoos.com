//B"H
import * as THREE from '/games/scripts/build/three.module.js';
export default function update() {
        if (!this.target) return;
        
        // B"H: NaN Check - If target is invalid (e.g. fallen into abyss), skip update to prevent camera glitch
        if (isNaN(this.target.mesh.position.x) || isNaN(this.target.mesh.position.y) || isNaN(this.target.mesh.position.z)) {
            return;
        }

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
                // B"H: Safety check for deltaY
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
            // B"H: Added safety check for worldOctree
            let collisionResult = this.olam.worldOctree ? this.olam.worldOctree.rayIntersect(this.raycaster.ray) : null;

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
        // B"H: NaN Check
        if(position && !isNaN(position.x) && !isNaN(position.y) && !isNaN(position.z)) {
            this.camera.position.copy(position);
            this.cameraFollower.position.copy(position);
        }
        

        var pos = this.target.mesh.position.clone();
        pos.y += this.targetHeight
        // B"H: NaN Check
        if (!isNaN(pos.x)) {
            this.camera.lookAt(pos);
            this.cameraFollower.lookAt(pos)
        }
        if(did) {
          //  this.userInputTheta = this.euler.y
        }
   
    }