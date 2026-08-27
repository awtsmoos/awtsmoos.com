//B"H
// Animator.CameraControls.js (No major changes needed for this request, but ensure robustness)

window.AnimatorCore_CameraControls = {
    _updateCamera: function(animator, deltaTime) {
        this._calculateCameraFocusTarget(animator); 

        const dtFactor = Math.min(deltaTime * 60, 1.0); // Cap dtFactor to 1 to prevent overshooting with large deltaTime spikes

        const prevWorldX = animator.cameraState.worldX;
        const prevWorldY = animator.cameraState.worldY;
        const prevZoom = animator.cameraState.zoom;

        if (typeof animator.cameraState.targetWorldX !== 'number' || isNaN(animator.cameraState.targetWorldX)) {
            animator.cameraState.targetWorldX = prevWorldX;
        }
        if (typeof animator.cameraState.targetWorldY !== 'number' || isNaN(animator.cameraState.targetWorldY)) {
            animator.cameraState.targetWorldY = prevWorldY;
        }
        if (typeof animator.cameraState.targetZoom !== 'number' || isNaN(animator.cameraState.targetZoom)) {
            animator.cameraState.targetZoom = prevZoom;
        }
        
        if (Math.abs(animator.cameraState.targetWorldX - animator.cameraState.worldX) > animator.cameraState.lerpThreshold ||
            Math.abs(animator.cameraState.targetWorldY - animator.cameraState.worldY) > animator.cameraState.lerpThreshold) {
            animator.cameraState.worldX = animator.UTILS.lerp(animator.cameraState.worldX, animator.cameraState.targetWorldX, animator.cameraState.panSpeed * dtFactor);
            animator.cameraState.worldY = animator.UTILS.lerp(animator.cameraState.worldY, animator.cameraState.targetWorldY, animator.cameraState.panSpeed * dtFactor);
        } else {
            animator.cameraState.worldX = animator.cameraState.targetWorldX;
            animator.cameraState.worldY = animator.cameraState.targetWorldY;
        }

        if (Math.abs(animator.cameraState.targetZoom - animator.cameraState.zoom) > animator.cameraState.zoomThreshold) {
            animator.cameraState.zoom = animator.UTILS.lerp(animator.cameraState.zoom, animator.cameraState.targetZoom, animator.cameraState.zoomSpeed * dtFactor);
        } else {
            animator.cameraState.zoom = animator.cameraState.targetZoom;
        }
        animator.cameraState.zoom = animator.UTILS.clamp(animator.cameraState.zoom, animator.cameraState.minZoom, animator.cameraState.maxZoom);
    },

    _calculateCameraFocusTarget: function(animator) {
        if (!animator.cameraState.focusEntityIds?.length) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, count = 0;
        
        animator.cameraState.focusEntityIds.forEach(id => {
            const entity = animator.charactersState[id] || animator.objectsState[id]; // Can focus on objects too
            if (!entity || !entity.visible) return;
            if (typeof entity.x !== 'number' || isNaN(entity.x) || typeof entity.y !== 'number' || isNaN(entity.y)) return;

            let entW = 50, entH = 100; // Default entity size for focusing if no template/dims
            if (entity.templateId && entity.currentDimensions) { // Character
                entH = (animator.DATA.CHARACTER_TEMPLATES[entity.templateId]?.baseHeight || 160) * (entity.size || 1.0);
                entW = entity.currentDimensions.w * (entity.size || 1.0) * 0.75; // Use current width
            } else if (entity.currentDimensions) { // Object
                entW = entity.currentDimensions.w;
                entH = entity.currentDimensions.h;
            }
            
            minX = Math.min(minX, entity.x - entW / 2); maxX = Math.max(maxX, entity.x + entW / 2);
            minY = Math.min(minY, entity.y - entH); // Top of character/object
            maxY = Math.max(maxY, entity.y);     // Bottom of character/object (y-axis points down typically in world coords)
            count++;
        });

        if (count > 0) {
            animator.cameraState.targetWorldX = (minX + maxX) / 2;
            const bH = maxY - minY;
            animator.cameraState.targetWorldY = (minY + maxY) / 2 + bH * animator.cameraState.verticalFocusBias;

            const pad = 0.25;
            const reqW = (maxX - minX) * (1 + pad * 2);
            const reqH = bH * (1 + pad * 2);
            
            if (reqW > 0 && reqH > 0) {
                animator.cameraState.targetZoom = Math.min(animator.canvas.width / reqW, animator.canvas.height / reqH, animator.cameraState.maxZoom);
            }
        }
    },

    _applyCameraEvent: function(animator, event, immediate) {
        let explicitPan = false;
        if (event.panTarget && typeof event.panTarget.x === 'number' && typeof event.panTarget.y === 'number') {
            animator.cameraState.targetWorldX = event.panTarget.x;
            animator.cameraState.targetWorldY = event.panTarget.y;
            explicitPan = true;
        }

        if (typeof event.zoomTarget === 'number' && !isNaN(event.zoomTarget)) {
            animator.cameraState.targetZoom = event.zoomTarget;
        }

        if (event.focusEntityIds) {
            animator.cameraState.focusEntityIds = Array.isArray(event.focusEntityIds) ? event.focusEntityIds : [event.focusEntityIds];
            if (animator.cameraState.focusEntityIds.length > 0) explicitPan = false;
        } else if (event.panToEntity && !explicitPan) {
            const ent = animator.charactersState[event.panToEntity] || animator.objectsState[event.panToEntity];
            if (ent && typeof ent.x === 'number' && typeof ent.y === 'number') {
                let verticalOffset = 0;
                if (animator.charactersState[event.panToEntity]) { // If it's a character
                    const template = animator.DATA.CHARACTER_TEMPLATES[ent.templateId];
                    verticalOffset = (template?.baseHeight * ent.size * 0.3 ?? 0);
                }
                animator.cameraState.targetWorldX = ent.x;
                animator.cameraState.targetWorldY = ent.y - verticalOffset;
            }
        }

        if (!explicitPan && animator.cameraState.focusEntityIds.length > 0) {
            this._calculateCameraFocusTarget(animator);
        }

        if (immediate) {
            if (typeof animator.cameraState.targetWorldX === 'number' && !isNaN(animator.cameraState.targetWorldX)) animator.cameraState.worldX = animator.cameraState.targetWorldX;
            if (typeof animator.cameraState.targetWorldY === 'number' && !isNaN(animator.cameraState.targetWorldY)) animator.cameraState.worldY = animator.cameraState.targetWorldY;
            if (typeof animator.cameraState.targetZoom === 'number' && !isNaN(animator.cameraState.targetZoom)) animator.cameraState.zoom = animator.cameraState.targetZoom;
        }
    }
};
