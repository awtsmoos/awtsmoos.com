//B"H
//B"H
// Animator.CharacterPipeline.js (v1.6 - Revised Local Matrix Assembly)
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

        this._updateCharacterMovementAndTransitions(charState, deltaTime, currentTime, template, animatorInstance.UTILS, animatorInstance.DATA);
        this._resolveEffectivePartDefinitions(charState, template); 
        this._calculatePartDimensions(charState, template); 
        this._evaluatePoseAndExpression(charState, template, animatorInstance.UTILS, animatorInstance.DATA); 
        this._applyCharacterBehaviors(charState, deltaTime, currentTime, template, animatorInstance.DATA, animatorInstance.UTILS); 
        this._calculateAllPartMatrices(charState, template, animatorInstance.UTILS); // First pass
        this._solveIKForCharacter(charState, template, animatorInstance.UTILS, animatorInstance.DATA);
        this._calculateAllPartMatrices(charState, template, animatorInstance.UTILS); // Second pass (Final)
        this._updateAttachedObjectPosition(charState, animatorInstance.objectsState, animatorInstance.UTILS, template);
    },

    _updateCharacterMovementAndTransitions: function(charState, deltaTime, currentTime, template, UTILS, DATA) {
        if (typeof charState.x !== 'number' || isNaN(charState.x)) {
            charState.x = (typeof charState.targetX === 'number' && !isNaN(charState.targetX)) ? charState.targetX : 0;
        }
        if (typeof charState.y !== 'number' || isNaN(charState.y)) {
            charState.y = (typeof charState.targetY === 'number' && !isNaN(charState.targetY)) ? charState.targetY : 0;
        }
        if (charState.poseTransitionProgress < 1) {
            charState.poseTransitionProgress = Math.min(1, charState.poseTransitionProgress + deltaTime / (charState.poseTransitionDuration || 0.001));
        }
        if (charState.expressionTransitionProgress < 1) {
            charState.expressionTransitionProgress = Math.min(1, charState.expressionTransitionProgress + deltaTime / (charState.expressionTransitionDuration || 0.001));
        }
        if (typeof charState.walkStartX !== 'number' || isNaN(charState.walkStartX)) charState.walkStartX = charState.x;
        if (typeof charState.walkStartY !== 'number' || isNaN(charState.walkStartY)) charState.walkStartY = charState.y;
        if (typeof charState.targetX !== 'number' || isNaN(charState.targetX)) charState.targetX = charState.x;
        if (typeof charState.targetY !== 'number' || isNaN(charState.targetY)) charState.targetY = charState.y;

        if (charState.walkDuration > 0 && charState.walkStartTime >= 0) { 
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
                charState.x = (typeof charState.targetX === 'number' && !isNaN(charState.targetX)) ? charState.targetX : charState.x;
                charState.y = (typeof charState.targetY === 'number' && !isNaN(charState.targetY)) ? charState.targetY : charState.y;
            }
        }
        let currentPoseData = DATA.POSES[charState.activePoseName] || {};
        let poseSpeedFactor = currentPoseData.speedFactor || 1.0;
        if (charState.walkDuration > 0 && charState.activePoseName === 'walk') {
            let walkPoseData = DATA.POSES['walk'] || {};
            poseSpeedFactor = (walkPoseData.speedFactor || 1.8); 
        }
        charState.posePhase = (charState.posePhase + deltaTime * poseSpeedFactor * 2.5) % (Math.PI * 2);
    },

    _resolveEffectivePartDefinitions: function(charState, template) {
        const facingKey = `${charState.facingMode}_${charState.facingDirection}`;
        const modeKey = charState.facingMode; 
        const templateOverrides = template.facingOverrides || {};
        const overrides = templateOverrides[facingKey] || templateOverrides[modeKey] || templateOverrides["front"] || {}; 
        for (const partId in charState.parts) {
            const pState = charState.parts[partId];
            pState.effectiveDefinition = JSON.parse(JSON.stringify(pState.definition)); 
            const effDef = pState.effectiveDefinition;
            const partOvr = overrides[partId];
            if (partOvr) {
                Object.keys(partOvr).forEach(key => {
                    if (typeof partOvr[key] === 'object' && partOvr[key] !== null && !Array.isArray(partOvr[key]) &&
                        effDef[key] && typeof effDef[key] === 'object' && !Array.isArray(effDef[key])) {
                        effDef[key] = { ...effDef[key], ...partOvr[key] }; 
                    } else { effDef[key] = partOvr[key]; }
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
                if (isNaN(pState.currentDimensions.w)) { pState.currentDimensions.w = 1;}
                if (isNaN(pState.currentDimensions.h)) { pState.currentDimensions.h = 1;}
            } else { pState.currentDimensions.w = 1; pState.currentDimensions.h = 1; }
        }
    },

    _evaluatePoseAndExpression: function(charState, template, UTILS, DATA) {
        const curPoseN = charState.activePoseName; const prevPoseN = charState.previousPoseName; const tP = UTILS.smoothStep(charState.poseTransitionProgress);
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
            }
        }
    },

    _applyCharacterBehaviors: function(charState, deltaTime, currentTime, template, DATA, UTILS) {
        const baseScaleForBehaviors = template.baseHeight; 
        (charState.activeBehaviors || []).forEach(behDef => {
            const handler = DATA.BEHAVIOR_HANDLERS[behDef.type];
            if (handler) handler(charState, behDef, deltaTime, currentTime, baseScaleForBehaviors);
        });
        for (const partId in charState.parts) {
            const pState = charState.parts[partId];
            if (pState.attachedBehaviors) {
                pState.attachedBehaviors.forEach(attBehDef => {
                    const handler = DATA.BEHAVIOR_HANDLERS[attBehDef.type];
                    if (handler) handler(charState, { partId, config: attBehDef.config || attBehDef }, deltaTime, currentTime, baseScaleForBehaviors);
                });
            }
        }
    },

    _solveIKForCharacter: function(charState, template, UTILS, DATA) {
        const currentPoseDef = DATA.POSES[charState.activePoseName] || {};
        Object.values(charState.parts).forEach(effectorPartState => { 
            const posePartKey = effectorPartState.effectiveDefinition.idAlias || effectorPartState.definition.id;
            const poseProps = currentPoseDef[posePartKey];
            if (!poseProps || !poseProps.ikTarget) return;
            if (!effectorPartState.effectiveDefinition?.ikChain || !Array.isArray(effectorPartState.effectiveDefinition.ikChain) || effectorPartState.effectiveDefinition.ikChain.length !== 3) return;
            const [ulIdAliased, llIdAliased, effIdAliased] = effectorPartState.effectiveDefinition.ikChain;
            const resolveAlias = (alias) => { for (const pid in charState.parts) if (charState.parts[pid].effectiveDefinition?.idAlias === alias || pid === alias) return pid; return alias; };
            const ulId = resolveAlias(ulIdAliased); const llId = resolveAlias(llIdAliased); const effId = resolveAlias(effIdAliased);
            const actualEffectorState = charState.parts[effId];
            if (!actualEffectorState) { return; }
            const ulState = charState.parts[ulId], llState = charState.parts[llId];
            if (!ulState?.currentDimensions?.h || !llState?.currentDimensions?.h || 
                !ulState?.effectiveDefinition?.parentId || !ulState?.effectiveDefinition?.anchorToParent || 
                !ulState?.effectiveDefinition?.pivot || !llState?.effectiveDefinition?.pivot ||
                !ulState?.charRelativeWorldMatrix || !llState?.charRelativeWorldMatrix) { return; }
            const len1 = ulState.currentDimensions.h; const len2 = llState.currentDimensions.h;
            const ulParentId = ulState.effectiveDefinition.parentId;
            const ulParentCharRelativeMatrix = ulParentId ? (charState.parts[ulParentId]?.charRelativeWorldMatrix || UTILS.matrixIdentity()) : UTILS.matrixIdentity();
            let tempUlMatrix = UTILS.matrixIdentity();
            if (ulParentId) {
                 const parentState = charState.parts[ulParentId];
                 if(parentState && parentState.currentDimensions && parentState.effectiveDefinition?.pivot && ulState.effectiveDefinition.anchorToParent) {
                    const parentDim = parentState.currentDimensions; const parentPivot = parentState.effectiveDefinition.pivot;
                    const anchorX = (ulState.effectiveDefinition.anchorToParent.x * parentDim.w) - (parentPivot.x * parentDim.w);
                    const anchorY = (ulState.effectiveDefinition.anchorToParent.y * parentDim.h) - (parentPivot.y * parentDim.h);
                    tempUlMatrix = UTILS.matrixTranslate(tempUlMatrix, anchorX, anchorY);
                 }
            }
            tempUlMatrix = UTILS.matrixMultiply(ulParentCharRelativeMatrix, tempUlMatrix); 
            tempUlMatrix = UTILS.matrixTranslate(tempUlMatrix, ulState.effectiveDefinition.pivot.x * ulState.currentDimensions.w, ulState.effectiveDefinition.pivot.y * ulState.currentDimensions.h); 
            tempUlMatrix = UTILS.matrixTranslate(tempUlMatrix, ulState.poseTransform.x || 0, ulState.poseTransform.y || 0); 
            const ikBase = UTILS.getTranslationFromMatrix(tempUlMatrix);
            const targetDef = poseProps.ikTarget; 
            let targetPartState = charState.parts[targetDef.partId]; 
            if (!targetPartState) { 
                for (const pppId in charState.parts) { if (charState.parts[pppId].effectiveDefinition.idAlias === targetDef.partId) { targetPartState = charState.parts[pppId]; break; }}
            }
            if (!targetPartState?.charRelativeWorldMatrix || !targetPartState?.currentDimensions || !targetPartState?.effectiveDefinition?.pivot) { return; }
            const tAnchorFactor = targetDef.anchorFactor || {x: 0.5, y: 0.5}; const tDimW = targetPartState.currentDimensions.w; const tDimH = targetPartState.currentDimensions.h; const tPivot = targetPartState.effectiveDefinition.pivot;
            const targetLocalPt = { x: (tAnchorFactor.x * tDimW) - (tPivot.x * tDimW), y: (tAnchorFactor.y * tDimH) - (tPivot.y * tDimH) };
            const ikTargetCharRelative = UTILS.transformPoint(targetLocalPt, targetPartState.charRelativeWorldMatrix);
            let preferBend = poseProps.preferBendClockwise;
            if (typeof preferBend === 'function') preferBend = preferBend(charState);
            const ikResult = UTILS.solve2LinkIK(ikBase.x, ikBase.y, ikTargetCharRelative.x, ikTargetCharRelative.y, len1, len2, preferBend);
            const ulParentActualRotationRad = UTILS.getRotationFromMatrix(ulParentCharRelativeMatrix);
            ulState.poseTransform.rotation = UTILS.radToDeg(ikResult.angles[0] - ulParentActualRotationRad); 
            llState.poseTransform.rotation = UTILS.radToDeg(ikResult.angles[1]); 
            ulState.proceduralRotation = 0; llState.proceduralRotation = 0;
            if (actualEffectorState.poseTransform && effId !== llId && effId !== ulId) { 
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
                const effDef = pState.effectiveDefinition; // Child part's definition
                const pDim = pState.currentDimensions;     // Child part's dimensions
                let parentMatrix;

                if (!effDef.parentId) { 
                    parentMatrix = charInternalRootMatrix; // This part is a root part (e.g., torso)
                } else if (processedParents.has(effDef.parentId)) { 
                    parentMatrix = charState.parts[effDef.parentId].charRelativeWorldMatrix; // Get parent's already calculated matrix
                } else { 
                    remainingParts.push(partId); // Parent not processed yet, defer this part
                    continue; 
                }
                
                let localMatrix = UTILS.matrixIdentity();

                if (effDef.parentId) {
                    const parentState = charState.parts[effDef.parentId];
                    const parentDim = parentState.currentDimensions; // Parent's dimensions
                    
                    // 1. Translate from parent's origin (0,0 of its bounding box) to the anchor point on parent
                    localMatrix = UTILS.matrixTranslate(localMatrix,
                        effDef.anchorToParent.x * parentDim.w,
                        effDef.anchorToParent.y * parentDim.h);
                    
                    // 2. From this anchor point, translate by the negative of the child's pivot.
                    //    This aligns the child's pivot point with the anchor point on the parent.
                    localMatrix = UTILS.matrixTranslate(localMatrix,
                        -effDef.pivot.x * pDim.w,
                        -effDef.pivot.y * pDim.h);
                }
                
                // 3. Apply child's pose translations (these are offsets from its pivot)
                localMatrix = UTILS.matrixTranslate(localMatrix, pState.poseTransform.x || 0, pState.poseTransform.y || 0);
                
                // 4. Rotate child around its pivot (which is now effectively at the origin of this localMatrix)
                const totalLocalRotDeg = (pState.poseTransform.rotation || 0) + (pState.proceduralRotation || 0);
                localMatrix = UTILS.matrixRotate(localMatrix, UTILS.degToRad(totalLocalRotDeg));
                
                // The part's geometry is drawn from its own (0,0) origin.
                // The localMatrix now correctly positions and orients the child part's (0,0) origin
                // relative to its parent's (0,0) origin.

                pState.charRelativeWorldMatrix = UTILS.matrixMultiply(parentMatrix, localMatrix);
                processedParents.add(partId);
                processedInThisIteration++;
            }
            partsToProcess = remainingParts;
            iteration++;
            if(processedInThisIteration === 0 && partsToProcess.length > 0) {
                console.warn(`[MatrixCalc] Stall detected for ${charState.id}. Remaining: ${partsToProcess.join(', ')}. Forcing identity.`);
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
            if (charState.facingMode === 'profile' && handPartState && handPartState.effectiveDefinition?.idAlias) {
                handPartIdKey = handPartState.effectiveDefinition.idAlias; 
                handPartState = charState.parts[handPartIdKey]; 
            } else if (charState.facingMode === 'profile') { 
                if(charState.parts['hand_profile']) { handPartState = charState.parts['hand_profile']; }
            }
            if (handPartState && handPartState.charRelativeWorldMatrix) {
                let charGlobalTransformMatrix = UTILS.matrixIdentity();
                charGlobalTransformMatrix = UTILS.matrixTranslate(charGlobalTransformMatrix, charState.x, charState.y);
                charGlobalTransformMatrix = UTILS.matrixScale(charGlobalTransformMatrix, charState.size, charState.size);
                charGlobalTransformMatrix = UTILS.matrixRotate(charGlobalTransformMatrix, UTILS.degToRad(charState.rotation));
                let finalObjectMatrix = UTILS.matrixMultiply(charGlobalTransformMatrix, handPartState.charRelativeWorldMatrix);
                if(charState.attachedObject.localOffset) {
                    const offset = charState.attachedObject.localOffset;
                    let offsetMatrix = UTILS.matrixIdentity();
                    offsetMatrix = UTILS.matrixTranslate(offsetMatrix, offset.x || 0, offset.y || 0);
                    if(offset.rotation) { offsetMatrix = UTILS.matrixRotate(offsetMatrix, UTILS.degToRad(offset.rotation)); }
                    finalObjectMatrix = UTILS.matrixMultiply(finalObjectMatrix, offsetMatrix);
                }
                objState.worldMatrix = finalObjectMatrix;
                const trans = UTILS.getTranslationFromMatrix(objState.worldMatrix);
                objState.x = trans.x; objState.y = trans.y;
                objState.rotation = UTILS.radToDeg(UTILS.getRotationFromMatrix(objState.worldMatrix));
                objState.isAttachedTo = { characterId: charState.id, hand: handType };
            }
        }
    }
};