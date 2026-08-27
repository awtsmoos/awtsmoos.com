//B"H
// Animator.StateManagement.js (v1.1 - Integrate Object Pipeline, Time Scale, Screen Effects)

window.AnimatorCore_StateManagement = {
    _updateState: function(animator, deltaTime) { // deltaTime is now pre-scaled by globalTimeScaleFactor
        animator.CAMERA_CONTROLS._updateCamera(animator, deltaTime);

        // Update screen effects
        if (animator.activeScreenEffect && animator.activeScreenEffect.endTime && animator.currentTime >= animator.activeScreenEffect.endTime) {
            animator.activeScreenEffect = null; // Effect duration ended
        }

        // Update characters
        Object.values(animator.charactersState).forEach(cs => {
            if (cs.visible) {
                animator.CHAR_PIPELINE.updateCharacterState(cs, deltaTime, animator.currentTime, animator);
            }
        });
        // Update objects (and their children)
        Object.values(animator.objectsState).forEach(os => {
            if (os.visible) {
                animator.OBJECT_PIPELINE.updateObjectState(os, deltaTime, animator.currentTime, animator);
            }
        });
        animator.EVENT_PROCESSOR._checkActiveEventGroupCompletion(animator);
    },

    // _updateObjectState is now primarily handled by Animator.ObjectPipeline.js
    // This file could contain more global state management logic if needed in the future.
};