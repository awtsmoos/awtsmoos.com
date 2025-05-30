//B"H
// Animator.DataHandler.js

window.AnimatorCore_DataHandler = {
    _checkForEmbeddedData: function(animator) {
        const embeddedDataScript = document.getElementById('animationDataJson');
        if (embeddedDataScript?.textContent?.trim()) {
            try {
                const jsonData = JSON.parse(embeddedDataScript.textContent);
                this.loadAnimation(animator, jsonData); // Use 'this' to call loadAnimation within the same module
                animator.ui.inputContainer.classList.add('hidden-exported');
                document.getElementById('exportBtn')?.classList.add('hidden-exported');
                document.getElementById('playbackControlsContainer')?.classList.add('full-width-exported');
                document.body.classList.add('exported-body');
                const h1 = document.querySelector('h1'); if (h1) h1.classList.add('exported-h1');
                if (animator.animationData?.scene?.autoplay) setTimeout(() => animator.playAnimation(), 100);
            } catch (e) {
                console.error("Error loading embedded JSON:", e);
                animator.ui.statusDiv.textContent = "Error loading embedded JSON: " + e.message;
            }
        } else {
            if (animator.ui.statusDiv && !animator.animationData) animator.ui.statusDiv.textContent = "Load JSON to begin.";
        }
    },

    loadJsonFromTextarea: function(animator) {
        try {
            const data = JSON.parse(animator.ui.jsonInput.value);
            this.loadAnimation(animator, data);
        } catch (e) {
            animator.ui.statusDiv.textContent = "JSON Error: " + e.message + "\n" + e.stack;
            console.error("JSON Error:", e);
        }
    },

    loadJsonFromFile: function(animator, event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e_read) => {
            try {
                animator.ui.jsonInput.value = e_read.target.result;
                const data = JSON.parse(e_read.target.result);
                this.loadAnimation(animator, data);
            } catch (e) {
                animator.ui.statusDiv.textContent = "File JSON Error: " + e.message;
                console.error("File JSON Error:", e);
            }
        };
        reader.readAsText(file);
    },

    loadAnimation: function(animator, data) {
        if (!data?.scene || !data?.characters || !data?.timeline) {
            animator.ui.statusDiv.textContent = "Invalid JSON: Missing scene, characters, or timeline.";
            return;
        }
        animator.stopAnimation(); // Calls method on main animator instance
        animator.animationData = data;
        animator.currentTime = 0;
        console.log(`[ANIM_DEBUG_TRANSFORM] loadAnimation: Initializing with canvas size ${data.scene.width}x${data.scene.height}`);

        const sc = data.scene;
        animator.canvas.width = sc.width || 800;
        animator.canvas.height = sc.height || 600;
        animator.canvas.style.backgroundColor = sc.backgroundColor || "#F0F8FF";
        animator.sceneLayers = (sc.layers || [{ name: animator.defaultLayerName, zIndex: 0, parallaxFactor: 1.0 }]).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        if (!animator.sceneLayers.find(l => l.name === animator.defaultLayerName)) {
            animator.sceneLayers.push({ name: animator.defaultLayerName, zIndex: 0, parallaxFactor: 1.0 });
        }

        const iCam = sc.initialCamera || {};
        const initialCamX = iCam.x ?? animator.canvas.width / 2;
        const initialCamY = iCam.y ?? animator.canvas.height / 2;
        const initialCamZoom = iCam.zoom ?? 1;

        animator.cameraState = {
            ...animator.cameraState, // Preserve existing settings like minZoom, maxZoom, speeds
            worldX: initialCamX,
            worldY: initialCamY,
            zoom: initialCamZoom,
            focusEntityIds: iCam.focusEntityIds || [] // Use from JSON if present, else empty
        };
        // Set targets to current values initially
        animator.cameraState.targetWorldX = animator.cameraState.worldX;
        animator.cameraState.targetWorldY = animator.cameraState.worldY;
        animator.cameraState.targetZoom = animator.cameraState.zoom;
        console.log(`[ANIM_DEBUG_TRANSFORM] loadAnimation: Initial Camera State (pre-auto-focus): worldX=${animator.cameraState.worldX}, worldY=${animator.cameraState.worldY}, zoom=${animator.cameraState.zoom}`);

        animator.eventTimeline = data.timeline.map((group, gi) => group.map((event, ei) => ({ ...event, _instanceId: `g${gi}_e${ei}` })));

        animator.charactersState = {};
        (data.characters || []).forEach(charDef => this._initializeCharacterState(animator, charDef));
        animator.objectsState = {};
        (data.objects || []).forEach(objDef => this._initializeObjectState(animator, objDef));

        // Update character states for initial pose, dimensions etc.
        Object.values(animator.charactersState).forEach(cs => animator.CHAR_PIPELINE.updateCharacterState(cs, 0, 0, animator));
        Object.values(animator.objectsState).forEach(os => animator.STATE_MGMT._updateObjectState(animator, os, 0));

        // --- START OF NEW AUTO-FOCUS LOGIC ---
        // If no explicit focus entities are defined by initialCamera, try to auto-focus.
        if (!animator.cameraState.focusEntityIds.length && data.characters && data.characters.length > 0) {
            animator.cameraState.focusEntityIds = data.characters.map(c => c.id); // Focus on all characters
            console.log(`[ANIM_DEBUG_TRANSFORM] loadAnimation: No initial focus IDs. Auto-setting focus to: [${animator.cameraState.focusEntityIds.join(', ')}]`);
            animator.CAMERA_CONTROLS._calculateCameraFocusTarget(animator); // Calculate new targetX/Y/Zoom based on these entities

            // Snap camera to this new target immediately for the first frame
            animator.cameraState.worldX = animator.cameraState.targetWorldX;
            animator.cameraState.worldY = animator.cameraState.targetWorldY;
            animator.cameraState.zoom = animator.cameraState.targetZoom;
            console.log(`[ANIM_DEBUG_TRANSFORM] loadAnimation: Auto-focused camera. New camera state: world=(${animator.cameraState.worldX.toFixed(1)}, ${animator.cameraState.worldY.toFixed(1)}), zoom=${animator.cameraState.zoom.toFixed(2)}, target=(${animator.cameraState.targetWorldX.toFixed(1)}, ${animator.cameraState.targetWorldY.toFixed(1)}), targetZoom=${animator.cameraState.targetZoom.toFixed(2)}`);
        }
        // --- END OF NEW AUTO-FOCUS LOGIC ---

        animator.ui.statusDiv.textContent = `Loaded: ${data.characters.length} chars, ${animator.eventTimeline.length} event groups.`;
        animator.ui.playbackControlsContainer.classList.remove('hidden');

        // Apply any explicit camera events from the very first group in the timeline immediately
        // This allows timeline to override the auto-focus if needed for frame 0.
        if (animator.eventTimeline[0]?.[0]) {
            animator.eventTimeline[0].forEach(e => {
                if (e.type === 'camera') {
                    console.log(`[ANIM_DEBUG_TRANSFORM] loadAnimation: Applying initial timeline camera event:`, e);
                    animator.CAMERA_CONTROLS._applyCameraEvent(animator, e, true); // true for immediate snap
                }
            });
        }
        console.log(`[ANIM_DEBUG_TRANSFORM] loadAnimation: Finished. Drawing scene. Final camera: world=(${animator.cameraState.worldX.toFixed(1)}, ${animator.cameraState.worldY.toFixed(1)}), zoom=${animator.cameraState.zoom.toFixed(2)}`);
        animator.SCENE_DRAWING.drawScene(animator);
    },

    _initializeCharacterState: function(animator, charDef) {
        const templateId = charDef.templateId || 'human_default';
        const template = animator.DATA.CHARACTER_TEMPLATES[templateId];
        if (!template) {
            console.warn(`[Core] Char template "${templateId}" for "${charDef.id}" not found. Character will not be initialized.`);
            return;
        }

        let initialPosX = charDef.initialPosition?.x;
        let initialPosY = charDef.initialPosition?.y;
        let posXSource = "charDef";
        let posYSource = "charDef";


        if (typeof initialPosX !== 'number' || isNaN(initialPosX)) {
            initialPosX = animator.canvas.width / 2;
            posXSource = `canvas.width/2 (was ${charDef.initialPosition?.x})`;
        }
        if (typeof initialPosY !== 'number' || isNaN(initialPosY)) {
            initialPosY = animator.canvas.height / 2;
            posYSource = `canvas.height/2 (was ${charDef.initialPosition?.y})`;
        }
        console.log(`[ANIM_DEBUG_TRANSFORM] _initializeCharacterState (${charDef.id}): initialPosX=${initialPosX.toFixed(1)} (source: ${posXSource}), initialPosY=${initialPosY.toFixed(1)} (source: ${posYSource})`);


        const charState = {
            id: charDef.id, templateId: templateId,
            x: initialPosX, y: initialPosY,
            size: (typeof charDef.size === 'number' && !isNaN(charDef.size)) ? charDef.size : 1.0,
            rotation: (typeof charDef.initialRotation === 'number' && !isNaN(charDef.initialRotation)) ? charDef.initialRotation : 0,
            layer: charDef.layer || animator.defaultLayerName,
            visible: charDef.visible !== false,
            targetX: initialPosX, targetY: initialPosY,
            walkStartTime: -1,
            walkDuration: 0,
            walkStartX: initialPosX,
            walkStartY: initialPosY,
            facingDirection: charDef.facing || 'right',
            facingMode: charDef.facingMode || 'front',
            activePoseName: charDef.initialPose || 'idle_default',
            previousPoseName: charDef.initialPose || 'idle_default',
            poseTransitionProgress: 1.0,
            poseTransitionDuration: (typeof charDef.poseTransitionDuration === 'number' && !isNaN(charDef.poseTransitionDuration)) ? charDef.poseTransitionDuration : 0.35,
            posePhase: Math.random() * Math.PI * 2,
            rootMotionYOffset: 0,
            activeExpressionName: charDef.appearance?.expression || 'neutral',
            previousExpressionName: charDef.appearance?.expression || 'neutral',
            expressionTransitionProgress: 1.0,
            expressionTransitionDuration: (typeof charDef.expressionTransitionDuration === 'number' && !isNaN(charDef.expressionTransitionDuration)) ? charDef.expressionTransitionDuration : 0.3,
            dialogueText: null, isSpeakingTTS: false, ttsUtterance: null,
            appearanceFlags: {
                gender: charDef.appearance?.gender || 'neutral',
                hasTzitzit: charDef.appearance?.hasTzitzit ?? (charDef.appearance?.gender === 'male'),
                hasYarmulke: charDef.appearance?.hasYarmulke ?? (charDef.appearance?.gender === 'male'),
            },
            resolvedPalette: this._resolvePalette(animator, template.palette, charDef.appearance?.palette),
            parts: {},
            behaviorStates: {},
            activeBehaviors: JSON.parse(JSON.stringify(charDef.behaviors || template.defaultBehaviors || [])),
            attachedObject: null,
        };

        template.parts.forEach(pDef => {
            charState.parts[pDef.id] = {
                definition: pDef,
                effectiveDefinition: {},
                currentDimensions: { w: 0, h: 0 },
                computedParams: {},
                proceduralRotation: 0,
                poseTransform: { x: 0, y: 0, rotation: 0 },
                charRelativeWorldMatrix: animator.UTILS.matrixIdentity(),
                behaviorStates: {}
            };
            if (pDef.attachedBehaviors) {
                charState.parts[pDef.id].attachedBehaviors = JSON.parse(JSON.stringify(pDef.attachedBehaviors));
            }
        });
        animator.charactersState[charDef.id] = charState;
        console.log(`[ANIM_DEBUG_TRANSFORM] _initializeCharacterState (${charDef.id}): Final state x=${charState.x.toFixed(1)}, y=${charState.y.toFixed(1)}, targetX=${charState.targetX.toFixed(1)}, targetY=${charState.targetY.toFixed(1)}`);
    },

    _initializeObjectState: function(animator, objDef) {
        const templateId = objDef.templateId || 'generic_box'; const template = animator.DATA.OBJECT_TEMPLATES[templateId];
        if (!template) { console.warn(`[Core] Obj template "${templateId}" for "${objDef.id}" not found.`); return; }

        let initialPosX = objDef.initialPosition?.x;
        let initialPosY = objDef.initialPosition?.y;
        let posXSource = "objDef";
        let posYSource = "objDef";

        if (typeof initialPosX !== 'number' || isNaN(initialPosX)) {
            initialPosX = animator.canvas.width / 2;
            posXSource = `canvas.width/2 (was ${objDef.initialPosition?.x})`;
        }
        if (typeof initialPosY !== 'number' || isNaN(initialPosY)) {
            initialPosY = animator.canvas.height / 2;
            posYSource = `canvas.height/2 (was ${objDef.initialPosition?.y})`;
        }
        console.log(`[ANIM_DEBUG_TRANSFORM] _initializeObjectState (${objDef.id}): initialPosX=${initialPosX.toFixed(1)} (source: ${posXSource}), initialPosY=${initialPosY.toFixed(1)} (source: ${posYSource})`);


        let size = (typeof objDef.size === 'number' && !isNaN(objDef.size)) ? objDef.size : 1.0;

        const objState = {
            id: objDef.id, templateId,
            x: initialPosX, y: initialPosY,
            rotation: (typeof objDef.initialRotation === 'number' && !isNaN(objDef.initialRotation)) ? objDef.initialRotation : 0,
            size: size,
            layer: objDef.layer || animator.defaultLayerName,
            visible: objDef.visible !== false,
            definition: template,
            currentDimensions: {
                w: (template.dimensions?.w || 10) * size,
                h: (template.dimensions?.h || 10) * size
            },
            resolvedPalette: this._resolvePalette(animator, template.palette, objDef.appearance?.palette),
            worldMatrix: animator.UTILS.matrixIdentity(),
            isAttachedTo: null,
        };
        animator.objectsState[objDef.id] = objState;
        console.log(`[ANIM_DEBUG_TRANSFORM] _initializeObjectState (${objDef.id}): Final state x=${objState.x.toFixed(1)}, y=${objState.y.toFixed(1)}`);
    },

    _resolvePalette: function(animator, basePalette, overrides) { // animator param not used, but for consistency
        const combined = { ...(basePalette || {}), ...(overrides || {}) }; const resolved = {};
        for (const key in combined) {
            let value = combined[key];
            if (typeof value === 'string' && value.startsWith('@')) {
                const refKey = value.substring(1);
                resolved[key] = combined[refKey] || value;
            } else {
                resolved[key] = value;
            }
        } return resolved;
    },

    restartAnimationPrerequisites: function(animator) {
        animator.currentEventGroupIndex = -1;
        animator.activeEventGroup = null;
        animator.activeEventGroupStatus = {};
        animator.currentTime = 0;
        console.log(`[ANIM_DEBUG_TRANSFORM] restartAnimationPrerequisites: Reset timeline and time.`);

        animator.SPEECH.cancel();
        if (animator.animationData) {
            // Re-initialize character and object states
            animator.charactersState = {};
            (animator.animationData.characters || []).forEach(cd => this._initializeCharacterState(animator, cd));
            animator.objectsState = {};
            (animator.animationData.objects || []).forEach(od => this._initializeObjectState(animator, od));

            // Update character states for initial pose, dimensions etc.
            Object.values(animator.charactersState).forEach(cs => animator.CHAR_PIPELINE.updateCharacterState(cs, 0, 0, animator));
            Object.values(animator.objectsState).forEach(os => animator.STATE_MGMT._updateObjectState(animator, os, 0));

            // Reset camera to initial scene settings or defaults
            const iCam = animator.animationData.scene?.initialCamera || {};
            const initialCamX = iCam.x ?? animator.canvas.width / 2;
            const initialCamY = iCam.y ?? animator.canvas.height / 2;
            const initialCamZoom = iCam.zoom ?? 1;
            
            animator.cameraState.targetWorldX = initialCamX;
            animator.cameraState.targetWorldY = initialCamY;
            animator.cameraState.targetZoom = initialCamZoom;
            animator.cameraState.focusEntityIds = iCam.focusEntityIds || []; // Reset focus IDs from JSON

            // --- START OF AUTO-FOCUS LOGIC ON RESTART (similar to loadAnimation) ---
            if (!animator.cameraState.focusEntityIds.length && animator.animationData.characters && animator.animationData.characters.length > 0) {
                animator.cameraState.focusEntityIds = animator.animationData.characters.map(c => c.id);
                console.log(`[ANIM_DEBUG_TRANSFORM] restartAnimationPrerequisites: No initial focus IDs. Auto-setting focus to: [${animator.cameraState.focusEntityIds.join(', ')}]`);
                animator.CAMERA_CONTROLS._calculateCameraFocusTarget(animator); // Calculate new targetX/Y/Zoom
            }
            // --- END OF AUTO-FOCUS LOGIC ON RESTART ---

            // Snap camera world position to its target for restart
            animator.cameraState.worldX = animator.cameraState.targetWorldX;
            animator.cameraState.worldY = animator.cameraState.targetWorldY;
            animator.cameraState.zoom = animator.cameraState.targetZoom;
            console.log(`[ANIM_DEBUG_TRANSFORM] restartAnimationPrerequisites: Camera reset. world=(${animator.cameraState.worldX.toFixed(1)}, ${animator.cameraState.worldY.toFixed(1)}), zoom=${animator.cameraState.zoom.toFixed(2)}, target=(${animator.cameraState.targetWorldX.toFixed(1)}, ${animator.cameraState.targetWorldY.toFixed(1)}), targetZoom=${animator.cameraState.targetZoom.toFixed(2)}`);

            // Apply any explicit camera events from the very first group in the timeline immediately
            if (animator.eventTimeline[0]?.[0]) {
                animator.eventTimeline[0].forEach(e => {
                    if (e.type === 'camera') {
                         console.log(`[ANIM_DEBUG_TRANSFORM] restartAnimationPrerequisites: Applying initial timeline camera event:`, e);
                         animator.CAMERA_CONTROLS._applyCameraEvent(animator, e, true); // true for immediate snap
                    }
                });
            }
        }
    }
};