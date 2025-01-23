/**
 * B"H
 */


import Tzomayach from "./tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';


import {Capsule} from '/games/scripts/jsm/math/Capsule.js';
import Utils from "../utils.js";

const SPHERE_RADIUS = 0.2;
const sphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 5 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xdede8d } );

export default class Chai extends Tzomayach {
    type = "chai";
    rotationSpeed;
    
    speedScale = 1.4
    defaultSpeed = 127;
    _speed = this.defaultSpeed;
    _originalSpeed = this._speed;
    _movementSpeed = this._speed;
    
    jumpHeight = 27

    get speed () {
        return this._speed;
    }

    set speed(v) {
        this._speed = v;
    }

    
    /**
     * The velocity vector of the character
     * @type {THREE.Vector3}
     */
    velocity = new THREE.Vector3();  // Added velocity property

    /**
     * Collider object for the character, for detecting and handling collisions
     * @type {Capsule}
     */
    collider;
   
    cameraRotation = null;

    offset = 0;
    gotOffset = false;
    lastRotateOffset = 0;
    rotateOffset = 0;
    currentModelVector = new THREE.Vector3();
    worldDirectionVector = new THREE.Vector3();
    worldSideDirectionVector = new THREE.Vector3();
    height = 0.75;
    radius = 0.35;

    lerpTurnSpeed = 0.145;
    targetRotateOffset = 0;

    empty;
    modelMesh = null;
    dontRotateMesh = false;
     /**
     * Flag to check if the character is on the floor
     * @type {Boolean}
     */
     onFloor = true;

     // Added moving property
     moving = {
        stridingLeft: false,
        stridingRight: false,
        forward: false,
        backward: false,
        turningLeft: false,
        turningRight: false,
        running: false,
        jump: false
    };

    /**
     * @method resetMoving
     * @description resets the moving object,
     * for use in a loop to keep track of 
     * if the character is currently moving or not.
     */
    resetMoving() {
        Object.keys(this.moving)
        .forEach(q => {
            this.moving[q] = false;
        })
    }
    movingAutomatically = false;
    isDancing = false;
    chaweeyoosMap = {
        run: () => this.moving.running ? 
            "run":"walk",
        idle: this.isDancing?"dance silly" :"stand",
        walk: "walk",
        jump: "jump",
        falling: "falling",
        "right turn": "right turn",
        "left turn": "left turn",
        "dance silly": "dance silly"
    }

    /**
     * @method chaweeyoos
     * @description selects the relevant
     * chaweeyoos (animation name) from the map to
     * be used with playChaweeyoos.
     * 
     * The difference between this and just
     * selecting it is regarding those animations
     * that have multiple possibilities and probabilities.
     */
    getChaweeyoos(nm) {
        var c = this.chaweeyoosMap[nm];
        if(!c) return null;
        if(typeof(c) == "string") {
            return c;
        }

        if(typeof(c) == "function") {
            return c();
        }
        if(typeof(c) == "object") {
            /**
             * select random index based on numbers.
             */
            var ran = Math.random();
            var sum = 0;
            var entries = Object.entries(c);
            var found = null;
            entries.forEach(q => {
                if(found !== null)
                    return found;
                if(
                    typeof(q[1]/*value*/) == "number" &&
                    q[1] <= 1
                ) {
                    sum += q[1]
                }
                if(ran <= sum) {
                    found = q[0];
                }
            });
            return found;
        }
    }

    constructor(options) {
        super(options);
        this.rotationSpeed = options
            .rotationSpeed || 2;
        this.heesHawveh = true;
    
        this.height = options.height || this.height;
        this.radius = options.radius || this.radius;
        // Create a new collider for the character
        this.collider = new Capsule(
            new THREE.Vector3(0, this.height / 2, 0), 
            new THREE.Vector3(0, this.height, 0), 
            this.radius
        );

        this.collider.nivraReference = this;

        var cm = options.chaweeyoosMap;
        if(cm && typeof(cm) == "object") {
            Object.keys(cm)
            .forEach(k => {
                this.chaweeyoosMap[k] = cm[k];

            })
        }

        this.on("collider transform update", ({
            position, rotation
        }) => {
            
          //  this.collider.start.set( position.x, 0.35, position.z );
          //  this.collider.end.set( position.x, 1, position.z );
        });
        
        // Additional properties can be set here
    }

    async heescheel(olam) {
        await super.heescheel(olam);
        
        // Implement Chai-specific behavior here
    }
	
	
	async afterBriyah() {
		await super.afterBriyah(this)
        this.disanceFromRay = 5;
	}

    async ready() {
        await super.ready();
        
        this.speed = this.speed;
        this.animationSpeed = this.speed;
        var solid = Utils.getSolid(this.mesh);
        if(solid) {
            solid.visible = false;
        }
        /*set mesh to half down if has collider*/
        /*not really wokring just for test*/
        this.empty = new THREE.Group();
        this.olam.scene.add(this.empty);
        var pos = this?.mesh?.position;
        if(pos) {
            if(this?.empty?.position)
                this.empty.position.copy(pos);
        }
        this.modelMesh = this?.mesh;
        this.mesh = this.empty;
        this.emptyCopy = this.empty.clone();
        this.olam.scene.add(this.emptyCopy);
        this.setPosition(this.mesh.position);
        
    }

    
    /**
     * Checks and handles collisions for the character
     * 
     * @param {number} deltaTime Time since the last frame
     */

    collisions(deltaTime) {
        var result = this.olam.worldOctree.capsuleIntersect( this.collider );
        this.onFloor = false;
      
        if ( result ) {
              // Calculate the angle between the collision normal and the up vector
            var upVector = new THREE.Vector3(0, 1, 0);
            var angle = result.normal.angleTo(upVector) * (180 / Math.PI);

            if(angle < 40)
                this.onFloor = result.normal.y > 0;
            else this.onFloor = false;
            if (this.onFloor) {
                
                if(!this.gotOffset) {
                // We're touching the ground, so calculate the offset
                    this.calculateOffset();
                    this.gotOffset = true;
                }
            } 
    
            if ( ! this.onFloor ) {
                
                this.velocity.addScaledVector( result.normal, - result.normal.dot( this.velocity ) );
            }

           // console.log("Colliding",result.normal)
    
            this.collider.translate( result.normal.multiplyScalar( result.depth ) );
        }
    }

    async calculateOffset() {
        if (!this.onFloor) {
            return;
        }
    
        // Wait for the next frame so that the collider's position is updated
        await new Promise(resolve => requestAnimationFrame(resolve));
    
        var raycaster = new THREE.Raycaster();
        raycaster.set(this.collider.start, new THREE.Vector3(0, -1, 0));
    
        var intersects = raycaster.intersectObjects(this.olam.scene.children, true);
        if (intersects.length > 0) {
            this.offset = intersects[0].distance;
        }

        
    }

    getCapsule() {
        if(!this.collider) {
            return null;
        }
        var radius = this.collider.radius;
        var height = this.collider.end.y - 
            this.collider.start.y;
        return {radius, height}
    }

    getModelVector() {
        return Utils.getForwardVector(
            this.modelMesh,
            this.currentModelVector
        );
    }
    getForwardVector() {
        return Utils.getForwardVector(
            this.emptyCopy,
            this.worldDirectionVector
        );
    }
    /**
     * Sets the position of the character's collider
     * 
     * @param {THREE.Vector3} vec3 Position to set
     */
    setPosition(vec3) {
        this.collider.start.set(
            vec3.x, 
            vec3.y + this.height / 2, 
            vec3.z
        );
        this.collider.end.set(
            vec3.x, 
            vec3.y + this.height, 
            vec3.z
        );
        this.collider.radius = this.radius;
        this.isTeleporting = true;
    }

    rays = [];
    // Function to update the ray and place/update the block on the ray
    // Function to update the ray and place/update the block on the ray
    

    spheres = [];
    updateSpheres(deltaTime) {
        this.spheres.forEach(s => {
            s.collider.center.addScaledVector( s.velocity, deltaTime );
            s.mesh.position.copy( s.collider.center );
            if(Date.now() - s.startTime > 300) {
                try {
                    s.mesh.removeFromParent();
                    var ind = this.spheres.indexOf(s);
                    if(ind > -1) {
                        this.spheres.splice(ind, 1)
                    }
                } catch(e) {

                }
            }
        })
    }

    makeSphere(letter, options={}) {
        var mesh;
        if(letter) {
            mesh = this.olam.makeNewHebrewLetter(letter, options);
        }
        if(!mesh)
            mesh = 
            new THREE.Mesh( sphereGeometry, sphereMaterial )
      
        var sphere = {
            mesh,
            collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ),
            velocity: new THREE.Vector3(),
            startTime: Date.now()
        }
        this.spheres.push(sphere);
        return sphere;
    }

    throwBall(letter, options) {
      //  console.log("HI",letter)
        var sphere = this.makeSphere(letter, options);
        
        var v = new THREE.Vector3();  
        var dir;
        if(this.olam.ayin.isFPS) {
            dir = this.olam.ayin.camera.getWorldDirection( v );
        } else {
            dir = this.currentModelVector; 
        }
    
        sphere
        .collider
        .center
        .copy( this.collider.end )
        .addScaledVector( dir/*direction*/, this.collider.radius * 1.5 );

        const impulse = 15 + 30;
        var quat = new THREE.Quaternion
        quat.setFromUnitVectors(
            new THREE.Vector3(0,0,1),
            dir.normalize()
        )

        //setting it upright
        let up = new THREE.Vector3(0, 1, 0);
        let right = new THREE.Vector3().crossVectors(up, dir).normalize();
        let adjustedUp = new THREE.Vector3().crossVectors(dir, right);

        let uprightQuaternion = new THREE.Quaternion();
        uprightQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), adjustedUp.normalize());

        quat.multiply(uprightQuaternion);
        sphere.mesh.quaternion.copy(quat)
        sphere.velocity.copy( dir ).multiplyScalar( impulse );


        this.olam.scene.add(sphere.mesh)
    }

    placeObject() {
        const worldRotation = new THREE.Quaternion();
        this.activeObject.mesh.getWorldQuaternion(worldRotation);

        this.activeRay.mesh.remove(this.activeObject.mesh);
        this.activeObject.mesh.position.applyMatrix4(this.activeRay.mesh.matrixWorld);
        this.olam.scene.add(this.activeObject.mesh);
        this.activeObject.mesh.setRotationFromQuaternion(worldRotation);
        var golem = this.activeObject.awtsmoosGolem;
        var position = this.activeObject.mesh.position;
        var rotation = this.activeObject.mesh.rotation;
        var scale = this.activeObject.mesh.scale;
        this.olam.scene.remove(this.activeObject.mesh);
        var golem = this.activeObject.awtsmoosGolem;
        this.olam.loadNivrayim({
            Domem: {
                ["BH_"+Date.now()+"_block"]: {
                    position,
                    scale,
                    rotation,
                    isSolid:true,
                    ...(golem ? {
                        golem
                    } : {})
                }
            }
        })
       // this.olam.worldOctree.fromGraphNode(this.activeObject.mesh);
        this.activeObject = null;
    }

    async makeRay(length = 30) {
        // Get the starting position of the ray
        const start = this.collider.end.clone(); // Starting position for the ray
        
        // Determine the direction based on FPS or third-person mode
        const direction = this.olam.ayin.isFPS
            ? this.olam.ayin.camera.getWorldDirection(new THREE.Vector3()).normalize().multiplyScalar(-1) // Camera forward direction in FPS
            : new THREE.Vector3(0, 0, -1).applyQuaternion(this.modelMesh.quaternion).normalize(); // Non-FPS forward direction
        
        if (this.activeRay) {
            // Remove existing ray and associated object
            if (this.activeObject) {
                this.placeObject();
            }
        
            if (this.olam.ayin.isFPS) {
                this.olam.ayin.camera.remove(this.activeRay.mesh); // Remove from camera in FPS mode
            } else {
                this.emptyCopy.remove(this.activeRay.mesh); // Remove from modelMesh in third-person mode
            }
        
            this.activeRay = null;
            return; // Exit after toggling off
        }
        
        // Create a new ray
        this.activeRay = {
            mesh: null,
            direction,
            length,
        };
        
        // Create ray geometry and material
        const geometry = new THREE.CylinderGeometry(0.015, 0.015, length, 8); // Thin beam
        geometry.translate(0, -length / 2, 0); // Shift geometry so the base is at the origin
        
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Set the ray's initial position and parenting based on FPS mode
        if (this.olam.ayin.isFPS) {
            // FPS mode: parent to the camera
            
            const localPosition = this.olam.ayin.camera.worldToLocal(
                this.olam.ayin.camera.position.clone()
            );
            mesh.position.copy(localPosition);
            mesh.position.y -= 0.13
            this.olam.ayin.camera.add(mesh);
        } else {
            // Third-person mode: parent to the modelMesh
            const localPosition = this.modelMesh.worldToLocal(start.clone());
            mesh.position.copy(localPosition);
            this.emptyCopy.add(mesh);
        }
        
        // In FPS mode, we don't use lookAt; we directly align the ray with the camera's forward vector
        if (this.olam.ayin.isFPS) {
            // Rotate the ray to face the direction of the camera's forward vector
           /* const rotation = new THREE.Quaternion();
            rotation.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction); // Align ray with camera's forward direction
            mesh.rotation.setFromQuaternion(rotation); // Apply the calculated rotation to the mesh
        */
            // Third-person mode: align the ray's rotation towards the direction of the ray
            const lookAtTarget = this.olam.ayin.camera.position.clone().add(direction.clone().multiplyScalar(length)); // Point in the direction
           // mesh.lookAt(lookAtTarget); // Adjust for third-person mode
            mesh.rotateX(Math.PI / 2); // Align cylinder's Y-axis with ray's direction
        
        } else {
            // Third-person mode: align the ray's rotation towards the direction of the ray
            const lookAtTarget = start.clone().add(direction.clone().multiplyScalar(length)); // Point in the direction
            mesh.lookAt(lookAtTarget); // Adjust for third-person mode
            mesh.rotateX(Math.PI / 2); // Align cylinder's Y-axis with ray's direction
        }
        
        // Store the ray's mesh
        this.activeRay.mesh = mesh;
        
        // Optionally place a block on the ray
        if (!this.activeObject) {
            await this.placeBlockOnRay(start, direction);
        }
        
        return this.activeRay;
    }
    async placeBlockOnRay(rayStart, rayDirection) {
        const distance = 5; // Adjust based on your game's needs
    
        // Calculate initial world position along the ray
        const worldPosition = rayStart.clone().add(rayDirection.clone().multiplyScalar(-distance));
    
        // Create the block
        const def = this?.olam?.vars?.defaultBlock || {
            toyr: {
                MeshLambertMaterial: {
                    color: "blue"
                }
            }
        };
    
        const mesh = await this.olam.generateThreeJsMesh(def);
        if (!mesh) return;
    
        const block = {
            mesh,
        };
    
        // Set the block's scale
        block.mesh.scale.set(3, 3, 2);
    
        // Convert the world position to the ray's local space
        const localPosition = this.activeRay.mesh.worldToLocal(worldPosition.clone());
    
        // Set the block's position in local space
        block.mesh.position.copy(localPosition);
    
        // Parent the block to the ray's mesh
        this.activeRay.mesh.add(block.mesh);
    
        // Store a reference to the active object
        this.activeObject = block;
    }
    




    resetJump = false;
    jumped = false;

    fallingFrames = 0
    heesHawvoos(deltaTime) {
        super.heesHawvoos(deltaTime);
        if(this.isTeleporting) {
            this.isTeleporting = false;
            return;
        }
        // Speed of movement on floor and in air
        var speedDelta = deltaTime * (
            this.onFloor ? 
            (this.speed * this.speedScale) : 8
        );
        if(!this.moving.running) {
            speedDelta *= 0.5;
        }
       
        var rotationSpeed = this.rotationSpeed * deltaTime
        var isWalking = false;
        var isWalkingForOrBack = false;
        var isWalkingForward = false;
        var isWalkingBack = false;

        var velocityAddAmounts = [];
        
        var isTurning = false;
        this.dontRotateMesh = false;
        if(this.moving.down) {
            this.velocity.y -= speedDelta
        }
        if(this.moving.up) {
            this.velocity.y += speedDelta
        }
        if(
            this.moving.forward ||
            this.movingAutomatically
        )
         {
            if(this.onFloor) {
                if(!this.startedWalking) {
                    this.startedWalking = true;
                    this.ayshPeula("started walking", this)
                }
                this.playChaweeyoos
                    (this.getChaweeyoos("run"));
            }
            isWalking = true;
            isWalkingForOrBack = true;
            isWalkingForward = true;
            

            velocityAddAmounts.push([
                this.getForwardVector(),
                speedDelta
            ]);
            this.getModelVector();
            

            this.targetRotateOffset = 0;
        } else if(this.moving.backward) {
            if(this.onFloor) {
                this.playChaweeyoos(this.getChaweeyoos("run"));
                if(!this.startedWalking) {
                    this.startedWalking = true;
                    this.ayshPeula("started walking", this)
                }
            }
            velocityAddAmounts.push([
                this.getForwardVector(),
                -speedDelta
            ]);

            
            isWalkingForOrBack = true;
            isWalkingBack = true;
            
            

            this.targetRotateOffset = -Math.PI;
            isWalking = true;
            this.getModelVector();
        }

        

        if(this.moving.stridingLeft) {
            this.targetRotateOffset = Math.PI/2;
            if(isWalkingForward) {
                this.targetRotateOffset  -= Math.PI / 4
            } else if(isWalkingBack) {
                this.targetRotateOffset  += Math.PI / 4
            
            }

            if(!isWalkingForOrBack)
            if(this.onFloor) {
                this.playChaweeyoos(this.getChaweeyoos("run"));
                if(!this.startedWalking) {
                    this.startedWalking = true;
                    this.ayshPeula("started walking", this)
                }
            }
            isWalking = true;

            velocityAddAmounts.push([
                Utils.getSideVector(
                    this.emptyCopy,
                    this.worldSideDirectionVector
                ),
                -speedDelta
            ]);
            this.getModelVector();
            
            
        } else if(this.moving.stridingRight) {
            this.targetRotateOffset = -Math.PI/2;
            if(isWalkingForward) {
                this.targetRotateOffset  += Math.PI / 4
            } else if(isWalkingBack) {
                this.targetRotateOffset  -= Math.PI / 4
            
            }

            if(!isWalkingForOrBack)
            if(this.onFloor) {
                this.playChaweeyoos(this.getChaweeyoos("run"));
                if(!this.startedWalking) {
                    this.startedWalking = true;
                    this.ayshPeula("started walking", this)
                }
            }
            isWalking = true;
            velocityAddAmounts.push([
                Utils.getSideVector(
                    this.emptyCopy,
                    this.worldSideDirectionVector
                ),
                speedDelta
            ]);

            this.getModelVector();
        }

        if(
            !this.moving.forward &&
            !this.moving.backward &&
            !this.moving.stridingLeft &&
            !this.moving.stridingRight
        ) {
            if(this.startedWalking) {
                this.startedWalking = false;
                this.ayshPeula("stopped walking", this)
            }
        }

        if(this.moving.turningLeft) {
            if(!isWalking) {
                if(this.onFloor) {
                    
                    this.playChaweeyoos(this.getChaweeyoos("left turn"));
                    
                    isTurning = true;
                }
            }
            this.rotation.y += rotationSpeed; // Rotate player left
            this.ayshPeula("rotate", this.rotation.y)
            this.getModelVector();
        } else if(this.moving.turningRight) {
            if(!isWalking) {
                if(this.onFloor) {
                    this.playChaweeyoos(this.getChaweeyoos("right turn"));
                    
                    isTurning = true;
                }
            }
            this.rotation.y -= rotationSpeed; // Rotate player right
            this.ayshPeula("rotate", this.rotation.y);
            this.getModelVector();
        }

         // Jump control
         if ( this.onFloor && this.moving.jump) {
            this.jumped = true;
            this.velocity.y = this.jumpHeight;
            if(!this.didJump) {
                this.didJump = true;
               
                this.ayshPeula("jumped", this)
                if(this.hitFloor) {
                    this.hitFloor = false;
                    this.ayshPeula("off floor", this)
                }
            }
            
            this.jumping = true;
            
        } else {
            if(this.didJump) {
                this.didJump = false;
            }
            this.jumping = false;
        }
        


        if(this.onFloor) {
            if(this.jumped && !this.moving.jump) {
                this.jumped = false;
                if(!this.hitFloor) {
                    this.hitFloor = true;
                    /*
                        event for initial hit of floor
                    */
                    this.ayshPeula("hit floor", this)
                }
            
            }
            if(!isWalking) {
                if(!isTurning)
                    this.playChaweeyoos(this.getChaweeyoos("idle"));
            }
            this.fallingFrames = 0;
        } else {

            if(this.velocity.y > 0 && this.jumped) {
                this.fallingFrames = 0;
                    this.playChaweeyoos(this.getChaweeyoos("jump"),{
                        loop: false
                    });

                    
                
            }
            else if (this.jumped && this.velocity.y < -9) {
                
                this.playChaweeyoos(this.getChaweeyoos("falling"));
                this.fallingFrames = 0;
            } else if (!this.jumped && this.velocity.y < -3) {

                /**
                 * make it fall right when moving downwards
                 * if didn't jump before. If did, rely on part
                 * of jump animation that anyways falls down.
                 */
                if(++this.fallingFrames > 14) {
                    this.playChaweeyoos(this.getChaweeyoos("falling"));
                }
            }
        }

        // Step 1: Compute Unnormalized Combined Vector
        let combinedVector = new THREE.Vector3();
        velocityAddAmounts.forEach(q => {
            combinedVector.add(q[0].clone().multiplyScalar(q[1]));
        });

        // Step 2: Compute Final Scaling Factor
        let totalMagnitude = combinedVector.length();
        let maxMagnitude = Math.abs(speedDelta);
        let scalingFactor = (totalMagnitude > maxMagnitude) ? (maxMagnitude / totalMagnitude) : 1;

        // Step 3: Normalize the Combined Vector
        combinedVector.multiplyScalar(scalingFactor);
        this.velocity.add(combinedVector)


        let damping = Math.exp( - 20 * deltaTime ) - 1;
    
        if ( ! this.onFloor ) {
            // Apply gravity if the character is not on the floor
            this.velocity.y -= this.olam.GRAVITY * deltaTime;

            // small air resistance
            damping *= 0.1;
        }
        
        
        this.velocity.addScaledVector( this.velocity, damping );
        
        /*
        if(isWalking)
            this.velocity.normalize()
                .multiplyScalar(speedDelta);
*/
        var deltaPosition = this.velocity.clone().multiplyScalar( deltaTime );
        this.collider.translate( deltaPosition );

        this.collisions(deltaTime);

        // Sync character's mesh position with collider's end position
        this.mesh.position.copy( this.collider.start );
        this.mesh.position.y -= this.offset;
        
        
        this.mesh.rotation.y = this.rotation.y;
        if(this?.emptyCopy?.rotation)
            this.emptyCopy.rotation.copy(this.mesh.rotation);//.y = this.rotation.y;
        
        this.modelMesh.rotation.copy(this.mesh.rotation);
        //lerp logic for smooth rotating

        // Calculate the angular distance to the target from the current position
        let angularDistance = this.targetRotateOffset - this.rotateOffset;

        // Normalize the angular distance to between -Math.PI and Math.PI
        if (angularDistance > Math.PI) {
            angularDistance -= 2 * Math.PI;
        } else if (angularDistance < -Math.PI) {
            angularDistance += 2 * Math.PI;
        }

        // If the angular distance is close to 180 degrees, prefer turning right
        if (Math.abs(angularDistance - Math.PI) < 0.01) {
            angularDistance = -Math.PI;
        }

        // Add this code snippet in your update loop, near where rotateOffset is used
        this.rotateOffset += angularDistance * this.lerpTurnSpeed;

        // Normalize rotateOffset to between -Math.PI and Math.PI
        if (this.rotateOffset > Math.PI) {
            this.rotateOffset -= 2 * Math.PI;
        } else if (this.rotateOffset < -Math.PI) {
            this.rotateOffset += 2 * Math.PI;
        }


        
        
     //   this.rotateOffset = Math.floor(this.rotateOffset * 1e6) / 1e6
        
        if(
            this.lastRotateOffset
            != 
            this.rotateOffset
        ) {
            this.modelMesh.rotation.y += this.rotateOffset;
            this.ayshPeula("rotate", this.modelMesh.rotation.y)
            this.lastRotateOffset = this.rotateOffset;
    
        }
        
           
        

        this.modelMesh.position.copy(this.mesh.position);
        this.emptyCopy.position.copy(this.mesh.position);
        this.emptyCopy.rotation.copy(this.modelMesh.rotation);
        this.updateSpheres(deltaTime)
       // this.updateRay(deltaTime);
    }
}

