//B"H
// Animator.StateManagement.js

window.AnimatorCore_StateManagement = {
    _updateState: function(animator, deltaTime) {
        animator.CAMERA_CONTROLS._updateCamera(animator, deltaTime);

        Object.values(animator.charactersState).forEach(cs => {
            if (cs.visible) {
                 // console.log(`[ANIM_DEBUG_TRANSFORM] Pre-Update Char ${cs.id}: x=${cs.x?.toFixed(1)}, y=${cs.y?.toFixed(1)}, targetX=${cs.targetX?.toFixed(1)}, targetY=${cs.targetY?.toFixed(1)}, walkDur=${cs.walkDuration?.toFixed(2)}`);
                animator.CHAR_PIPELINE.updateCharacterState(cs, deltaTime, animator.currentTime, animator);
                 // console.log(`[ANIM_DEBUG_TRANSFORM] Post-Update Char ${cs.id}: x=${cs.x?.toFixed(1)}, y=${cs.y?.toFixed(1)}`);
            }
        });
        Object.values(animator.objectsState).forEach(os => {
            if (os.visible) this._updateObjectState(animator, os, deltaTime);
        });
        animator.EVENT_PROCESSOR._checkActiveEventGroupCompletion(animator); // Use EVENT_PROCESSOR
    },

    _updateObjectState: function(animator, objState, deltaTime) {
        if (objState.isAttachedTo) {
             // Position updated by character pipeline's _updateAttachedObjectPosition
            // console.log(`[ANIM_DEBUG_TRANSFORM] _updateObjectState (${objState.id}): Attached to ${objState.isAttachedTo.characterId}. Skipping matrix update here. Current pos: x=${objState.x?.toFixed(1)}, y=${objState.y?.toFixed(1)}`);
            return;
        }
        // console.log(`[ANIM_DEBUG_TRANSFORM] _updateObjectState (${objState.id}): Unattached. Calculating worldMatrix. Pos: x=${objState.x?.toFixed(1)}, y=${objState.y?.toFixed(1)}, rot=${objState.rotation?.toFixed(1)}`);
        let m = animator.UTILS.matrixIdentity();
        const pivot = objState.definition.pivot || { x: 0.5, y: 0.5 };
        const pivotX = pivot.x * objState.currentDimensions.w;
        const pivotY = pivot.y * objState.currentDimensions.h;
        m = animator.UTILS.matrixTranslate(m, objState.x, objState.y);
        m = animator.UTILS.matrixTranslate(m, pivotX, pivotY);
        m = animator.UTILS.matrixRotate(m, animator.UTILS.degToRad(objState.rotation));
        m = animator.UTILS.matrixTranslate(m, -pivotX, -pivotY);
        objState.worldMatrix = m;
        // console.log(`[ANIM_DEBUG_TRANSFORM]   New worldMatrix for ${objState.id}: ${JSON.stringify(objState.worldMatrix)}`);
    }
};