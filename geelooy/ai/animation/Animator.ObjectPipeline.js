//B"H
// Animator.ObjectPipeline.js (NEW FILE - Handles object updates, including children)

window.AnimatorObjectPipeline = {
    updateObjectState: function(objState, deltaTime, currentTime, animatorInstance, parentMatrix = null) {
        const UTILS = animatorInstance.UTILS;
        const DATA = animatorInstance.DATA;

        // If attached to a character, its worldMatrix is set by CharacterPipeline
        if (objState.isAttachedTo) {
            // Children of attached objects still need their local matrices updated relative to this now-transformed parent
            if (objState.childrenStates) {
                Object.values(objState.childrenStates).forEach(childState => {
                    this.updateObjectState(childState, deltaTime, currentTime, animatorInstance, objState.worldMatrix);
                });
            }
            return;
        }
        
        // Apply path follower if active
        if (objState.pathFollowState && objState.pathFollowState.isActive) {
            const handler = UTILS._defaultBehaviorHandlers.pathFollower;
            if(handler) handler(objState, null, deltaTime, currentTime, 1, animatorInstance);
        }

        // Apply simple physics if defined
        if (objState.physicsState && objState.physicsState.type === 'jiggle') {
            this._applyJigglePhysics(objState, deltaTime, UTILS);
        }


        // Calculate local matrix (relative to parent or world origin if root)
        let localMatrix = UTILS.matrixIdentity();
        const definition = objState.definition;
        const pivot = definition.pivot || { x: 0.5, y: 0.5 }; // Default to center pivot
        
        // If it's a child object, its x,y in objState are relative to parent's anchor point.
        // The anchorToParent in its definition specifies where on its parent it attaches.
        if (objState.parentId && objState.parentRef) {
            const parentDef = objState.parentRef.definition;
            const parentDim = objState.parentRef.currentDimensions;
            const anchor = definition.anchorToParent || {x:0, y:0}; // Default to parent's origin
            
            // 1. Translate from parent's origin (0,0) to the anchor point on parent
            localMatrix = UTILS.matrixTranslate(localMatrix,
                anchor.x * parentDim.w,
                anchor.y * parentDim.h);
        } else {
            // Root object: x, y are world coordinates
            localMatrix = UTILS.matrixTranslate(localMatrix, objState.x, objState.y);
        }
        
        // 2. Translate by negative of own pivot (to make rotations/scales around pivot)
        //    This is applied *after* positioning based on parent anchor or world x,y
        localMatrix = UTILS.matrixTranslate(localMatrix, -pivot.x * objState.currentDimensions.w, -pivot.y * objState.currentDimensions.h);

        // 3. Apply explicit translation (objState.x, objState.y) IF it's a child and these are meant as local offsets from anchor
        if (objState.parentId && (objState.x !== 0 || objState.y !== 0) && !definition.anchorToParent) {
            // This case is a bit ambiguous. If anchorToParent is used, objState.x/y should ideally be 0.
            // If no anchorToParent, objState.x/y are offsets from parent's pivot.
            // For now, assume objState.x/y is an additional local translation if it's a child.
            // The initial setup in DataHandler for child initialPosition (defaults to 0,0) makes this less likely unless explicitly set.
             // localMatrix = UTILS.matrixTranslate(localMatrix, objState.x, objState.y);
        }


        // 4. Apply object's own rotation and scale
        localMatrix = UTILS.matrixScale(localMatrix, objState.size, objState.size); // Assuming uniform scale from objState.size
        localMatrix = UTILS.matrixRotate(localMatrix, UTILS.degToRad(objState.rotation + (objState.physicsState?.angleRad ? UTILS.radToDeg(objState.physicsState.angleRad) : 0) ));
       
        objState.localMatrix = localMatrix; // Store local matrix for children drawing

        // Calculate world matrix
        if (parentMatrix) {
            objState.worldMatrix = UTILS.matrixMultiply(parentMatrix, objState.localMatrix);
        } else {
            objState.worldMatrix = objState.localMatrix; // Root object's local is its world
        }

        // Update children recursively
        if (objState.childrenStates) {
            Object.values(objState.childrenStates).forEach(childState => {
                this.updateObjectState(childState, deltaTime, currentTime, animatorInstance, objState.worldMatrix); // Pass this object's worldMatrix as parentMatrix
            });
        }
    },

    _applyJigglePhysics: function(objState, deltaTime, UTILS) {
        const ps = objState.physicsState;
        const cfg = objState.definition.physics; // Original config from template

        // Simplified spring towards 0 rotation (resting state)
        const stiffness = cfg.stiffness || 0.1;
        const damping = cfg.damping || 0.9;
        const angleLimitRad = UTILS.degToRad(cfg.angleLimit || 20);

        const springForce = -stiffness * ps.angleRad;
        const dampingForce = -damping * ps.velRad;
        
        // External forces could be added here if needed (e.g. from interactions)
        // For now, it just reacts to being moved/rotated abruptly.
        // If objState.rotation changes externally, it creates a "displacement" for the spring.
        // This isn't quite right. The spring should act on a delta from a "rest" rotation.
        // Let's assume the physics rotation is *additional* to objState.rotation.
        // And forces are applied to ps.velRad if something "hits" it.

        // For now, let's make it simpler: if the object itself is rotated, the physics part tries to return to 0 relative rotation.
        // This behavior should be an attached behavior on the object, not directly in pipeline.
        // Keeping this simple for now as direct pipeline integration.

        const accel = springForce + dampingForce;
        ps.velRad += accel * deltaTime;
        let newAngleRad = ps.angleRad + ps.velRad * deltaTime;

        if (Math.abs(newAngleRad) > angleLimitRad) {
            newAngleRad = UTILS.clamp(newAngleRad, -angleLimitRad, angleLimitRad);
            ps.velRad *= -0.5; // Energy loss on impact
        }
        ps.angleRad = newAngleRad;
        
        // This physics model is very basic. A proper component-based behavior system would be better.
    }
};