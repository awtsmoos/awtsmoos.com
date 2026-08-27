//B"H
// Animator.DataHandler.js (v1.1 - Initialize mood, appearanceSet, pathFollowState)

window.AnimatorCore_DataHandler = {
    _checkForEmbeddedData: function(animator) {
        const embeddedDataScript = document.getElementById('animationDataJson');
        if (embeddedDataScript?.textContent?.trim()) {
            try {
                const jsonData = JSON.parse(embeddedDataScript.textContent);
                this.loadAnimation(animator, jsonData);
                animator.ui.inputContainer.classList.add('hidden-exported');
                document.getElementById('exportBtn')?.classList.add('hidden-exported');
                document.getElementById('playbackControlsContainer')?.classList.add('full-width-exported');
                 document.getElementById('timelineIndicatorContainer')?.classList.add('full-width-exported'); // Export new UI element
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
        animator.stopAnimation();
        animator.animationData = data;
        animator.DATA = { ...window.AnimatorData, ...data.customData }; // Merge scene-specific data
        animator.currentTime = 0;
        
        const sc = data.scene;
        animator.canvas.width = sc.width || 800;
        animator.canvas.height = sc.height || 600;
        animator.canvas.style.backgroundColor = sc.backgroundColor || "#F0F8FF";
        animator.sceneLayers = (sc.layers || [{ name: animator.defaultLayerName, zIndex: 0, parallaxFactor: 1.0 }]).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        if (!animator.sceneLayers.find(l => l.name === animator.defaultLayerName)) {
            animator.sceneLayers.push({ name: animator.defaultLayerName, zIndex: 0, parallaxFactor: 1.0 });
        }
        animator.globalVariables = { ...(animator.DATA.SCENE_DATA?.globalVariables || {}), ...(sc.initialGlobalVariables || {}) };


        const iCam = sc.initialCamera || {};
        animator.cameraState = {
            ...animator.cameraState, // Preserve existing settings like minZoom, maxZoom, speeds
            worldX: iCam.x ?? animator.canvas.width / 2, worldY: iCam.y ?? animator.canvas.height / 2,
            zoom: iCam.zoom ?? 1, focusEntityIds: iCam.focusEntityIds || []
        };
        animator.cameraState.targetWorldX = animator.cameraState.worldX;
        animator.cameraState.targetWorldY = animator.cameraState.worldY;
        animator.cameraState.targetZoom = animator.cameraState.zoom;

        animator.eventTimeline = data.timeline.map((group, gi) => group.map((event, ei) => ({ ...event, _instanceId: `g${gi}_e${ei}` })));
        animator.CORE._buildTimelineUI(); // Build UI for timeline groups

        animator.charactersState = {};
        (data.characters || []).forEach(charDef => this._initializeCharacterState(animator, charDef));
        animator.objectsState = {};
        (data.objects || []).forEach(objDef => this._initializeObjectState(animator, objDef));

        Object.values(animator.charactersState).forEach(cs => animator.CHAR_PIPELINE.updateCharacterState(cs, 0, 0, animator));
        Object.values(animator.objectsState).forEach(os => animator.OBJECT_PIPELINE.updateObjectState(os, 0, 0, animator)); // Use OBJECT_PIPELINE

        if (!animator.cameraState.focusEntityIds.length && data.characters && data.characters.length > 0) {
            animator.cameraState.focusEntityIds = data.characters.map(c => c.id);
            animator.CAMERA_CONTROLS._calculateCameraFocusTarget(animator);
            animator.cameraState.worldX = animator.cameraState.targetWorldX;
            animator.cameraState.worldY = animator.cameraState.targetWorldY;
            animator.cameraState.zoom = animator.cameraState.targetZoom;
        }
        
        if (animator.eventTimeline[0]?.[0]) {
            animator.eventTimeline[0].forEach(e => {
                if (e.type === 'camera') animator.CAMERA_CONTROLS._applyCameraEvent(animator, e, true);
            });
        }
        animator.ui.statusDiv.textContent = `Loaded: ${data.characters.length} chars, ${animator.eventTimeline.length} event groups.`;
        animator.ui.playbackControlsContainer.classList.remove('hidden');
        animator.SCENE_DRAWING.drawScene(animator);
    },

    _initializeCharacterState: function(animator, charDef) {
        const templateId = charDef.templateId || 'human_default';
        const template = animator.DATA.CHARACTER_TEMPLATES[templateId];
        if (!template) {
            console.warn(`[Core] Char template "${templateId}" for "${charDef.id}" not found.`); return;
        }

        let initialPosX = charDef.initialPosition?.x ?? animator.canvas.width / 2;
        let initialPosY = charDef.initialPosition?.y ?? animator.canvas.height / 2;

        const charState = {
            id: charDef.id, templateId: templateId,
            x: initialPosX, y: initialPosY,
            size: charDef.size ?? 1.0,
            rotation: charDef.initialRotation ?? 0,
            layer: charDef.layer || animator.defaultLayerName,
            visible: charDef.visible !== false,
            targetX: initialPosX, targetY: initialPosY,
            walkStartTime: -1, walkDuration: 0, walkStartX: initialPosX, walkStartY: initialPosY,
            facingDirection: charDef.facing || 'right', facingMode: charDef.facingMode || 'front',
            activePoseName: charDef.initialPose || 'idle_default', previousPoseName: charDef.initialPose || 'idle_default',
            poseTransitionProgress: 1.0, poseTransitionDuration: charDef.poseTransitionDuration ?? 0.35,
            posePhase: Math.random() * Math.PI * 2, rootMotionYOffset: 0,
            mood: charDef.initialMood || 'neutral', // NEW
            activeExpressionName: charDef.appearance?.expression || 'neutral',
            previousExpressionName: charDef.appearance?.expression || 'neutral',
            expressionTransitionProgress: 1.0, expressionTransitionDuration: charDef.expressionTransitionDuration ?? 0.3,
            dialogueText: null, isSpeakingTTS: false, ttsUtterance: null,
            appearanceFlags: {
                gender: charDef.appearance?.gender || 'neutral',
                hasTzitzit: charDef.appearance?.hasTzitzit ?? (charDef.appearance?.gender === 'male'),
                hasYarmulke: charDef.appearance?.hasYarmulke ?? (charDef.appearance?.gender === 'male'),
            },
            resolvedPalette: this._resolvePalette(animator, template.palette, charDef.appearance?.palette),
            parts: {}, behaviorStates: {},
            activeBehaviors: JSON.parse(JSON.stringify(charDef.behaviors || template.defaultBehaviors || [])),
            attachedObject: null,
            activeAppearanceSet: charDef.appearance?.activeSet || null, // NEW
            pathFollowState: { isActive: false, pathId: null, progress: 0, duration: 1, loop: false, orientToPath: false }, // NEW
            interactionTarget: null, // For storing temporary interaction states
        };

        template.parts.forEach(pDef => {
            charState.parts[pDef.id] = {
                definition: pDef, effectiveDefinition: {},
                currentDimensions: { w: 0, h: 0 }, computedParams: {},
                proceduralRotation: 0, proceduralOffsetY: 0, // Added proceduralOffsetY for head nods etc.
                poseTransform: { x: 0, y: 0, rotation: 0 },
                charRelativeWorldMatrix: animator.UTILS.matrixIdentity(),
                behaviorStates: {}
            };
            if (pDef.attachedBehaviors) {
                charState.parts[pDef.id].attachedBehaviors = JSON.parse(JSON.stringify(pDef.attachedBehaviors));
            }
        });
        animator.charactersState[charDef.id] = charState;
    },

    _initializeObjectState: function(animator, objDef, parentObjState = null) { // Added parentObjState
        const templateId = objDef.templateId || 'generic_box'; 
        const template = animator.DATA.OBJECT_TEMPLATES[templateId];
        if (!template) { console.warn(`[Core] Obj template "${templateId}" for "${objDef.id}" not found.`); return null; }

        let initialPosX = objDef.initialPosition?.x;
        let initialPosY = objDef.initialPosition?.y;
        if (!parentObjState) { // Only use canvas center for root objects
            initialPosX = initialPosX ?? animator.canvas.width / 2;
            initialPosY = initialPosY ?? animator.canvas.height / 2;
        } else { // Child objects positions are relative if not specified, or absolute if specified
            initialPosX = initialPosX ?? 0; // Default to parent's origin if not specified
            initialPosY = initialPosY ?? 0;
        }


        let size = objDef.size ?? 1.0;
        
        // Calculate base dimensions based on template and size
        let baseW = (template.dimensions?.w || 10);
        let baseH = (template.dimensions?.h || 10);

        if (parentObjState && template.dimensions?.relativeTo) {
            let relativeToDim = {w:1, h:1};
            if(template.dimensions.relativeTo === "parentDimensions" && parentObjState.currentDimensions) {
                relativeToDim = parentObjState.currentDimensions;
            } else if (template.dimensions.relativeTo === "grandparentDimensions" && parentObjState.parentRef?.currentDimensions) { // Needs parentRef to be set up
                relativeToDim = parentObjState.parentRef.currentDimensions;
            }
            baseW = (template.dimensions.wFactor || 1) * relativeToDim.w;
            baseH = (template.dimensions.hFactor || 1) * relativeToDim.h;
        }


        const objState = {
            id: objDef.id, templateId,
            x: initialPosX, y: initialPosY, // These might be relative if it's a child
            rotation: objDef.initialRotation ?? 0,
            size: size, // This size now applies to factors if relative, or directly if absolute
            layer: objDef.layer || (parentObjState ? parentObjState.layer : animator.defaultLayerName),
            visible: objDef.visible !== false,
            definition: template,
            currentDimensions: { w: baseW * size, h: baseH * size },
            resolvedPalette: this._resolvePalette(animator, template.palette, objDef.appearance?.palette),
            worldMatrix: animator.UTILS.matrixIdentity(), // Will be calculated relative to parent or world
            localMatrix: animator.UTILS.matrixIdentity(), // Transform relative to its parent
            isAttachedTo: null,
            parentId: parentObjState ? parentObjState.id : null, // Store parent ID
            parentRef: parentObjState || null, // Direct reference for easier access
            childrenStates: {}, // For compound objects
            pathFollowState: { isActive: false, pathId: null, progress: 0, duration: 1, loop: false, orientToPath: false }, // NEW
            physicsState: template.physics ? { type: template.physics.type, ...template.physics, angleRad:0, velRad:0, xVel:0, yVel:0 } : null, // NEW for simple physics
        };

        if (template.children && template.children.length > 0) {
            template.children.forEach(childDef => {
                const childObjState = this._initializeObjectState(animator, childDef, objState); // Pass current objState as parent
                if (childObjState) {
                    objState.childrenStates[childDef.id] = childObjState;
                }
            });
        }
        
        if (!parentObjState) { // Only add root objects to the main objectsState
            animator.objectsState[objDef.id] = objState;
        }
        return objState;
    },

    _resolvePalette: function(animator, basePalette, overrides) {
        const combined = { ...(basePalette || {}), ...(overrides || {}) }; const resolved = {};
        for (const key in combined) {
            let value = combined[key];
            let attempts = 0; // Prevent infinite loops
            while (typeof value === 'string' && value.startsWith('@') && attempts < 10) {
                const refKey = value.substring(1);
                value = combined[refKey] || value; // Fallback to original ref if not found
                attempts++;
            }
            if(attempts >= 10) console.warn(`Possible circular palette reference for key ${key}`);
            resolved[key] = value;
        } return resolved;
    },

    restartAnimationPrerequisites: function(animator) {
        animator.currentEventGroupIndex = -1;
        animator.activeEventGroup = null;
        animator.activeEventGroupStatus = {};
        animator.currentTime = 0;
        animator.globalTimeScaleFactor = 1.0; // Reset time scale
        animator.activeScreenEffect = null; // Reset screen effects

        animator.SPEECH.cancel(); // Cancel all TTS
        if (animator.animationData) {
            animator.globalVariables = { ...(animator.DATA.SCENE_DATA?.globalVariables || {}), ...(animator.animationData.scene?.initialGlobalVariables || {}) };
            animator.charactersState = {};
            (animator.animationData.characters || []).forEach(cd => this._initializeCharacterState(animator, cd));
            animator.objectsState = {};
            (animator.animationData.objects || []).forEach(od => this._initializeObjectState(animator, od));

            Object.values(animator.charactersState).forEach(cs => animator.CHAR_PIPELINE.updateCharacterState(cs, 0, 0, animator));
            Object.values(animator.objectsState).forEach(os => animator.OBJECT_PIPELINE.updateObjectState(os, 0, 0, animator));

            const iCam = animator.animationData.scene?.initialCamera || {};
            animator.cameraState.targetWorldX = iCam.x ?? animator.canvas.width / 2;
            animator.cameraState.targetWorldY = iCam.y ?? animator.canvas.height / 2;
            animator.cameraState.targetZoom = iCam.zoom ?? 1;
            animator.cameraState.focusEntityIds = iCam.focusEntityIds || [];

            if (!animator.cameraState.focusEntityIds.length && animator.animationData.characters?.length > 0) {
                animator.cameraState.focusEntityIds = animator.animationData.characters.map(c => c.id);
                animator.CAMERA_CONTROLS._calculateCameraFocusTarget(animator);
            }
            animator.cameraState.worldX = animator.cameraState.targetWorldX;
            animator.cameraState.worldY = animator.cameraState.targetWorldY;
            animator.cameraState.zoom = animator.cameraState.targetZoom;
            
            if (animator.eventTimeline[0]?.[0]) {
                animator.eventTimeline[0].forEach(e => {
                    if (e.type === 'camera') animator.CAMERA_CONTROLS._applyCameraEvent(animator, e, true);
                });
            }
        }
        animator.CORE._updateTimelineUIFocus(); // Update UI after reset
    }
};