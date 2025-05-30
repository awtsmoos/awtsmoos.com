//B"H
// Animator.CameraControls.js

window.AnimatorCore_CameraControls = {
    _updateCamera: function(animator, deltaTime) {
        this._calculateCameraFocusTarget(animator); // This might update targetWorldX/Y/Zoom

        const dtFactor = deltaTime * 60; // Assuming 60FPS for lerp speed consistency

        const prevWorldX = animator.cameraState.worldX;
        const prevWorldY = animator.cameraState.worldY;
        const prevZoom = animator.cameraState.zoom;
        const prevTargetX = animator.cameraState.targetWorldX;
        const prevTargetY = animator.cameraState.targetWorldY;
        const prevTargetZoom = animator.cameraState.targetZoom;

        if (typeof animator.cameraState.targetWorldX !== 'number' || isNaN(animator.cameraState.targetWorldX)) {
            console.warn(`[ANIM_DEBUG_TRANSFORM] _updateCamera: targetWorldX is NaN (${animator.cameraState.targetWorldX}). Reverting to previous worldX (${prevWorldX}).`);
            animator.cameraState.targetWorldX = prevWorldX; // Fallback to current world pos if target became invalid
        }
        if (typeof animator.cameraState.targetWorldY !== 'number' || isNaN(animator.cameraState.targetWorldY)) {
            console.warn(`[ANIM_DEBUG_TRANSFORM] _updateCamera: targetWorldY is NaN (${animator.cameraState.targetWorldY}). Reverting to previous worldY (${prevWorldY}).`);
            animator.cameraState.targetWorldY = prevWorldY;
        }
        if (typeof animator.cameraState.targetZoom !== 'number' || isNaN(animator.cameraState.targetZoom)) {
            console.warn(`[ANIM_DEBUG_TRANSFORM] _updateCamera: targetZoom is NaN (${animator.cameraState.targetZoom}). Reverting to previous zoom (${prevZoom}).`);
            animator.cameraState.targetZoom = prevZoom;
        }
        
        // Log current state before lerping/snapping
        // console.log(`[ANIM_DEBUG_TRANSFORM] _updateCamera (Pre-Lerp): ` +
        //     `world=(${prevWorldX.toFixed(2)}, ${prevWorldY.toFixed(2)}, ${prevZoom.toFixed(2)}) ` +
        //     `target=(${animator.cameraState.targetWorldX.toFixed(2)}, ${animator.cameraState.targetWorldY.toFixed(2)}, ${animator.cameraState.targetZoom.toFixed(2)}) ` +
        //     `dtFactor=${dtFactor.toFixed(3)}`);

        // Pan
        if (Math.abs(animator.cameraState.targetWorldX - animator.cameraState.worldX) > animator.cameraState.lerpThreshold ||
            Math.abs(animator.cameraState.targetWorldY - animator.cameraState.worldY) > animator.cameraState.lerpThreshold) {
            animator.cameraState.worldX = animator.UTILS.lerp(animator.cameraState.worldX, animator.cameraState.targetWorldX, animator.cameraState.panSpeed * dtFactor);
            animator.cameraState.worldY = animator.UTILS.lerp(animator.cameraState.worldY, animator.cameraState.targetWorldY, animator.cameraState.panSpeed * dtFactor);
        } else {
            animator.cameraState.worldX = animator.cameraState.targetWorldX;
            animator.cameraState.worldY = animator.cameraState.targetWorldY;
        }

        // Zoom
        if (Math.abs(animator.cameraState.targetZoom - animator.cameraState.zoom) > animator.cameraState.zoomThreshold) {
            animator.cameraState.zoom = animator.UTILS.lerp(animator.cameraState.zoom, animator.cameraState.targetZoom, animator.cameraState.zoomSpeed * dtFactor);
        } else {
            animator.cameraState.zoom = animator.cameraState.targetZoom;
        }
        animator.cameraState.zoom = animator.UTILS.clamp(animator.cameraState.zoom, animator.cameraState.minZoom, animator.cameraState.maxZoom);

        // if (animator.cameraState.worldX !== prevWorldX || animator.cameraState.worldY !== prevWorldY || animator.cameraState.zoom !== prevZoom) {
        //     console.log(`[ANIM_DEBUG_TRANSFORM] _updateCamera (Post-Lerp/Snap): `+
        //         `world=(${animator.cameraState.worldX.toFixed(2)}, ${animator.cameraState.worldY.toFixed(2)}, ${animator.cameraState.zoom.toFixed(2)})`);
        // }
    },

    _calculateCameraFocusTarget: function(animator) {
        if (!animator.cameraState.focusEntityIds?.length) {
            // console.log(`[ANIM_DEBUG_TRANSFORM] _calculateCameraFocusTarget: No focusEntityIds. Skipping calculation.`);
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, count = 0;
        let logDetails = ["[ANIM_DEBUG_TRANSFORM] _calculateCameraFocusTarget:"];
        logDetails.push(`  Focus IDs: ${animator.cameraState.focusEntityIds.join(', ')}`);

        animator.cameraState.focusEntityIds.forEach(id => {
            const char = animator.charactersState[id];
            if (!char || !char.templateId || !char.visible) {
                logDetails.push(`  - Entity ${id}: Not found, no template, or not visible. Skipping.`);
                return;
            }

            if (typeof char.x !== 'number' || isNaN(char.x) || typeof char.y !== 'number' || isNaN(char.y)) {
                logDetails.push(`  - Entity ${id}: Invalid coords (x:${char.x}, y:${char.y}). Skipping.`);
                return;
            }

            const t = animator.DATA.CHARACTER_TEMPLATES[char.templateId];
            if (!t) {
                logDetails.push(`  - Entity ${id}: Template ${char.templateId} not found. Skipping.`);
                return;
            }
            const h = t.baseHeight * char.size;
            const w = (t.parts.find(p => p.id === 'torso')?.dimensions.wFactor || 0.3) * h * 0.5; // Half width of torso for bounding box

            minX = Math.min(minX, char.x - w);
            maxX = Math.max(maxX, char.x + w);
            minY = Math.min(minY, char.y - h); // Top of character (y decreases upwards on screen typically)
            maxY = Math.max(maxY, char.y);     // Bottom of character (at their y position)
            count++;
            logDetails.push(`  - Entity ${id} (x:${char.x.toFixed(1)}, y:${char.y.toFixed(1)}, sz:${char.size.toFixed(1)}): Box (l:${(char.x-w).toFixed(1)}, r:${(char.x+w).toFixed(1)}, t:${(char.y-h).toFixed(1)}, b:${char.y.toFixed(1)})`);
        });

        if (count > 0) {
            const currentTargetX = animator.cameraState.targetWorldX;
            const currentTargetY = animator.cameraState.targetWorldY;
            const currentTargetZoom = animator.cameraState.targetZoom;

            const newTargetWorldX = (minX + maxX) / 2;
            const bH = maxY - minY; // Bounding height of all characters
            const newTargetWorldY = (minY + maxY) / 2 + bH * animator.cameraState.verticalFocusBias;

            const pad = 0.25; // Padding factor around the bounding box
            const reqW = (maxX - minX) * (1 + pad * 2);
            const reqH = bH * (1 + pad * 2);
            
            let newTargetZoom = animator.cameraState.targetZoom; // Default to current target if calc fails
            if (reqW > 0 && reqH > 0) {
                newTargetZoom = Math.min(animator.canvas.width / reqW, animator.canvas.height / reqH, animator.cameraState.maxZoom);
            } else {
                 logDetails.push(`  Calculation: Invalid reqW (${reqW.toFixed(1)}) or reqH (${reqH.toFixed(1)}). Target zoom will not change.`);
            }
            
            animator.cameraState.targetWorldX = newTargetWorldX;
            animator.cameraState.targetWorldY = newTargetWorldY;
            animator.cameraState.targetZoom = newTargetZoom;

            logDetails.push(`  Calculation: Count=${count}, minX=${minX.toFixed(1)}, maxX=${maxX.toFixed(1)}, minY=${minY.toFixed(1)}, maxY=${maxY.toFixed(1)}`);
            logDetails.push(`  Calculation: BoundingHeight=${bH.toFixed(1)}, reqW=${reqW.toFixed(1)}, reqH=${reqH.toFixed(1)}`);
            logDetails.push(`  Result: Prev Target(X,Y,Z): (${currentTargetX.toFixed(1)},${currentTargetY.toFixed(1)},${currentTargetZoom.toFixed(2)})`);
            logDetails.push(`  Result: New Target(X,Y,Z): (${newTargetWorldX.toFixed(1)},${newTargetWorldY.toFixed(1)},${newTargetZoom.toFixed(2)})`);
        } else {
            logDetails.push(`  No valid entities found for focus. Camera target unchanged.`);
        }
        // console.log(logDetails.join('\n'));
    },

    _applyCameraEvent: function(animator, event, immediate) {
        let logDetails = [`[ANIM_DEBUG_TRANSFORM] _applyCameraEvent (immediate: ${immediate}):`];
        logDetails.push(`  Event: ${JSON.stringify(event)}`);
        logDetails.push(`  Before: target=(${animator.cameraState.targetWorldX.toFixed(1)}, ${animator.cameraState.targetWorldY.toFixed(1)}, ${animator.cameraState.targetZoom.toFixed(2)}), focusIds=[${animator.cameraState.focusEntityIds.join(',')}]`);

        let explicitPan = false;
        if (event.panTarget && typeof event.panTarget.x === 'number' && typeof event.panTarget.y === 'number') {
            animator.cameraState.targetWorldX = event.panTarget.x;
            animator.cameraState.targetWorldY = event.panTarget.y;
            explicitPan = true;
            logDetails.push(`  Applied panTarget: new targetX=${event.panTarget.x}, targetY=${event.panTarget.y}`);
        }

        if (typeof event.zoomTarget === 'number' && !isNaN(event.zoomTarget)) {
            animator.cameraState.targetZoom = event.zoomTarget;
            logDetails.push(`  Applied zoomTarget: new targetZoom=${event.zoomTarget}`);
        }

        if (event.focusEntityIds) {
            animator.cameraState.focusEntityIds = Array.isArray(event.focusEntityIds) ? event.focusEntityIds : [event.focusEntityIds];
            if (animator.cameraState.focusEntityIds.length > 0) explicitPan = false; // Focus overrides explicit pan if focus IDs are given
            logDetails.push(`  Applied focusEntityIds: [${animator.cameraState.focusEntityIds.join(',')}]. explicitPan is now ${explicitPan}`);
        } else if (event.panToEntity && !explicitPan) { // Only panToEntity if no explicitPan and no focusEntityIds
            const ent = animator.charactersState[event.panToEntity];
            if (ent && typeof ent.x === 'number' && typeof ent.y === 'number') {
                const template = animator.DATA.CHARACTER_TEMPLATES[ent.templateId];
                const verticalOffset = (template?.baseHeight * ent.size * 0.3 ?? 0);
                animator.cameraState.targetWorldX = ent.x;
                animator.cameraState.targetWorldY = ent.y - verticalOffset;
                logDetails.push(`  Applied panToEntity '${event.panToEntity}': new targetX=${ent.x}, targetY=${ent.y - verticalOffset} (offset ${verticalOffset})`);
            } else {
                logDetails.push(`  panToEntity '${event.panToEntity}' not found or has invalid coords.`);
            }
        }

        if (!explicitPan && animator.cameraState.focusEntityIds.length > 0) {
            logDetails.push(`  Recalculating camera focus target due to focusEntityIds.`);
            this._calculateCameraFocusTarget(animator); // This will update targetWorldX/Y/Zoom
        }

        if (immediate) {
            logDetails.push(`  Immediate snap requested.`);
            if (typeof animator.cameraState.targetWorldX === 'number' && !isNaN(animator.cameraState.targetWorldX)) {
                animator.cameraState.worldX = animator.cameraState.targetWorldX;
                logDetails.push(`    Snapped worldX to ${animator.cameraState.worldX}`);
            } else {  logDetails.push(`    targetWorldX is NaN, cannot snap worldX.`); }

            if (typeof animator.cameraState.targetWorldY === 'number' && !isNaN(animator.cameraState.targetWorldY)) {
                animator.cameraState.worldY = animator.cameraState.targetWorldY;
                logDetails.push(`    Snapped worldY to ${animator.cameraState.worldY}`);
            } else {  logDetails.push(`    targetWorldY is NaN, cannot snap worldY.`); }

            if (typeof animator.cameraState.targetZoom === 'number' && !isNaN(animator.cameraState.targetZoom)) {
                animator.cameraState.zoom = animator.cameraState.targetZoom;
                logDetails.push(`    Snapped zoom to ${animator.cameraState.zoom}`);
            } else {  logDetails.push(`    targetZoom is NaN, cannot snap zoom.`); }
        }
        logDetails.push(`  After: target=(${animator.cameraState.targetWorldX.toFixed(1)}, ${animator.cameraState.targetWorldY.toFixed(1)}, ${animator.cameraState.targetZoom.toFixed(2)}), world=(${animator.cameraState.worldX.toFixed(1)}, ${animator.cameraState.worldY.toFixed(1)}, ${animator.cameraState.zoom.toFixed(2)}), focusIds=[${animator.cameraState.focusEntityIds.join(',')}]`);
        // console.log(logDetails.join('\n'));
    }
};