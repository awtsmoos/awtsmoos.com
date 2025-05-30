//B"H
// Animator.EventProcessor.js

window.AnimatorCore_EventProcessor = {
    processNextEventGroup: function(animator) {
        if (animator.currentEventGroupIndex >= animator.eventTimeline.length - 1) {
            if (animator.animationData?.scene?.loop) {
                console.log("[ANIM_DEBUG_FLOW] processNextEventGroup: End of timeline, looping.");
                animator.DATA_HANDLER.restartAnimationPrerequisites(animator); // Use DATA_HANDLER
            } else {
                animator.ui.statusDiv.textContent = "Animation finished.";
                console.log("[ANIM_DEBUG_FLOW] processNextEventGroup: End of timeline, not looping. Stopping animation.");
                animator.stopAnimation();
                return;
            }
        }
        animator.currentEventGroupIndex++;
        animator.activeEventGroup = animator.eventTimeline[animator.currentEventGroupIndex];
        animator.activeEventGroupStatus = {};

        if (!animator.activeEventGroup?.length) {
            console.log(`[ANIM_DEBUG_FLOW] processNextEventGroup: Group ${animator.currentEventGroupIndex + 1} is empty. Skipping.`);
            if (animator.isPlaying) this.processNextEventGroup(animator);
            return;
        }
        // console.log(`[ANIM_DEBUG_FLOW] processNextEventGroup: Starting Group ${animator.currentEventGroupIndex + 1}/${animator.eventTimeline.length}`);
        animator.ui.statusDiv.textContent = `Group ${animator.currentEventGroupIndex + 1}/${animator.eventTimeline.length}`;
        animator.activeEventGroup.forEach(event => {
            animator.activeEventGroupStatus[event._instanceId] = { completed: false, startTime: animator.currentTime };
            this._initiateEvent(animator, event);
        });
        this._checkActiveEventGroupCompletion(animator);
    },

    _initiateEvent: function(animator, event) {
        const status = animator.activeEventGroupStatus[event._instanceId];
        status.type = (event.duration !== undefined && event.duration > 0) ? 'timed' : (event.type === 'dialogue' && event.speak ? 'tts' : 'instant');
        if (status.type === 'timed') status.duration = event.duration;

        const char = event.characterId ? animator.charactersState[event.characterId] : null;
        const obj = event.objectId ? animator.objectsState[event.objectId] : null;
        
        // console.log(`[ANIM_DEBUG_FLOW] _initiateEvent (${event._instanceId}): Type='${event.type}', Char='${event.characterId || 'N/A'}', Obj='${event.objectId || 'N/A'}', StatusType='${status.type}'`);

        switch (event.type) {
            case 'pose':
                if (char) {
                    char.previousPoseName = char.activePoseName;
                    char.activePoseName = event.poseName;
                    char.poseTransitionProgress = 0;
                    char.poseTransitionDuration = event.transitionDuration ?? char.poseTransitionDuration;
                    if (char.poseTransitionDuration <= 0.01) char.poseTransitionProgress = 1;
                    // console.log(`[ANIM_DEBUG_FLOW] Pose for ${char.id}: ${event.poseName}, transition ${char.poseTransitionDuration}s`);
                }
                if (status.type === 'instant' || (char && char.poseTransitionDuration <= 0.01)) status.completed = true;
                else if (!status.duration && char) status.duration = char.poseTransitionDuration;
                break;
            case 'expression':
                if (char) {
                    char.previousExpressionName = char.activeExpressionName;
                    char.activeExpressionName = event.expressionName;
                    char.expressionTransitionProgress = 0;
                    char.expressionTransitionDuration = event.transitionDuration ?? char.expressionTransitionDuration;
                    if (char.expressionTransitionDuration <= 0.01) char.expressionTransitionProgress = 1;
                }
                if (status.type === 'instant' || (char && char.expressionTransitionDuration <= 0.01)) status.completed = true;
                else if (!status.duration && char) status.duration = char.expressionTransitionDuration;
                break;
            case 'walk':
                if (char && event.targetPosition && typeof event.targetPosition.x === 'number' && typeof event.targetPosition.y === 'number') {
                    char.walkStartX = (typeof char.x === 'number' && !isNaN(char.x)) ? char.x : char.targetX;
                    char.walkStartY = (typeof char.y === 'number' && !isNaN(char.y)) ? char.y : char.targetY;
                    char.targetX = event.targetPosition.x;
                    char.targetY = event.targetPosition.y;
                    char.walkStartTime = animator.currentTime;

                    console.log(`[ANIM_DEBUG_TRANSFORM] Walk Event for ${char.id}: ` +
                        `startX=${char.walkStartX.toFixed(1)}, startY=${char.walkStartY.toFixed(1)}, ` +
                        `targetX=${char.targetX.toFixed(1)}, targetY=${char.targetY.toFixed(1)}, ` +
                        `event.duration=${event.duration}`);

                    if (event.duration && event.duration > 0) {
                        char.walkDuration = event.duration;
                        status.duration = event.duration;
                    } else {
                        console.warn(`[ANIM_DEBUG_TRANSFORM] Walk event for ${char.id} to (${char.targetX}, ${char.targetY}) has invalid/zero duration (${event.duration}). Snapping.`);
                        char.x = char.targetX; char.y = char.targetY; // Snap
                        char.walkDuration = 0; status.completed = true; status.type = 'instant';
                        console.log(`[ANIM_DEBUG_TRANSFORM]   Snapped ${char.id} to x=${char.x}, y=${char.y}`);
                    }
                    if (event.facing) { char.facingDirection = event.facing; if (event.facingMode) char.facingMode = event.facingMode; }
                    else { const dX = char.targetX - char.x; if (Math.abs(dX) > 1) char.facingDirection = dX > 0 ? 'right' : 'left'; }
                } else {
                    if (char && event.targetPosition) console.warn(`[ANIM_DEBUG_TRANSFORM] Walk event for ${char.id} has invalid targetPosition:`, event.targetPosition);
                    else if (!char) console.warn(`[ANIM_DEBUG_TRANSFORM] Walk event with no valid character:`, event);
                    status.completed = true;
                }
                break;
            case 'dialogue':
                if (char && event.text) {
                    char.dialogueText = event.text;
                    char.isSpeakingTTS = false;
                    status.duration = event.duration || (event.text.length * 0.075);

                    if (animator.SPEECH.isSupported && event.speak) {
                        status.type = 'tts';
                        char.isSpeakingTTS = true;
                        animator.SPEECH.speak(char.id, event.text,
                            { voiceName: event.voiceName, voiceLang: event.voiceLang, pitch: event.pitch, rate: event.rate },
                            () => { // onEnd
                                if (animator.activeEventGroupStatus[event._instanceId] === status) {
                                    status.completed = true; this._finalizeEvent(animator, event); this._checkActiveEventGroupCompletion(animator);
                                }
                                if (char) { char.isSpeakingTTS = false; char.dialogueText = null; }
                            },
                            (e_tts) => { // onError
                                console.error("TTS Error for dialogue event:", e_tts);
                                if (animator.activeEventGroupStatus[event._instanceId] === status) {
                                    status.completed = true; this._finalizeEvent(animator, event); this._checkActiveEventGroupCompletion(animator);
                                }
                                if (char) { char.isSpeakingTTS = false; char.dialogueText = null; }
                            }
                        );
                    } else {
                        if (status.type !== 'tts') status.completed = (status.duration <= 0.01);
                    }
                } else { status.completed = true; }
                break;
            case 'camera':
                animator.CAMERA_CONTROLS._applyCameraEvent(animator, event, false);
                if (event.duration && event.duration > 0) status.duration = event.duration;
                else status.completed = true;
                break;
            case 'attachObject':
                if (char && obj && event.hand) {
                    char.attachedObject = { objectId: obj.id, hand: event.hand, localOffset: event.offset };
                    obj.isAttachedTo = { characterId: char.id, hand: event.hand };
                    status.completed = true;
                    // Force update of attached object's position immediately
                    animator.CHAR_PIPELINE._updateAttachedObjectPosition(char, animator.objectsState, animator.UTILS, animator.DATA.CHARACTER_TEMPLATES[char.templateId]);
                    console.log(`[ANIM_DEBUG_TRANSFORM] attachObject: ${obj.id} to ${char.id}'s ${event.hand}. Obj pos: x=${obj.x.toFixed(1)}, y=${obj.y.toFixed(1)}`);
                } else { status.completed = true; }
                break;
            case 'detachObject':
                if (char && char.attachedObject) {
                    const oldObj = animator.objectsState[char.attachedObject.objectId];
                    if (oldObj) oldObj.isAttachedTo = null;
                    char.attachedObject = null;
                    status.completed = true;
                     console.log(`[ANIM_DEBUG_TRANSFORM] detachObject: from ${char.id}. Old obj ID: ${oldObj?.id}`);
                } else { status.completed = true; }
                break;
            default:
                status.completed = true;
                break;
        }
        if (status.type === 'instant' && !status.duration) { status.completed = true; }
        // if (status.completed) console.log(`[ANIM_DEBUG_FLOW]   Event ${event._instanceId} completed instantly.`);
    },

    _finalizeEvent: function(animator, event) {
        const char = event.characterId ? animator.charactersState[event.characterId] : null;
        // console.log(`[ANIM_DEBUG_FLOW] _finalizeEvent (${event._instanceId}): Type='${event.type}'`);
        switch (event.type) {
            case 'pose':
                if (char && (char.poseTransitionDuration <= 0.01 || event.transitionDuration <= 0.01)) char.poseTransitionProgress = 1;
                break;
            case 'expression':
                if (char && (char.expressionTransitionDuration <= 0.01 || event.transitionDuration <= 0.01)) char.expressionTransitionProgress = 1;
                break;
            case 'walk':
                if (char && event.targetPosition && char.walkDuration <= 0.001) {
                    // console.log(`[ANIM_DEBUG_TRANSFORM] Finalize Walk for ${char.id}: Current x=${char.x.toFixed(1)}, y=${char.y.toFixed(1)}. Target x=${char.targetX.toFixed(1)}, y=${char.targetY.toFixed(1)}.`);
                    if (typeof char.targetX === 'number' && !isNaN(char.targetX)) char.x = char.targetX;
                    if (typeof char.targetY === 'number' && !isNaN(char.targetY)) char.y = char.targetY;
                    // console.log(`[ANIM_DEBUG_TRANSFORM]   Snapped ${char.id} to x=${char.x.toFixed(1)}, y=${char.y.toFixed(1)} on finalize.`);
                }
                break;
            case 'dialogue':
                if (char && !char.isSpeakingTTS) char.dialogueText = null;
                break;
            case 'camera':
                if (event.duration) animator.CAMERA_CONTROLS._applyCameraEvent(animator, event, true); // Snap at end of timed camera event
                break;
        }
    },

    _checkActiveEventGroupCompletion: function(animator) {
        if (!animator.activeEventGroup) return;
        let allDone = true;
        for (const event of animator.activeEventGroup) {
            const status = animator.activeEventGroupStatus[event._instanceId];
            if (!status || status.completed) continue;

            if (status.type === 'timed' && animator.currentTime >= status.startTime + status.duration) {
                status.completed = true;
                this._finalizeEvent(animator, event);
                // console.log(`[ANIM_DEBUG_FLOW] Event ${event._instanceId} (timed) completed by duration.`);
            }
            if (status.type === 'tts' && !status.completed && animator.charactersState[event.characterId]?.isSpeakingTTS === false && animator.currentTime > status.startTime + 0.1) { // TTS ended externally
                status.completed = true;
                this._finalizeEvent(animator, event);
                // console.log(`[ANIM_DEBUG_FLOW] Event ${event._instanceId} (tts) completed by TTS ending externally.`);
            }
            if (!status.completed) allDone = false;
        }
        if (allDone) {
            // console.log(`[ANIM_DEBUG_FLOW] Group ${animator.currentEventGroupIndex + 1} all done.`);
            animator.activeEventGroup = null;
            if (animator.isPlaying) {
                this.processNextEventGroup(animator);
            } else {
                animator.ui.statusDiv.textContent = `Group ${animator.currentEventGroupIndex + 1} done. Paused.`;
                animator.SCENE_DRAWING.drawScene(animator);
            }
        }
    }
};