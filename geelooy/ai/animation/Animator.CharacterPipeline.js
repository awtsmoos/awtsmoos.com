//B"H
// Animator.CharacterPipeline.js (v1.7 - Eyebrow support, Pathfinding prep)
// B"H - Helper functions for the character update process

window.AnimatorCharacterPipeline = {
    updateCharacterState: function(charState, deltaTime, currentTime, animatorInstance) {
        const template = animatorInstance.DATA.CHARACTER_TEMPLATES[charState.templateId];
        if (!template) {
            console.warn(`[CharacterPipeline] Template not found for char ${charState.id}. Skipping update.`);
            if (typeof charState.x !== 'number' || isNaN(charState.x)) charState.x = 0;
            if (typeof charState.y !== 'number' || isNaN(charState.y)) charState.y = 0;
            return;
        }

        // Path following behavior might override standard movement
        if (!charState.pathFollowState || !charState.pathFollowState.isActive) {
            this._updateCharacterMovementAndTransitions(charState, deltaTime, currentTime, template, animatorInstance.UTILS, animatorInstance.DATA);
        }
        this._resolveEffectivePartDefinitions(charState, template, animatorInstance.DATA); 
        this._calculatePartDimensions(charState, template); 
        this._evaluatePoseAndExpression(charState, template, animatorInstance.UTILS, animatorInstance.DATA); 
        this._applyCharacterBehaviors(charState, deltaTime, currentTime, template, animatorInstance.DATA, animatorInstance.UTILS, animatorInstance); 
        this._calculateAllPartMatrices(charState, template, animatorInstance.UTILS); // First pass
        this._solveIKForCharacter(charState, template, animatorInstance.UTILS, animatorInstance.DATA);
        this._calculateAllPartMatrices(charState, template, animatorInstance.UTILS); // Second pass (Final)
        this._updateAttachedObjectPosition(charState, animatorInstance.objectsState, animatorInstance.UTILS, template);
    },

    _updateCharacterMovementAndTransitions: function(charState, deltaTime, currentTime, template, UTILS, DATA) {
        // Initialize positions if NaN
        if (typeof charState.x !== 'number' || isNaN(charState.x)) charState.x = (typeof charState.targetX === 'number' && !isNaN(charState.targetX)) ? charState.targetX : 0;
        if (typeof charState.y !== 'number' || isNaN(charState.y)) charState.y = (typeof charState.targetY === 'number' && !isNaN(charState.targetY)) ? charState.targetY : 0;

        // Transitions
        if (charState.poseTransitionProgress < 1) charState.poseTransitionProgress = Math.min(1, charState.poseTransitionProgress + deltaTime / (charState.poseTransitionDuration || 0.001));
        if (charState.expressionTransitionProgress < 1) charState.expressionTransitionProgress = Math.min(1, charState.expressionTransitionProgress + deltaTime / (charState.expressionTransitionDuration || 0.001));
        
        // Initialize walk/target states if NaN
        if (typeof charState.walkStartX !== 'number' || isNaN(charState.walkStartX)) charState.walkStartX = charState.x;
        if (typeof charState.walkStartY !== 'number' || isNaN(charState.walkStartY)) charState.walkStartY = charState.y;
        if (typeof charState.targetX !== 'number' || isNaN(charState.targetX)) charState.targetX = charState.x;
        if (typeof charState.targetY !== 'number' || isNaN(charState.targetY)) charState.targetY = charState.y;

        // Standard walk movement (not path following)
        if (charState.walkDuration > 0 && charState.walkStartTime >= 0 && (!charState.pathFollowState || !charState.pathFollowState.isActive)) { 
            const timeInWalk = currentTime - charState.walkStartTime;
            const currentWalkDuration = Math.max(0.001, charState.walkDuration); 
            const progress = UTILS.clamp(timeInWalk / currentWalkDuration, 0, 1);
            
            let nextX = UTILS.lerp(charState.walkStartX, charState.targetX, UTILS.smoothStep(progress));
            let nextY = UTILS.lerp(charState.walkStartY, charState.targetY, UTILS.smoothStep(progress));
            
            if (typeof nextX !== 'number' || isNaN(nextX)) nextX = charState.targetX;
            if (typeof nextY !== 'number' || isNaN(nextY)) nextY = charState.targetY;
            
            charState.x = nextX; charState.y = nextY;

            if (progress >= 1) {
                charState.walkDuration = 0; 
                charState.x = charState.targetX; // Snap to final target
                charState.y = charState.targetY;
            }
        }
        
        let currentPoseData = DATA.POSES[charState.activePoseName] || {};
        let poseSpeedFactor = currentPoseData.speedFactor || 1.0;
        if (charState.walkDuration > 0 && charState.activePoseName === 'walk') { // Also applies to path following if pose is 'walk'
            let walkPoseData = DATA.POSES['walk'] || {}; // Consider active walk style
            poseSpeedFactor = (walkPoseData.speedFactor || 1.8); 
        }
        charState.posePhase = (charState.posePhase + deltaTime * poseSpeedFactor * 2.5) % (Math.PI * 2);
    },

    _resolveEffectivePartDefinitions: function(charState, template, DATA) {
        const facingKey = `${charState.facingMode}_${charState.facingDirection}`;
        const modeKey = charState.facingMode; 
        const templateOverrides = template.facingOverrides || {};
        const overrides = templateOverrides[facingKey] || templateOverrides[modeKey] || templateOverrides["front"] || {}; 
        
        // Apply appearance set overrides if active
        let appearanceSetOverrides = {};
        if (charState.activeAppearanceSet && template.appearanceSets && template.appearanceSets[charState.activeAppearanceSet]) {
            appearanceSetOverrides = template.appearanceSets[charState.activeAppearanceSet];
        }

        for (const partId in charState.parts) {
            const pState = charState.parts[partId];
            pState.effectiveDefinition = JSON.parse(JSON.stringify(pState.definition)); 
            const effDef = pState.effectiveDefinition;
            
            // Merge facing overrides
            const partOvr = overrides[partId];
            if (partOvr) {
                Object.keys(partOvr).forEach(key => {
                    if (typeof partOvr[key] === 'object' && partOvr[key] !== null && !Array.isArray(partOvr[key]) &&
                        effDef[key] && typeof effDef[key] === 'object' && !Array.isArray(effDef[key])) {
                        effDef[key] = { ...effDef[key], ...partOvr[key] }; 
                    } else { effDef[key] = partOvr[key]; }
                });
            }

            // Merge appearance set overrides (these take precedence over facing for shape/color)
            const appSetPartOvr = appearanceSetOverrides[partId];
            if (appSetPartOvr) {
                 Object.keys(appSetPartOvr).forEach(key => {
                    if (key === 'shape' && effDef.shape && appSetPartOvr.shape) { // Deep merge for shape
                        effDef.shape = { ...effDef.shape, ...appSetPartOvr.shape };
                    } else if (typeof appSetPartOvr[key] === 'object' && appSetPartOvr[key] !== null && !Array.isArray(appSetPartOvr[key]) &&
                        effDef[key] && typeof effDef[key] === 'object' && !Array.isArray(effDef[key])) {
                        effDef[key] = { ...effDef[key], ...appSetPartOvr[key] };
                    } else {
                        effDef[key] = appSetPartOvr[key];
                    }
                });
            }

            if (effDef.genderConditional) {
                let show = effDef.visible !== false; 
                if (effDef.genderConditional === 'male') {
                    if (charState.appearanceFlags.gender !== 'male') show = false;
                    else {
                        if (partId.startsWith('tzitzit_') && !charState.appearanceFlags.hasTzitzit) show = false;
                        else if (partId === 'yarmulke' && !charState.appearanceFlags.hasYarmulke) show = false;
                    }
                } else if (effDef.genderConditional === 'female') {
                    if (charState.appearanceFlags.gender !== 'female') show = false;
                }
                effDef.visible = show;
            }
            pState.visible = effDef.visible !== false;
            effDef.zIndex = effDef.zIndex ?? (pState.definition.zIndex || 0); 
        }
    },

    _calculatePartDimensions: function(charState, template) {
        const baseSizeForDimCalc = template.baseHeight; 
        for (const partId in charState.parts) {
            const pState = charState.parts[partId];
            const effDef = pState.effectiveDefinition;
            if (effDef && effDef.dimensions) {
                pState.currentDimensions.w = (effDef.dimensions.wFactor || 0.1) * baseSizeForDimCalc;
                pState.currentDimensions.h = (effDef.dimensions.hFactor || 0.1) * baseSizeForDimCalc;
                if (isNaN(pState.currentDimensions.w)) pState.currentDimensions.w = 1;
                if (isNaN(pState.currentDimensions.h)) pState.currentDimensions.h = 1;
            } else { pState.currentDimensions.w = 1; pState.currentDimensions.h = 1; }
        }
    },

    _evaluatePoseAndExpression: function(charState, template, UTILS, DATA) {
        const curPoseN = charState.activePoseName; const prevPoseN = charState.previousPoseName; const tP = UTILS.smoothStep(charState.poseTransitionProgress);
        
        // Mood-based expression override
        let activeExprName = charState.activeExpressionName;
        if (charState.mood && template.moodToExpressionMap && template.moodToExpressionMap[charState.mood]) {
            activeExprName = template.moodToExpressionMap[charState.mood];
            // If mood changes, we might want to force expression transition
            if (charState.activeExpressionName !== activeExprName) {
                charState.previousExpressionName = charState.activeExpressionName;
                charState.activeExpressionName = activeExprName;
                charState.expressionTransitionProgress = 0;
            }
        }
        const curExprN = charState.activeExpressionName; const prevExprN = charState.previousExpressionName; const tE = UTILS.smoothStep(charState.expressionTransitionProgress);

        const curPose = DATA.POSES[curPoseN] || {}; const prevPose = DATA.POSES[prevPoseN] || {};
        const curExpr = DATA.EXPRESSIONS[curExprN] || {}; const prevExpr = DATA.EXPRESSIONS[prevExprN] || {};
        const baseScaleForFactors = template.baseHeight;

        const getPVal = (poseDef, partIdForPose, prop, defaultValue) => {
            const partPose = poseDef[partIdForPose];
            if (partPose && partPose[prop] !== undefined) {
                return typeof partPose[prop] === 'function' ? partPose[prop](charState.posePhase, charState) : partPose[prop];
            } return defaultValue;
        };
        const getEVal = (exprDef, partId, prop, defaultValue) => {
            const partExpr = exprDef[partId];
            return (partExpr && partExpr[prop] !== undefined) ? partExpr[prop] : defaultValue;
        };

        const prevRootY = typeof prevPose.rootMotionYFactor === 'function' ? prevPose.rootMotionYFactor(charState.posePhase, charState) : (prevPose.rootMotionYFactor || 0);
        const currRootY = typeof curPose.rootMotionYFactor === 'function' ? curPose.rootMotionYFactor(charState.posePhase, charState) : (curPose.rootMotionYFactor || 0);
        charState.rootMotionYOffset = UTILS.lerp(prevRootY, currRootY, tP) * baseScaleForFactors; 

        for (const pId in charState.parts) {
            const pState = charState.parts[pId];
            if (!pState.effectiveDefinition) { 
                pState.poseTransform = { x: 0, y: 0, rotation: 0 }; pState.computedParams = {}; continue;
            }
            const idForPose = pState.effectiveDefinition.idAlias || pId;
            pState.poseTransform = {
                x: UTILS.lerp(getPVal(prevPose, idForPose, 'xFactor', 0), getPVal(curPose, idForPose, 'xFactor', 0), tP) * baseScaleForFactors,
                y: UTILS.lerp(getPVal(prevPose, idForPose, 'yFactor', 0), getPVal(curPose, idForPose, 'yFactor', 0), tP) * baseScaleForFactors,
                rotation: UTILS.lerp(getPVal(prevPose, idForPose, 'rotation', 0), getPVal(curPose, idForPose, 'rotation', 0), tP),
            };
            if (!pState.computedParams) pState.computedParams = {};

            if (pState.effectiveDefinition.shape?.type === 'eye') {
                pState.computedParams.openFactor = UTILS.lerp(getEVal(prevExpr, pId, 'openFactor', 1), getEVal(curExpr, pId, 'openFactor', 1), tE);
                const eyeWidth = pState.currentDimensions.w; const eyeHeight = pState.currentDimensions.h;
                pState.computedParams.pupilShiftX = (UTILS.lerp(getEVal(prevExpr, pId, 'pupilShiftXFactor', 0), getEVal(curExpr, pId, 'pupilShiftXFactor', 0), tE)) * eyeWidth * 0.2; 
                pState.computedParams.pupilShiftY = (UTILS.lerp(getEVal(prevExpr, pId, 'pupilShiftYFactor', 0), getEVal(curExpr, pId, 'pupilShiftYFactor', 0), tE)) * eyeHeight * 0.2;
            } else if (pState.effectiveDefinition.shape?.type === 'mouth') {
                pState.computedParams.shapeKey = tE < 0.5 ? (getEVal(prevExpr, pId, 'shapeKey', 'neutral')) : (getEVal(curExpr, pId, 'shapeKey', 'neutral'));
                pState.computedParams.fillColor = tE < 0.5 ? (getEVal(prevExpr, pId, 'fillColor', null)) : (getEVal(curExpr, pId, 'fillColor', null));
            } else if (pState.effectiveDefinition.shape?.type === 'eyebrow') {
                const baseRot = UTILS.lerp(getEVal(prevExpr, pId, 'rotation', 0), getEVal(curExpr, pId, 'rotation', 0), tE);
                const baseYOff = UTILS.lerp(getEVal(prevExpr, pId, 'yOffsetFactor', 0), getEVal(curExpr, pId, 'yOffsetFactor', 0), tE) * baseScaleForFactors;
                
                pState.computedParams.rotation = baseRot + (pState.computedParams.proceduralRotation || 0);
                pState.computedParams.yOffset = baseYOff + (pState.computedParams.proceduralYOffset || 0);
                pState.computedParams.shapeKey = tE < 0.5 ? (getEVal(prevExpr, pId, 'shapeKey', 'neutral')) : (getEVal(curExpr, pId, 'shapeKey', 'neutral'));
            }
            // Apply head procedural offsets from lipSync if any
            if (pId === 'head') {
                pState.poseTransform.rotation += (pState.proceduralRotation || 0);
                pState.poseTransform.y += (pState.proceduralOffsetY || 0);
                pState.proceduralRotation = UTILS.lerp(pState.proceduralRotation || 0, 0, 0.1); // Dampen
                pState.proceduralOffsetY = UTILS.lerp(pState.proceduralOffsetY || 0, 0, 0.1); // Dampen
            }
        }
    },

    _applyCharacterBehaviors: function(charState, deltaTime, currentTime, template, DATA, UTILS, animatorInstance) {
        const baseScaleForBehaviors = template.baseHeight; 
        (charState.activeBehaviors || []).forEach(behDef => {
            const handler = DATA.BEHAVIOR_HANDLERS[behDef.type] || UTILS._defaultBehaviorHandlers[behDef.type];
            if (handler) handler(charState, behDef, deltaTime, currentTime, baseScaleForBehaviors, animatorInstance);
        });
        for (const partId in charState.parts) {
            const pState = charState.parts[partId];
            if (pState.attachedBehaviors) {
                pState.attachedBehaviors.forEach(attBehDef => {
                    const handler = DATA.BEHAVIOR_HANDLERS[attBehDef.type] || UTILS._defaultBehaviorHandlers[attBehDef.type];
                    if (handler) handler(charState, { partId, config: attBehDef.config || attBehDef }, deltaTime, currentTime, baseScaleForBehaviors, animatorInstance);
                });
            }
        }
        // Apply path follower behavior if active (it's an entity-level behavior but managed by events)
        if (charState.pathFollowState && charState.pathFollowState.isActive) {
            const handler = UTILS._defaultBehaviorHandlers.pathFollower;
            if(handler) handler(charState, null, deltaTime, currentTime, baseScaleForBehaviors, animatorInstance);
        }
    },

    _solveIKForCharacter: function(charState, template, UTILS, DATA) {
        const currentPoseDef = DATA.POSES[charState.activePoseName] || {};
        Object.values(charState.parts).forEach(effectorPartState => { 
            const posePartKey = effectorPartState.effectiveDefinition.idAlias || effectorPartState.definition.id;
            const poseProps = currentPoseDef[posePartKey];
            if (!poseProps || !poseProps.ikTarget) return;
            
            let ikChainIds = effectorPartState.effectiveDefinition?.ikChain;
            // If effector itself is part of ikChain in definition, use it. Otherwise, use poseProps.ikChain.
            if (!ikChainIds && poseProps.ikChain) ikChainIds = poseProps.ikChain;
            if (!ikChainIds || !Array.isArray(ikChainIds) || ikChainIds.length !== 3) return;

            const [ulIdAliased, llIdAliased, effIdAliased] = ikChainIds;
            const resolveAlias = (alias) => { for (const pid in charState.parts) if (charState.parts[pid].effectiveDefinition?.idAlias === alias || pid === alias) return pid; return alias; };
            const ulId = resolveAlias(ulIdAliased); const llId = resolveAlias(llIdAliased); const effId = resolveAlias(effIdAliased);
            
            const actualEffectorState = charState.parts[effId];
            if (!actualEffectorState) return;
            
            const ulState = charState.parts[ulId], llState = charState.parts[llId];
            if (!ulState?.currentDimensions?.h || !llState?.currentDimensions?.h || 
                !ulState?.effectiveDefinition?.parentId || !ulState?.effectiveDefinition?.anchorToParent || 
                !ulState?.effectiveDefinition?.pivot || !llState?.effectiveDefinition?.pivot ||
                !ulState?.charRelativeWorldMatrix ) { return; } // Removed llState.charRelativeWorldMatrix as it's not needed for base calc

            const len1 = ulState.currentDimensions.h; const len2 = llState.currentDimensions.h;
            const ulParentId = ulState.effectiveDefinition.parentId;
            const ulParentCharRelativeMatrix = ulParentId ? (charState.parts[ulParentId]?.charRelativeWorldMatrix || UTILS.matrixIdentity()) : UTILS.matrixIdentity();
            
            // Calculate the IK base point (shoulder/hip joint) in character-relative space
            // This needs to use the parent's matrix and the anchor point of the upper limb to its parent
            let tempUlMatrix = UTILS.matrixIdentity();
            if (ulParentId) {
                 const parentState = charState.parts[ulParentId];
                 if(parentState && parentState.currentDimensions && parentState.effectiveDefinition?.pivot && ulState.effectiveDefinition.anchorToParent) {
                    const parentDim = parentState.currentDimensions;
                    // Anchor point on parent relative to parent's pivot
                    const anchorX = (ulState.effectiveDefinition.anchorToParent.x * parentDim.w) - (parentState.effectiveDefinition.pivot.x * parentDim.w);
                    const anchorY = (ulState.effectiveDefinition.anchorToParent.y * parentDim.h) - (parentState.effectiveDefinition.pivot.y * parentDim.h);
                    tempUlMatrix = UTILS.matrixTranslate(tempUlMatrix, anchorX, anchorY); // Translate from parent's pivot to anchor point
                 }
            }
            tempUlMatrix = UTILS.matrixMultiply(ulParentCharRelativeMatrix, tempUlMatrix); // Now tempUlMatrix is at the anchor point in char-relative space
            // Now add upper limb's own pivot translation (as IK is usually from pivot to pivot)
            tempUlMatrix = UTILS.matrixTranslate(tempUlMatrix, ulState.effectiveDefinition.pivot.x * ulState.currentDimensions.w, ulState.effectiveDefinition.pivot.y * ulState.currentDimensions.h); 
            // Add pose transform for upper limb, as this might shift its base for IK
            tempUlMatrix = UTILS.matrixTranslate(tempUlMatrix, ulState.poseTransform.x || 0, ulState.poseTransform.y || 0); 


            const ikBase = UTILS.getTranslationFromMatrix(tempUlMatrix);
            
            const targetDef = poseProps.ikTarget; 
            let targetPartState = charState.parts[targetDef.partId]; 
            if (!targetPartState) { 
                for (const pppId in charState.parts) { if (charState.parts[pppId].effectiveDefinition.idAlias === targetDef.partId) { targetPartState = charState.parts[pppId]; break; }}
            }
            if (!targetPartState?.charRelativeWorldMatrix || !targetPartState?.currentDimensions || !targetPartState?.effectiveDefinition?.pivot) return;
            
            const tAnchorFactor = targetDef.anchorFactor || {x: 0.5, y: 0.5}; 
            const tDimW = targetPartState.currentDimensions.w; const tDimH = targetPartState.currentDimensions.h; 
            const tPivot = targetPartState.effectiveDefinition.pivot;
            const targetLocalPt = { x: (tAnchorFactor.x * tDimW) - (tPivot.x * tDimW), y: (tAnchorFactor.y * tDimH) - (tPivot.y * tDimH) };
            const ikTargetCharRelative = UTILS.transformPoint(targetLocalPt, targetPartState.charRelativeWorldMatrix);
            
            let preferBend = poseProps.preferBendClockwise;
            if (typeof preferBend === 'function') preferBend = preferBend(charState);
            
            const ikResult = UTILS.solve2LinkIK(ikBase.x, ikBase.y, ikTargetCharRelative.x, ikTargetCharRelative.y, len1, len2, preferBend);
            
            const ulParentActualRotationRad = UTILS.getRotationFromMatrix(ulParentCharRelativeMatrix);
            
            // The IK result angle0 is world-relative (or char-relative if base was char-relative).
            // We need to set the limb's rotation relative to its parent.
            ulState.poseTransform.rotation = UTILS.radToDeg(ikResult.angles[0] - ulParentActualRotationRad) - UTILS.radToDeg(UTILS.getRotationFromMatrix(tempUlMatrix) - ulParentActualRotationRad - (ulState.poseTransform.rotation ? UTILS.degToRad(ulState.poseTransform.rotation) : 0) ); // Subtract initial pose rotation and parent's rotation
            llState.poseTransform.rotation = UTILS.radToDeg(ikResult.angles[1]); 
            
            ulState.proceduralRotation = 0; llState.proceduralRotation = 0; // IK overrides procedural physics for these parts
            
            if (actualEffectorState.poseTransform && effId !== llId && effId !== ulId) { // If effector is a third part (e.g. hand)
                // Hand's rotation should align with the lower limb's end direction.
                // Angle of lower limb in char-relative space = ikResult.angles[0] + ikResult.angles[1]
                // Angle of lower limb's parent (upper limb) in char-relative space = ikResult.angles[0]
                // So, hand rotation relative to lower limb should be ... complicated if lower limb also has a pose rotation.
                // Simplest: align effector with the direction of the second link.
                // The second link's angle (angle1) is already relative to the first. So this should be fine.
                actualEffectorState.poseTransform.rotation = UTILS.radToDeg(ikResult.angles[1]); 
                actualEffectorState.proceduralRotation = 0;
            }
        });
    },

    _calculateAllPartMatrices: function(charState, template, UTILS) {
        let charInternalRootMatrix = UTILS.matrixIdentity();
        charInternalRootMatrix = UTILS.matrixTranslate(charInternalRootMatrix, 0, charState.rootMotionYOffset);

        const processedParents = new Set(); 
        let partsToProcess = template.parts.map(pDef => pDef.id);
        let iteration = 0, maxIterations = template.parts.length + 5; 

        while(partsToProcess.length > 0 && iteration < maxIterations) {
            let processedInThisIteration = 0;
            let remainingParts = [];

            for (const partId of partsToProcess) {
                const pState = charState.parts[partId];
                if (!pState || !pState.effectiveDefinition || !pState.currentDimensions ||
                    !pState.effectiveDefinition.pivot || !pState.poseTransform) {
                    if(pState) pState.charRelativeWorldMatrix = UTILS.matrixIdentity(); 
                    processedInThisIteration++; 
                    continue;
                }
                const effDef = pState.effectiveDefinition;
                const pDim = pState.currentDimensions;
                let parentMatrix;

                if (!effDef.parentId) { 
                    parentMatrix = charInternalRootMatrix;
                } else if (processedParents.has(effDef.parentId)) { 
                    parentMatrix = charState.parts[effDef.parentId].charRelativeWorldMatrix;
                } else { 
                    remainingParts.push(partId); 
                    continue; 
                }
                
                let localMatrix = UTILS.matrixIdentity();

                // 1. Start from parent's origin (which is already transformed).
                //    Translate to anchor point on parent (relative to parent's 0,0).
                if (effDef.parentId) {
                    const parentState = charState.parts[effDef.parentId];
                    const parentDim = parentState.currentDimensions;
                    localMatrix = UTILS.matrixTranslate(localMatrix,
                        effDef.anchorToParent.x * parentDim.w,
                        effDef.anchorToParent.y * parentDim.h);
                }
                
                // 2. Translate by negative of child's pivot (relative to child's 0,0).
                //    This aligns child's pivot with the current point (anchor on parent).
                localMatrix = UTILS.matrixTranslate(localMatrix,
                    -effDef.pivot.x * pDim.w,
                    -effDef.pivot.y * pDim.h);
                
                // 3. Apply child's pose translations (offsets from its pivot)
                //    Also add computed Y offset for eyebrows/etc.
                const poseX = pState.poseTransform.x || 0;
                const poseY = (pState.poseTransform.y || 0) + (pState.computedParams.yOffset || 0);
                localMatrix = UTILS.matrixTranslate(localMatrix, poseX, poseY);
                
                // 4. Rotate child around its pivot
                //    Base rotation from pose, add expression rotation (e.g. eyebrows), add procedural physics rotation
                const totalLocalRotDeg = (pState.poseTransform.rotation || 0) + (pState.computedParams.rotation || 0) + (pState.proceduralRotation || 0);
                localMatrix = UTILS.matrixRotate(localMatrix, UTILS.degToRad(totalLocalRotDeg));
                
                pState.charRelativeWorldMatrix = UTILS.matrixMultiply(parentMatrix, localMatrix);
                processedParents.add(partId);
                processedInThisIteration++;
            }
            partsToProcess = remainingParts;
            iteration++;
            if(processedInThisIteration === 0 && partsToProcess.length > 0) {
                console.warn(`[MatrixCalc] Stall detected for ${charState.id}. Remaining: ${partsToProcess.join(', ')}. Forcing identity for remaining.`);
                partsToProcess.forEach(pid => { if(charState.parts[pid]) charState.parts[pid].charRelativeWorldMatrix = UTILS.matrixIdentity();}); 
                break; 
            }
        }
    },

    _updateAttachedObjectPosition: function(charState, objectsState, UTILS, charTemplate) { 
        if (charState.attachedObject && objectsState[charState.attachedObject.objectId]) {
            const objState = objectsState[charState.attachedObject.objectId];
            const handType = charState.attachedObject.hand; 
            let handPartIdKey = `hand${handType}`; 
            let handPartState = charState.parts[handPartIdKey];

            // Resolve hand part ID considering facing mode aliases
            const facingKey = `${charState.facingMode}_${charState.facingDirection}`;
            const modeKey = charState.facingMode;
            const overrides = charTemplate.facingOverrides?.[facingKey] || charTemplate.facingOverrides?.[modeKey] || {};
            const handOverride = overrides[handPartIdKey];
            if (handOverride?.idAlias) {
                 handPartState = Object.values(charState.parts).find(p => p.definition.id === handOverride.idAlias || p.effectiveDefinition.idAlias === handOverride.idAlias) || handPartState;
            } else if (charState.facingMode === 'profile' && charState.parts['hand_profile']) { // Fallback for simpler profile logic
                 handPartState = charState.parts['hand_profile'];
            }


            if (handPartState && handPartState.charRelativeWorldMatrix) {
                let charGlobalTransformMatrix = UTILS.matrixIdentity();
                charGlobalTransformMatrix = UTILS.matrixTranslate(charGlobalTransformMatrix, charState.x, charState.y);
                charGlobalTransformMatrix = UTILS.matrixScale(charGlobalTransformMatrix, charState.size, charState.size);
                charGlobalTransformMatrix = UTILS.matrixRotate(charGlobalTransformMatrix, UTILS.degToRad(charState.rotation));
                
                let finalObjectMatrix = UTILS.matrixMultiply(charGlobalTransformMatrix, handPartState.charRelativeWorldMatrix);
                
                // Apply local offset from attachment point on hand to object's pivot
                if (charState.attachedObject.localOffset) {
                    const offset = charState.attachedObject.localOffset;
                    let offsetMatrix = UTILS.matrixIdentity();
                    offsetMatrix = UTILS.matrixTranslate(offsetMatrix, offset.x || 0, offset.y || 0); // These are world units from hand's pivot
                    if (offset.rotation) { offsetMatrix = UTILS.matrixRotate(offsetMatrix, UTILS.degToRad(offset.rotation)); } // Relative rotation
                     // This scales the offset if defined, useful for character size changes
                    if (offset.scale) { offsetMatrix = UTILS.matrixScale(offsetMatrix, offset.scale, offset.scale); }
                    finalObjectMatrix = UTILS.matrixMultiply(finalObjectMatrix, offsetMatrix);
                }

                objState.worldMatrix = finalObjectMatrix;
                const trans = UTILS.getTranslationFromMatrix(objState.worldMatrix);
                objState.x = trans.x; objState.y = trans.y;
                objState.rotation = UTILS.radToDeg(UTILS.getRotationFromMatrix(objState.worldMatrix));
                const scale = UTILS.getScaleFromMatrix(objState.worldMatrix); // World scale, incorporates char size
                objState.currentDimensions.w = (objState.definition.dimensions?.w || 10) * scale.sx; // Update current dim based on world scale
                objState.currentDimensions.h = (objState.definition.dimensions?.h || 10) * scale.sy;
                objState.isAttachedTo = { characterId: charState.id, hand: handType };
            }
        }
    }
};
// B"H

window.AnimatorData = {
    SCENE_DATA: { // New top-level for scene-specific, non-character/object data
        paths: {
            "patrol_A": { 
                type: "linear", // Could be "bezier" in future
                points: [{x:100,y:100},{x:300,y:100},{x:300,y:250},{x:100,y:250}], 
                closed: true 
            },
            "entrance_to_stage_R": {
                type: "linear",
                points: [{x: 900, y: 400}, {x: 600, y: 400}]
            }
        },
        globalVariables: {
            "isNightTime": false,
            "leverPulled": false
        },
        sfxLibrary: {
            "footstep_grass": "sfx/footstep_grass.wav", // Paths are placeholders
            "door_creak": "sfx/door_creak.mp3",
            "item_pickup": "sfx/item_pickup.ogg"
        },
        zones: [
            { 
                id: "dark_cave_entrance", 
                shape: { type: 'rect', x: 50, y: 200, w: 100, h: 150 }, // World coords
                onEnterEvents: [ // Event group triggered when a character enters
                    { type: "screenEffect", effectType: "vignette", intensity: 0.7, duration: 1.0 },
                    { type: "dialogue", characterId: "{{triggeringCharId}}", text: "It's dark in here...", duration: 2 }
                ],
                onExitEvents: [
                    { type: "screenEffect", effectType: "vignette", intensity: 0.0, duration: 1.0 }
                ]
            }
        ]
    },
    CHARACTER_TEMPLATES: {
        'human_default': {
            baseHeight: 160,
            palette: {
                skinColor: '#FCD9B6', skinDarkerColor: '#E0AF8C',
                hairColor: '#4A3B31', hairDarkerColor: '#3A2F29',
                pupilColor: '#333333', eyeWhiteColor: '#FFFFFF',
                mouthColor: '#C23A4B', mouthFillColor: '#E67E8C',
                shirtColor: '#5DADE2', sleeveColor: '@shirtColor', pantsColor: '#34495E',
                shoeColor: '#4A3B31', tzitzitColor: '#F5F5F5', outlineColor: '#2C3E50',
                yarmulkeColor: '@hairDarkerColor', eyebrowColor: '@hairDarkerColor'
            },
            moodToExpressionMap: { // NEW
                "happy": "happy", "sad": "sad_expr", "angry": "angry_expr", "neutral": "neutral"
            },
            appearanceSets: { // NEW
                "formal_wear": {
                    "torso": { "shape": { "fill": "#333333" } }, // Tuxedo jacket
                    "legUpperL": { "shape": { "fill": "#444444" } },
                    "legUpperR": { "shape": { "fill": "#444444" } },
                },
                "beach_wear": {
                    "torso": { "shape": { "fill": "yellow" }, "dimensions": { "hFactor": 0.35 } }, // Shorter shirt
                    "legUpperL": { "shape": { "fill": "lightblue" }, "dimensions": { "hFactor": 0.15 } }, // Shorts
                    "legUpperR": { "shape": { "fill": "lightblue" }, "dimensions": { "hFactor": 0.15 } },
                    "footL": { "visible": false }, "footR": { "visible": false } // Barefoot
                }
            },
            parts: [
                { id: 'torso', parentId: null, anchorToParent: { x: 0.5, y: 0.5 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.3, hFactor: 0.4 }, shape: { type: 'rect', fill: 'shirtColor' }, zIndex: 0 },
                { id: 'head', parentId: 'torso', anchorToParent: { x: 0.5, y: 0.05 }, pivot: { x: 0.5, y: 0.8 }, dimensions: { wFactor: 0.28, hFactor: 0.33 }, shape: { type: 'ellipse', fill: 'skinColor' }, zIndex: 5 },
                { id: 'yarmulke', parentId: 'head', anchorToParent: { x: 0.5, y: 0.08 }, pivot: { x: 0.5, y: 0.9 }, dimensions: { wFactor: 0.15, hFactor: 0.06 }, shape: { type: 'ellipse', fill: 'yarmulkeColor' }, zIndex: 5.1, genderConditional: 'male' },
                { id: 'eyeL', parentId: 'head', anchorToParent: { x: 0.3, y: 0.4 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.07, hFactor: 0.045 }, shape: { type: 'eye', fill: 'eyeWhiteColor', pupilFill: 'pupilColor', pupilSizeFactor: 0.025 }, zIndex: 6 },
                { id: 'eyeR', parentId: 'head', anchorToParent: { x: 0.7, y: 0.4 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.07, hFactor: 0.045 }, shape: { type: 'eye', fill: 'eyeWhiteColor', pupilFill: 'pupilColor', pupilSizeFactor: 0.025 }, zIndex: 6 },
                { id: 'eyebrowL', parentId: 'head', anchorToParent: { x: 0.3, y: 0.28 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.08, hFactor: 0.025 }, shape: { type: 'eyebrow', color: 'eyebrowColor', initialShape: 'neutral' }, zIndex: 6.1 }, // NEW
                { id: 'eyebrowR', parentId: 'head', anchorToParent: { x: 0.7, y: 0.28 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.08, hFactor: 0.025 }, shape: { type: 'eyebrow', color: 'eyebrowColor', initialShape: 'neutral' }, zIndex: 6.1 }, // NEW
                { id: 'mouth', parentId: 'head', anchorToParent: { x: 0.5, y: 0.75 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.14, hFactor: 0.06 }, shape: { type: 'mouth', color: 'mouthColor', initialShape: 'neutral' }, zIndex: 6 },
                { id: 'armUpperL', parentId: 'torso', anchorToParent: { x: 0.1, y: 0.15 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.07, hFactor: 0.25 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: -1, ikChain: ['armUpperL', 'armLowerL', 'handL'] },
                { id: 'armLowerL', parentId: 'armUpperL', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.22 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: -1.1 },
                { id: 'handL', parentId: 'armLowerL', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.06 }, shape: { type: 'ellipse', fill: 'skinColor' }, zIndex: -1.2 },
                { id: 'armUpperR', parentId: 'torso', anchorToParent: { x: 0.9, y: 0.15 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.07, hFactor: 0.25 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: 1, ikChain: ['armUpperR', 'armLowerR', 'handR'] },
                { id: 'armLowerR', parentId: 'armUpperR', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.22 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: 1.1 },
                { id: 'handR', parentId: 'armLowerR', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.06 }, shape: { type: 'ellipse', fill: 'skinColor' }, zIndex: 1.2 },
                { id: 'legUpperL', parentId: 'torso', anchorToParent: { x: 0.3, y: 0.98 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.09, hFactor: 0.28 }, shape: { type: 'rect', fill: 'pantsColor' }, zIndex: -2 },
                { id: 'legLowerL', parentId: 'legUpperL', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.08, hFactor: 0.26 }, shape: { type: 'rect', fill: 'pantsColor' }, zIndex: -2.1 },
                { id: 'footL', parentId: 'legLowerL', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.25, y: 0.5 }, dimensions: { wFactor: 0.11, hFactor: 0.05 }, shape: { type: 'ellipse', fill: 'shoeColor' }, zIndex: -2.2 },
                { id: 'legUpperR', parentId: 'torso', anchorToParent: { x: 0.7, y: 0.98 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.09, hFactor: 0.28 }, shape: { type: 'rect', fill: 'pantsColor' }, zIndex: -0.5 },
                { id: 'legLowerR', parentId: 'legUpperR', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.08, hFactor: 0.26 }, shape: { type: 'rect', fill: 'pantsColor' }, zIndex: -0.4 },
                { id: 'footR', parentId: 'legLowerR', anchorToParent: { x: 0.5, y: 0.95 }, pivot: { x: 0.25, y: 0.5 }, dimensions: { wFactor: 0.11, hFactor: 0.05 }, shape: { type: 'ellipse', fill: 'shoeColor' }, zIndex: -0.3 },
                { id: 'tzitzit_FL', parentId: 'torso', anchorToParent: { x: 0.25, y: 0.9 }, pivot: { x: 0.5, y: 0 }, dimensions: { wFactor: 0.02, hFactor: 0.2 }, shape: { type: 'tzitzit_strand', numStrings: 2, color: 'tzitzitColor' }, zIndex: 2, genderConditional: 'male', attachedBehaviors: [{ type: 'simpleSpringPhysics', stiffness: 0.2, damping: 0.85, gravityFactor: 1.5, angleLimit: 40 }] },
                { id: 'tzitzit_FR', parentId: 'torso', anchorToParent: { x: 0.75, y: 0.9 }, pivot: { x: 0.5, y: 0 }, dimensions: { wFactor: 0.02, hFactor: 0.2 }, shape: { type: 'tzitzit_strand', numStrings: 2, color: 'tzitzitColor' }, zIndex: 2, genderConditional: 'male', attachedBehaviors: [{ type: 'simpleSpringPhysics', stiffness: 0.2, damping: 0.85, gravityFactor: 1.5, angleLimit: 40 }] },
            ],
            facingOverrides: { /* As before, but ensure eyebrow anchors also shift if needed */
                 "profile_left": {
                    head: { anchorToParent: { x: 0.45 } }, eyeL: { visible: false }, eyeR: { anchorToParent: { x: 0.35 } },
                    eyebrowL: { visible: false }, eyebrowR: { anchorToParent: { x: 0.35 } }, // Shift visible eyebrow
                    mouth: { anchorToParent: { x: 0.3 } },
                    armUpperL: { visible: false, idAlias:null }, armLowerL: { visible: false, idAlias:null }, handL: { visible: false, idAlias:null },
                    legUpperL: { visible: false, idAlias:null }, legLowerL: { visible: false, idAlias:null }, footL: { visible: false, idAlias:null },
                    tzitzit_FL: { visible: false, idAlias:null },
                    armUpperR: { idAlias: 'armUpper_profile', zIndex: 1 }, armLowerR: { idAlias: 'armLower_profile', zIndex: 1.1 }, handR: { idAlias: 'hand_profile', zIndex: 1.2 },
                    legUpperR: { idAlias: 'legUpper_profile', zIndex: -0.5 }, legLowerR: { idAlias: 'legLower_profile', zIndex: -0.4 }, footR: { idAlias: 'foot_profile', zIndex: -0.3 },
                    tzitzit_FR: { anchorToParent: { x: 0.5 }, idAlias: 'tzitzit_profile', zIndex: 2 },
                },
                "profile_right": {
                    head: { anchorToParent: { x: 0.55 } }, eyeR: { visible: false }, eyeL: { anchorToParent: { x: 0.65 } },
                    eyebrowR: { visible: false }, eyebrowL: { anchorToParent: { x: 0.65 } },
                    mouth: { anchorToParent: { x: 0.7 } },
                    armUpperR: { visible: false, idAlias:null }, armLowerR: { visible: false, idAlias:null }, handR: { visible: false, idAlias:null },
                    legUpperR: { visible: false, idAlias:null }, legLowerR: { visible: false, idAlias:null }, footR: { visible: false, idAlias:null },
                    tzitzit_FR: { visible: false, idAlias:null },
                    armUpperL: { idAlias: 'armUpper_profile', zIndex: 1 }, armLowerL: { idAlias: 'armLower_profile', zIndex: 1.1 }, handL: { idAlias: 'hand_profile', zIndex: 1.2 },
                    legUpperL: { idAlias: 'legUpper_profile', zIndex: -0.5 }, legLowerL: { idAlias: 'legLower_profile', zIndex: -0.4 }, footL: { idAlias: 'foot_profile', zIndex: -0.3 },
                    tzitzit_FL: { anchorToParent: { x: 0.5 }, idAlias: 'tzitzit_profile', zIndex: 2 },
                },
                "front": { // Reset all aliases and visibilities
                    head: { anchorToParent: {x:0.5} }, eyeL: { anchorToParent:{x:0.3}, visible:true}, eyeR: { anchorToParent:{x:0.7}, visible:true},
                    eyebrowL: { anchorToParent:{x:0.3}, visible:true}, eyebrowR: { anchorToParent:{x:0.7}, visible:true},
                    mouth: { anchorToParent:{x:0.5} },
                    armUpperL:{idAlias:null, visible:true}, armLowerL:{idAlias:null, visible:true}, handL:{idAlias:null, visible:true},
                    armUpperR:{idAlias:null, visible:true}, armLowerR:{idAlias:null, visible:true}, handR:{idAlias:null, visible:true},
                    legUpperL:{idAlias:null, visible:true}, legLowerL:{idAlias:null, visible:true}, footL:{idAlias:null, visible:true},
                    legUpperR:{idAlias:null, visible:true}, legLowerR:{idAlias:null, visible:true}, footR:{idAlias:null, visible:true},
                    tzitzit_FL:{anchorToParent:{x:0.25}, idAlias:null, visible:true}, tzitzit_FR:{anchorToParent:{x:0.75}, idAlias:null, visible:true}
                }
            },
            defaultBehaviors: [ 
                { type: "blink", config: { intervalMin: 2200, intervalMax: 5500, duration: 0.16, targetPartIds: ['eyeL', 'eyeR'] } },
                { type: "eyeDart", config: { intervalMin: 2800, intervalMax: 6500, duration: 0.13, targetPartIds: ['eyeL', 'eyeR'], rangeFactor: 0.0025 } },
                { type: "lipSync", config: { minChangeInterval: 0.08, maxChangeInterval: 0.20, targetPartIds: ["mouth"], affectHeadMovement: true } }, // affectHeadMovement NEW
                { type: "eyebrowFidget", config: { targetPartIds: ['eyebrowL', 'eyebrowR'], intervalMin: 3000, intervalMax: 7000, duration: 0.25, yRangeFactor: 0.003, rotRangeDeg: 3 } } // NEW
            ]
        }
    },

    POSES: {
        'idle_default': { /* As before, with minor variations */
            torso: { rotation: (phase) => Math.sin(phase * 0.5) * 1, rootMotionYFactor: (phase) => Math.sin(phase * 0.6) * 0.006 },
            head: { rotation: (phase) => Math.sin(phase * 0.7) * 2 },
            armUpperL: { rotation: 10 }, armLowerL: { rotation: 10 }, armUpperR: { rotation: -10 }, armLowerR: { rotation: -10 },
            armUpper_profile: { rotation: 5 }, armLower_profile: { rotation: 5 },
            legUpperL: { rotation: 2 }, legLowerL: { rotation: -2 }, legUpperR: { rotation: -2 }, legLowerR: { rotation: 2 },
        },
        'walk': { /* As before */
            rootMotionYFactor: (phase) => Math.abs(Math.sin(phase * 0.5)) * -0.015, torso: { rotation: (phase) => Math.sin(phase) * 2 },
            head: { rotation: (phase) => Math.sin(phase) * -2.5 },
            armUpperL: { rotation: (phase) => 45 * Math.sin(phase) }, armLowerL: { rotation: (phase) => 30 * Math.sin(phase) + 15 },
            armUpperR: { rotation: (phase) => -45 * Math.sin(phase) }, armLowerR: { rotation: (phase) => -30 * Math.sin(phase) + 15 },
            armUpper_profile: { rotation: (phase) => 40 * Math.sin(phase) }, armLower_profile: { rotation: (phase) => 25 * Math.sin(phase) + 10 },
            legUpperL: { rotation: (phase) => -40 * Math.sin(phase) }, legLowerL: { rotation: (phase) => 30 * Math.max(0, Math.cos(phase)) + 10 },
            footL: { rotation: (phase) => 10 * Math.sin(phase) },
            legUpperR: { rotation: (phase) => 40 * Math.sin(phase) }, legLowerR: { rotation: (phase) => 30 * Math.max(0, Math.cos(phase + Math.PI)) + 10 },
            footR: { rotation: (phase) => -10 * Math.sin(phase) },
            legUpper_profile: { rotation: (phase) => -35 * Math.sin(phase) }, legLower_profile: { rotation: (phase) => 25 * Math.max(0, Math.cos(phase)) + 5 },
            speedFactor: 1.8
        },
        'walk_sad': { // NEW VARIATION
            rootMotionYFactor: (phase) => Math.sin(phase * 0.4) * 0.01, // Slower, less bounce
            torso: { rotation: (phase) => Math.sin(phase * 0.8) * 1.5 + 5 }, // Slumped forward
            head: { rotation: (phase) => Math.sin(phase * 0.8) * -1.5 - 8 }, // Looking down
            armUpperL: { rotation: (phase) => 15 * Math.sin(phase*0.8) + 20 }, armLowerL: { rotation: (phase) => 10 * Math.sin(phase*0.8) + 5 }, // Less swing, hang lower
            armUpperR: { rotation: (phase) => -15 * Math.sin(phase*0.8) - 20 }, armLowerR: { rotation: (phase) => -10 * Math.sin(phase*0.8) - 5 },
            // Legs similar to walk but slower cadence
            legUpperL: { rotation: (phase) => -25 * Math.sin(phase*0.8) }, legLowerL: { rotation: (phase) => 20 * Math.max(0, Math.cos(phase*0.8)) + 5 },
            legUpperR: { rotation: (phase) => 25 * Math.sin(phase*0.8) }, legLowerR: { rotation: (phase) => 20 * Math.max(0, Math.cos(phase*0.8 + Math.PI)) + 5 },
            speedFactor: 0.9
        },
        'sit_simple': { /* As before */
            torso: { rotation: -3, yFactor: -0.18 }, head: { rotation: 3 },
            armUpperL: { rotation: 30 }, armLowerL: { rotation: 40 }, armUpperR: { rotation: -30 }, armLowerR: { rotation: -40 },
            armUpper_profile: { rotation: 35 }, armLower_profile: { rotation: 35 },
            legUpperL: { rotation: -85 }, legLowerL: { rotation: 80 }, footL: { rotation: 5 },
            legUpperR: { rotation: -85 }, legLowerR: { rotation: 80 }, footR: { rotation: 5 },
            legUpper_profile: {rotation: -85}, legLower_profile: {rotation:80},
            speedFactor: 0.3
        },
        'sit_on_object': { // NEW - For specific sit interaction
            torso: { rotation: 0, yFactor: -0.15 }, // Adjust yFactor based on typical seat height
            head: { rotation: 0 },
            armUpperL: { rotation: 45, ikTarget: { partId: 'legUpperL', anchorFactor: {x:0.5, y:0.2} }, preferBendClockwise: true, ikChain: ['armUpperL', 'armLowerL', 'handL'] }, // Resting on lap
            armUpperR: { rotation: -45, ikTarget: { partId: 'legUpperR', anchorFactor: {x:0.5, y:0.2} }, preferBendClockwise: true, ikChain: ['armUpperR', 'armLowerR', 'handR'] },
            legUpperL: { rotation: -90 }, legLowerL: { rotation: 90 }, footL: { rotation: 0 }, // Standard sitting leg pose
            legUpperR: { rotation: -90 }, legLowerR: { rotation: 90 }, footR: { rotation: 0 },
            // Profile versions would be similar or simpler
            armUpper_profile: { rotation: 45, ikTarget: {partId: 'legUpper_profile', anchorFactor: {x:0.5,y:0.2}}, preferBendClockwise:true, ikChain:['armUpper_profile','armLower_profile','hand_profile']},
            legUpper_profile: {rotation: -90}, legLower_profile: {rotation:90},
            speedFactor: 0.1
        },
        'thinking_chin_touch': { /* As before, potentially update target based on facing more robustly */
            head: { rotation: -10 },
            handR: { ikTarget: { partId: 'head', anchorFactor: { x: 0.7, y: 0.85 } }, preferBendClockwise: false },
            hand_profile: { ikTarget: { partId: 'head', anchorFactor: { x: (cs) => cs.facingDirection === 'left' ? 0.3 : 0.7, y: 0.85 } }, preferBendClockwise: false },
            armUpperL: { rotation: 15 }, armLowerL: { rotation: 10 },
            speedFactor: 0.5
        },
        'wave_R': { // NEW Gesture
            head: { rotation: (phase) => Math.sin(phase*2) * 5 },
            armUpperR: { rotation: -120 },
            armLowerR: { rotation: (phase) => Math.sin(phase*8) * 25 - 10 }, // Waving motion
            handR: { rotation: (phase) => Math.sin(phase*8 + 0.5) * 15 },
            // Other arm relaxed
            armUpperL: { rotation: 10 }, armLowerL: { rotation: 5 },
            speedFactor: 2.0
        }
    },

    EXPRESSIONS: {
        'neutral': {
            eyeL: { openFactor: 1.0, pupilShiftXFactor: 0, pupilShiftYFactor: 0 }, eyeR: { openFactor: 1.0, pupilShiftXFactor: 0, pupilShiftYFactor: 0 },
            eyebrowL: { yOffsetFactor: 0, rotation: 0, shapeKey: 'neutral' }, eyebrowR: { yOffsetFactor: 0, rotation: 0, shapeKey: 'neutral' },
            mouth: { shapeKey: 'neutral', fillColor: null }
        },
        'happy': {
            eyeL: { openFactor: 0.85, pupilShiftYFactor: -0.1 }, eyeR: { openFactor: 0.85, pupilShiftYFactor: -0.1 },
            eyebrowL: { yOffsetFactor: -0.008, rotation: -8, shapeKey: 'raised' }, eyebrowR: { yOffsetFactor: -0.008, rotation: 8, shapeKey: 'raised' },
            mouth: { shapeKey: 'smile', fillColor: '@mouthFillColor' }
        },
        'sad_expr': { // NEW
            eyeL: { openFactor: 0.7, pupilShiftYFactor: 0.15 }, eyeR: { openFactor: 0.7, pupilShiftYFactor: 0.15 },
            eyebrowL: { yOffsetFactor: 0.005, rotation: 15, shapeKey: 'furrowed' }, eyebrowR: { yOffsetFactor: 0.005, rotation: -15, shapeKey: 'furrowed' },
            mouth: { shapeKey: 'frown', fillColor: null }
        },
        'angry_expr': { // NEW
            eyeL: { openFactor: 0.9, pupilShiftXFactor: 0.05 }, eyeR: { openFactor: 0.9, pupilShiftXFactor: -0.05 }, // Slight squint
            eyebrowL: { yOffsetFactor: 0.01, rotation: -20, shapeKey: 'furrowed' }, eyebrowR: { yOffsetFactor: 0.01, rotation: 20, shapeKey: 'furrowed' }, // Sharply angled down
            mouth: { shapeKey: 'snarl', fillColor: null }
        },
        'surprised': {
            eyeL: { openFactor: 1.15 }, eyeR: { openFactor: 1.15 },
            eyebrowL: { yOffsetFactor: -0.015, rotation: -5, shapeKey: 'raised' }, eyebrowR: { yOffsetFactor: -0.015, rotation: 5, shapeKey: 'raised' },
            mouth: { shapeKey: 'o_large' }
        },
        'blink_half': { eyeL: { openFactor: 0.5 }, eyeR: { openFactor: 0.5 } },
        'blink_closed': { eyeL: { openFactor: 0.05 }, eyeR: { openFactor: 0.05 } }
    },
    EYEBROW_SHAPES: { // NEW
        'neutral': { path: [{cmd:'M',x:-0.5,y:0},{cmd:'L',x:0.5,y:0}], thicknessFactor: 0.2 },
        'raised': { path: [{cmd:'M',x:-0.5,y:-0.1},{cmd:'Q',x1:0,y1:-0.4,x:0.5,y:-0.1}], thicknessFactor: 0.2 },
        'furrowed': { path: [{cmd:'M',x:-0.5,y:0.15},{cmd:'L',x:0,y:-0.05},{cmd:'L',x:0.5,y:0.15}], thicknessFactor: 0.22 },
        'sad_inner_up': { path: [{cmd:'M',x:-0.5,y:-0.1},{cmd:'Q',x1:0,y1:0.3,x:0.5,y:-0.1}], thicknessFactor: 0.2} // Inner parts up
    },
    MOUTH_SHAPES: { 
        'neutral': { path: [{ cmd: 'M', x: -0.5, y: 0 }, { cmd: 'L', x: 0.5, y: 0 }], openFactor: 0 },
        'smile': { path: [{ cmd: 'M', x: -0.5, y: -0.05 }, { cmd: 'Q', x1: 0, y1: 0.3, x: 0.5, y: -0.05 }], openFactor: 0.1 },
        'frown': { path: [{ cmd: 'M', x: -0.5, y: 0.15 }, { cmd: 'Q', x1: 0, y1: -0.1, x: 0.5, y: 0.15 }], openFactor: 0.05 }, // NEW
        'snarl': { path: [{ cmd: 'M', x: -0.5, y: 0.05 }, {cmd: 'L', x:-0.2, y:-0.1}, {cmd:'L', x:0.2, y:-0.1}, { cmd: 'L', x: 0.5, y: 0.05 }], openFactor: 0.08 }, // NEW
        'o_small': { type: 'ellipse', widthFactor: 0.5, heightFactor: 0.4, openFactor: 0.3 },
        'o_large': { type: 'ellipse', widthFactor: 0.7, heightFactor: 0.75, openFactor: 0.8 },
        'm_consonant': { path: [{ cmd: 'M', x: -0.4, y: 0 }, { cmd: 'L', x: 0.4, y: 0 }], openFactor: 0.02 },
        'ee_ih': { path: [{ cmd: 'M', x: -0.45, y: -0.02 }, { cmd: 'L', x: 0.45, y: -0.02 }], openFactor: 0.05 },
        'ah_small': { type: 'ellipse', widthFactor: 0.6, heightFactor: 0.5, openFactor: 0.4 },
        'th_l': { path: [{cmd:'M', x:-0.3, y:-0.05}, {cmd:'L', x:0.3, y:-0.05}, {cmd:'M', x:-0.2, y:0.05}, {cmd:'L', x:0.2, y:0.05}], openFactor:0.1} // Tongue visible
    },

    OBJECT_TEMPLATES: {
        'generic_box': {
            dimensions: { w: 50, h: 50 }, shape: { type: 'rect', fill: '#A0A0A0', stroke: '#333333' },
            pivot: { x: 0.5, y: 0.5 }, grabbablePoints: [{ id: 'center', x: 0.5, y: 0.5 }]
        },
        'generic_ball': {
            dimensions: { w: 40, h: 40 }, shape: { type: 'ellipse', fill: '#D0A0A0', stroke: '#333333' },
            pivot: { x: 0.5, y: 0.5 }, grabbablePoints: [{ id: 'center', x: 0.5, y: 0.5 }]
        },
        'wooden_chair': { // NEW COMPOUND OBJECT
            id: 'chair_main',
            dimensions: { w: 60, h: 80 }, // Overall bounding box (approx)
            shape: { type: 'rect', fill: 'rgba(0,0,0,0)' }, // Invisible main container, children do drawing
            pivot: { x: 0.5, y: 0.9 }, // Pivot at bottom center of chair overall
            interactionPoints: { // NEW
                "sit_spot": { x: 0.5, y: 0.45, requiredPose:"sit_on_object", facing: "any" } // Relative to chair's overall dimensions
            },
            children: [
                {
                    id: 'seat', parentId: null, // Relative to chair_main's origin
                    anchorToParent: { x: 0.5, y: 0.5 }, pivot: { x: 0.5, y: 0.5 }, // Center seat
                    dimensions: { wFactor: 0.9, hFactor: 0.15, relativeTo: "parentDimensions" }, // Factors of parent's w/h
                    shape: { type: 'rect', fill: '#A0522D' } // Brown seat
                },
                {
                    id: 'backrest', parentId: 'seat', // Attach to seat
                    anchorToParent: { x: 0.5, y: 0.0 }, pivot: { x: 0.5, y: 1.0 }, // Top-center of seat, pivot at bottom of backrest
                    dimensions: { wFactor: 0.9, hFactor: 0.6, relativeTo: "grandparentDimensions"}, // Relative to chair_main
                    shape: { type: 'rect', fill: '#8B4513' } 
                },
                // Legs (example for one leg)
                {
                    id: 'leg_FL', parentId: 'seat',
                    anchorToParent: { x: 0.1, y: 1.0 }, pivot: { x: 0.5, y: 0.0 },
                    dimensions: { wFactor: 0.08, hFactor: 0.45, relativeTo: "grandparentDimensions"},
                    shape: { type: 'rect', fill: '#654321' }
                } // ... more legs: FR, BL, BR
            ]
        },
        'jiggly_cube': { // NEW Physics Prop
            dimensions: {w: 30, h: 30}, shape: {type: 'rect', fill: '#FF69B4'},
            pivot: {x:0.5, y:0.5},
            physics: { type: 'jiggle', mass:1, stiffness: 0.2, damping:0.8, gravityFactor:0.5, angleLimit:15 }
        }
    },

    BEHAVIOR_HANDLERS: {}, // Will be populated by AnimatorUtils._defaultBehaviorHandlers
    SHAPE_RENDERERS: {}    // Will be populated by AnimatorUtils._defaultShapeRenderers
};