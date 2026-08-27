//B"H
// Animator.EventProcessor.js (v1.3 - Added TimeScale logging)

window.AnimatorCore_EventProcessor = {
    processNextEventGroup: function(animator) {
        if (animator.currentEventGroupIndex >= animator.eventTimeline.length - 1) {
            if (animator.animationData?.scene?.loop) {
                animator.DATA_HANDLER.restartAnimationPrerequisites(animator);
            } else {
                animator.ui.statusDiv.textContent = "Animation finished.";
                animator.stopAnimation();
                return;
            }
        }
        animator.currentEventGroupIndex++;
        animator.activeEventGroup = animator.eventTimeline[animator.currentEventGroupIndex];
        animator.activeEventGroupStatus = {};
        animator.CORE._updateTimelineUIFocus();

        if (!animator.activeEventGroup?.length) {
            if (animator.isPlaying) this.processNextEventGroup(animator);
            return;
        }

        animator.ui.statusDiv.textContent = `Group ${animator.currentEventGroupIndex + 1}/${animator.eventTimeline.length}`;

        animator.activeEventGroup.forEach(event => {
            if (event.conditionVariable && animator.globalVariables) {
                const varValue = animator.globalVariables[event.conditionVariable];
                let skipEvent = false;
                if (event.conditionValue !== undefined && varValue !== event.conditionValue) {
                    skipEvent = true;
                }
                if (!skipEvent && event.conditionExists !== undefined) {
                    if ((event.conditionExists && varValue === undefined) || (!event.conditionExists && varValue !== undefined)) {
                        skipEvent = true;
                    }
                }
                if (skipEvent) {
                    animator.activeEventGroupStatus[event._instanceId] = { completed: true, skipped: true, type: 'instant' };
                    return; 
                }
            }

            const effectiveStartTime = animator.currentTime + (event.delay || 0);
            animator.activeEventGroupStatus[event._instanceId] = {
                completed: false,
                startTime: effectiveStartTime, 
                initiated: false,            
                originalDelay: event.delay || 0, 
                type: 'instant',              
                duration: 0                   
            };
        });
        this._checkActiveEventGroupCompletion(animator); 
    },

    _initiateEvent: function(animator, event) {
        const status = animator.activeEventGroupStatus[event._instanceId];
        if (status.skipped || status.initiated) return;

        status.initiated = true; 

        let baseDuration = event.duration !== undefined && event.duration > 0 ? event.duration : 0;
        
        if (baseDuration > 0) {
            status.type = 'timed';
            status.duration = baseDuration;
        } else if (event.type === 'dialogue' && event.speak) {
            status.type = 'tts';
        } else if ((event.type === 'pose' || event.type === 'expression') ) {
            const char = animator.charactersState[event.characterId];
            let transitionDur = 0;
            if(char) {
                transitionDur = event.transitionDuration ?? 
                                (event.type === 'pose' ? char.poseTransitionDuration 
                                                         : char.expressionTransitionDuration) 
                                ?? 0.3;
            } else {
                 transitionDur = event.transitionDuration ?? 0.3;
            }

            if (transitionDur > 0.01) {
                status.type = 'timed'; 
                status.duration = transitionDur;
            } else {
                 status.type = 'instant';
                 status.duration = 0;
            }
        } else {
            status.type = 'instant';
            status.duration = 0;
        }


        const char = event.characterId ? animator.charactersState[event.characterId] : null;
        const obj = event.objectId ? animator.objectsState[event.objectId] : null;
        let entity = char || obj;

        // console.log(`[EventProc] Initiating ${event._instanceId} (${event.type}) at CT:${animator.currentTime.toFixed(2)}. Event Def: Delay=${event.delay||0}, Dur=${event.duration||0}. Status: Type=${status.type}, EffStartTime=${status.startTime.toFixed(2)}, EffDur=${status.duration.toFixed(2)}`);

        switch (event.type) {
            case 'pose':
                if (char) {
                    char.previousPoseName = char.activePoseName; char.activePoseName = event.poseName;
                    char.poseTransitionProgress = 0;
                    // Use the duration already set in status if it's timed
                    char.poseTransitionDuration = status.type === 'timed' ? status.duration : (event.transitionDuration ?? char.poseTransitionDuration);
                    if (char.poseTransitionDuration <= 0.01) { 
                        char.poseTransitionProgress = 1;
                        if (status.type === 'instant') status.completed = true;
                    }
                } else if (status.type === 'instant') status.completed = true;
                break;
            case 'expression':
                if (char) {
                    char.previousExpressionName = char.activeExpressionName; char.activeExpressionName = event.expressionName;
                    char.expressionTransitionProgress = 0;
                    char.expressionTransitionDuration = status.type === 'timed' ? status.duration : (event.transitionDuration ?? char.expressionTransitionDuration);
                    if (char.expressionTransitionDuration <= 0.01) {
                        char.expressionTransitionProgress = 1;
                        if (status.type === 'instant') status.completed = true;
                    }
                } else if (status.type === 'instant') status.completed = true;
                break;
            case 'walk':
                if (char && event.targetPosition && typeof event.targetPosition.x === 'number' && typeof event.targetPosition.y === 'number') {
                    char.walkStartX = char.x; char.walkStartY = char.y;
                    char.targetX = event.targetPosition.x; char.targetY = event.targetPosition.y;
                    char.walkStartTime = animator.currentTime; 
                    
                    if (status.type === 'timed' && status.duration > 0) {
                        char.walkDuration = status.duration;
                    } else { 
                        char.x = char.targetX; char.y = char.targetY; char.walkDuration = 0;
                        status.completed = true; 
                    }
                    if (event.facing) { char.facingDirection = event.facing; if (event.facingMode) char.facingMode = event.facingMode; }
                    else { const dX = char.targetX - char.x; if (Math.abs(dX) > 1) char.facingDirection = dX > 0 ? 'right' : 'left'; }
                } else { status.completed = true; } 
                break;
            case 'dialogue':
                if (char && event.text) {
                    char.dialogueText = event.text; char.isSpeakingTTS = false;
                    
                    if (animator.SPEECH.isSupported && event.speak) {
                        status.type = 'tts'; 
                        char.isSpeakingTTS = true;
                        // PASS CHARACTER GENDER HERE
                        const charGender = char.appearanceFlags?.gender || 'neutral';
                        animator.SPEECH.speak(char.id, event.text,
                            { voiceName: event.voiceName, voiceLang: event.voiceLang, pitch: event.pitch, rate: event.rate },
                            () => { /* onEnd callback */ },
                            (e) => { /* onError callback */ },
                            charGender // Pass the gender
                        );
                    } else { 
                        // ... (rest of dialogue logic for non-TTS)
                    }
                } else { status.completed = true; }
                break;
            case 'showThought':
                if (char && event.text) {
                    char.thoughtText = event.text;
                    status.type = 'timed';
                    status.duration = baseDuration || (event.text.length * 0.1 + 1.0);
                    if (status.duration <= 0.01) status.completed = true;
                } else { status.completed = true; }
                break;
            case 'camera':
                animator.CAMERA_CONTROLS._applyCameraEvent(animator, event, false); 
                if (status.type === 'instant') status.completed = true;
                break;
            case 'attachObject': 
                if (char && obj && event.hand) {
                    char.attachedObject = { objectId: obj.id, hand: event.hand, localOffset: event.offset };
                    obj.isAttachedTo = { characterId: char.id, hand: event.hand };
                    animator.CHAR_PIPELINE._updateAttachedObjectPosition(char, animator.objectsState, animator.UTILS, animator.DATA.CHARACTER_TEMPLATES[char.templateId]);
                }
                status.completed = true;
                break;
            case 'detachObject': 
                if (char && char.attachedObject) {
                    const oldObj = animator.objectsState[char.attachedObject.objectId];
                    if (oldObj) oldObj.isAttachedTo = null;
                    char.attachedObject = null;
                }
                status.completed = true;
                break;
            case 'followPath':
                if (entity && event.pathId && animator.DATA.SCENE_DATA.paths[event.pathId]) {
                    const pathDurationForOneLoop = baseDuration || 5; // event.duration refers to one loop usually
                    entity.pathFollowState = {
                        isActive: true, pathId: event.pathId, progress: 0,
                        duration: pathDurationForOneLoop, 
                        loop: event.loop || false,
                        orientToPath: event.orientToPath !== false,
                        startTime: animator.currentTime 
                    };
                    
                    status.type = 'timed';
                    if (entity.pathFollowState.loop && event.loopCount > 1) {
                        status.duration = pathDurationForOneLoop * event.loopCount;
                    } else {
                        status.duration = pathDurationForOneLoop; 
                    }
                    if(char) { char.activePoseName = event.poseName || 'walk'; char.previousPoseName = char.activePoseName; char.poseTransitionProgress = 1;}
                } else { status.completed = true; }
                break;
            case 'sitOnObject':
                 if (char && obj && event.interactionPointId) {
                    const pointDef = obj.definition.interactionPoints?.[event.interactionPointId];
                    if (pointDef) {
                        const localPt = { x: pointDef.x * obj.currentDimensions.w, y: pointDef.y * obj.currentDimensions.h };
                        const targetWorldPos = animator.UTILS.transformPoint(localPt, obj.worldMatrix);
                        
                        char.targetX = targetWorldPos.x; char.targetY = targetWorldPos.y;
                        char.walkStartX = char.x; char.walkStartY = char.y;
                        char.walkStartTime = animator.currentTime; 
                        
                        const approachDist = animator.UTILS.distance({x:char.x, y:char.y}, targetWorldPos);
                        const baseSpeed = (animator.DATA.CHARACTER_TEMPLATES[char.templateId]?.baseHeight || 160) * 0.75; 
                        const approachDur = event.approachDuration ?? (baseSpeed > 0 ? Math.max(0.3, approachDist / baseSpeed) : 0.5);

                        char.walkDuration = approachDur; // This part is timed by walk mechanism
                        status.type = 'timed';
                        // Total duration for the event in the group includes walk + sit pose transition
                        status.duration = approachDur + (event.sitPoseDuration || 0.5); 
                        
                        char.interactionTarget = { type: 'sit', objectId: obj.id, pointId: event.interactionPointId, pose: pointDef.requiredPose || 'sit_on_object', finalFacing: event.finalFacing || obj.rotation, approachDuration: approachDur };
                        if(char) { char.activePoseName = event.approachPoseName || 'walk'; char.previousPoseName = char.activePoseName; char.poseTransitionProgress = 1;}
                    } else status.completed = true;
                } else status.completed = true;
                break;
            case 'performGesture':
                 if (char && event.gestureName && animator.DATA.POSES[event.gestureName]) {
                    char.previousPoseName = char.activePoseName;
                    char.activePoseName = event.gestureName;
                    char.poseTransitionProgress = 0;
                    const gesturePose = animator.DATA.POSES[event.gestureName];
                    status.type = 'timed';
                    status.duration = baseDuration || ((gesturePose.totalCycleTime || 1.0) / (gesturePose.speedFactor || 1.0));
                 } else status.completed = true;
                break;
            case 'setMood': 
                if (char && event.moodName) char.mood = event.moodName;
                status.completed = true; 
                break;
            case 'applyAppearanceSet': 
                if (char && event.setName) char.activeAppearanceSet = event.setName;
                status.completed = true; 
                break;
            case 'timeScale':
                animator.globalTimeScaleFactor = event.factor ?? 1.0;
                if (status.type === 'instant') status.completed = true;
                break;
            case 'screenEffect':
                animator.activeScreenEffect = { 
                    type: event.effectType, 
                    intensity: event.intensity, 
                    endTime: status.type === 'timed' && status.duration > 0 ? animator.currentTime + status.duration : null 
                };
                if (status.type === 'instant') status.completed = true;
                break;
            case 'playSound':
                animator.SFX.play(event.soundId, event.volume, event.loop);
                if (status.type === 'instant') status.completed = true;
                break;
            case 'setGlobalVariable':
                if (event.varName) animator.globalVariables[event.varName] = event.value;
                status.completed = true;
                break;
            default: 
                status.completed = true; 
                break;
        }

        if (status.type === 'instant' && !status.duration) { // Double check for instant completion
             status.completed = true;
        }
    },

    _finalizeEvent: function(animator, event) {
        const char = event.characterId ? animator.charactersState[event.characterId] : null;
        const obj = event.objectId ? animator.objectsState[event.objectId] : null;
        let entity = char || obj;

        switch (event.type) {
            case 'pose': 
                if (char && char.poseTransitionProgress < 1) char.poseTransitionProgress = 1; 
                break;
            case 'expression': 
                if (char && char.expressionTransitionProgress < 1) char.expressionTransitionProgress = 1;
                break;
            case 'walk':
                if (char && char.walkDuration > 0) { 
                    char.x = char.targetX; char.y = char.targetY;
                    char.walkDuration = 0;
                }
                break;
            case 'dialogue': 
                if (char && !char.isSpeakingTTS) char.dialogueText = null; 
                break;
            case 'showThought': 
                if (char) char.thoughtText = null; 
                break;
            case 'camera': 
                if (event.duration > 0) animator.CAMERA_CONTROLS._applyCameraEvent(animator, event, true);
                break;
            case 'timeScale': 
                animator.globalTimeScaleFactor = 1.0; 
                break;
            case 'screenEffect': 
                if (animator.activeScreenEffect && animator.activeScreenEffect.type === event.effectType && animator.activeScreenEffect.endTime === null) {
                    animator.activeScreenEffect = null;
                }
                break;
            case 'followPath':
                if (entity && entity.pathFollowState) {
                    const pathWasActive = entity.pathFollowState.isActive; // Check if it was active before this finalize
                    entity.pathFollowState.isActive = false; 
                    if (pathWasActive && !entity.pathFollowState.loop) { 
                        const pathData = animator.DATA.SCENE_DATA.paths[entity.pathFollowState.pathId];
                        if (pathData && pathData.points.length > 0) {
                            const endPoint = animator.UTILS.getPointOnLinearPath(pathData.points, 1.0);
                            entity.x = endPoint.x; entity.y = endPoint.y;
                            if (entity.pathFollowState.orientToPath) entity.rotation = animator.UTILS.radToDeg(endPoint.angle);
                        }
                        if (char) { 
                            char.targetX = char.x; char.targetY = char.y; char.walkDuration = 0;
                        }
                    }
                }
                break;
            case 'sitOnObject':
                if (char && char.interactionTarget && char.interactionTarget.type === 'sit') {
                    // This finalize is called when the *entire event duration* (walk + sit pose) is up.
                    // The pose transition part is managed by CharacterPipeline.
                    // Here we just ensure the interaction state is cleaned up.
                    char.x = char.targetX; char.y = char.targetY; // Final snap
                    char.walkDuration = 0;
                    // Ensure final pose is set if transition didn't complete fully (e.g. due to quick succession of events)
                    if(char.activePoseName !== char.interactionTarget.pose) {
                        char.previousPoseName = char.activePoseName;
                        char.activePoseName = char.interactionTarget.pose;
                        char.poseTransitionProgress = 1; // Force completion
                    }
                    char.interactionTarget = null; 
                }
                break;
            case 'performGesture':
                if (char) {
                    // Ensure gesture is finished and character is back to a stable pose
                    if(char.activePoseName === event.gestureName) { // If still in gesture pose
                        char.previousPoseName = char.activePoseName;
                        char.activePoseName = event.revertPoseName || 'idle_default';
                        char.poseTransitionProgress = 1; // Snap to revert pose
                    }
                }
                break;
        }
    },

    _checkActiveEventGroupCompletion: function(animator) {
        if (!animator.activeEventGroup) return;
        let allDone = true;

        for (const event of animator.activeEventGroup) {
            const status = animator.activeEventGroupStatus[event._instanceId];
            if (!status || status.completed) continue;

            if (!status.initiated && animator.currentTime >= status.startTime) {
                this._initiateEvent(animator, event);
                if (status.completed) continue;
            }

            if (!status.initiated) {
                allDone = false;
                continue;
            }
            
            // ADDED LOGGING FOR TIMESCALE
            if (event.type === 'timeScale' && status.initiated && !status.completed) {
                // console.log(`[TimeScale Check] Group ${animator.currentEventGroupIndex + 1}: CT: ${animator.currentTime.toFixed(2)}, Start: ${status.startTime.toFixed(2)}, Dur: ${status.duration.toFixed(2)}, TargetEnd: ${(status.startTime + status.duration).toFixed(2)}, Factor: ${animator.globalTimeScaleFactor}`);
            }


            if (status.type === 'timed' && status.duration > 0) {
                if (animator.currentTime >= status.startTime + status.duration) {
                    if (!status.completed) { // Prevent double finalization
                        status.completed = true;
                        this._finalizeEvent(animator, event);
                    }
                }
            } else if (status.type === 'tts') {
                // TTS handles its own completion via callback
            } else if (status.type === 'instant') {
                 if (!status.completed) status.completed = true; // Should be caught by initiate, but safeguard
            }
            
            if (event.type === 'followPath' && status.initiated) {
                const entity = animator.charactersState[event.characterId] || animator.objectsState[event.objectId];
                if (entity && entity.pathFollowState && !entity.pathFollowState.isActive && !entity.pathFollowState.loop) {
                    // Path itself (one iteration) is done.
                    // The event's `status.duration` might be for multiple loops or just one.
                    // If total event duration is also met, then it's fully complete.
                    if (animator.currentTime >= status.startTime + status.duration) {
                         if (!status.completed) {
                            status.completed = true;
                            this._finalizeEvent(animator, event); 
                         }
                    }
                }
            }

            if (event.type === 'sitOnObject' && status.initiated) {
                const char = animator.charactersState[event.characterId];
                if (char && char.interactionTarget && char.interactionTarget.type === 'sit') {
                    // Check if walking part is done
                    if (animator.currentTime >= status.startTime + char.interactionTarget.approachDuration) {
                        // If walk done, and current pose is not the sit pose yet, finalize to trigger sit pose.
                        // This will be called repeatedly until the sit pose transition also finishes.
                        if (char.activePoseName !== char.interactionTarget.pose || char.poseTransitionProgress < 1) {
                            // Only call finalize to trigger the sit pose once. The pose transition itself is timed.
                            // The _finalizeEvent for sitOnObject will set the pose.
                            // The outer check for status.duration will eventually complete the whole event.
                        }
                    }
                }
                // Overall completion for sitOnObject (walk + sit pose transition)
                if (animator.currentTime >= status.startTime + status.duration) {
                   if (!status.completed) {
                        status.completed = true;
                        this._finalizeEvent(animator, event); 
                   }
               }
            }


            if (!status.completed) {
                allDone = false;
            }
        }

        if (allDone) {
            // console.log(`[EventProc] Group ${animator.currentEventGroupIndex + 1} ALL DONE. CT: ${animator.currentTime.toFixed(2)}`);
            animator.activeEventGroup = null;
            animator.CORE._updateTimelineUIFocus(); 
            if (animator.isPlaying) {
                this.processNextEventGroup(animator);
            } else {
                animator.ui.statusDiv.textContent = `Group ${animator.currentEventGroupIndex + 1} done. Paused.`;
                animator.SCENE_DRAWING.drawScene(animator);
            }
        }
    }
};