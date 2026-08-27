
// B"H
/**
 * @file CustomActionEngine.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 7: THE INFINITE VARIETY (Givun Ein Sofi)
 * ═══════════════════════════════════════════════════════════════
 * 
 * "Make any object or any nested groups of objects able to be parented 
 * to any joint or any other object at any time. This can allow someone 
 * to like brush their teeth with anything or define custom actions in 
 * the json and add lots of anime variety."
 * 
 * The timeline triggers `type: 'custom_macro'`. This engine parses 
 * arrays of generic operations, generating items and snapping them to 
 * joints universally.
 * 
 * @class CustomActionEngine
 */
export class CustomActionEngine {
  static execute(event, state) {
    const scene = state.get('scene') || {};
    const chars = state.get('characters') || {};
    const actor = chars[event.actor];

    if (!actor) return;

    // ─── 1. MODULAR JSON PARAMETERIZED ACTION ──────────────────────────
    if (event.params) {
        if (event.params.propType && event.params.attachBone) {
            if (!scene.props) scene.props = [];
            const propId = `${actor.id}_macro_${event.params.propType}`;
            
            if (!scene.props.find(p => p.id === propId)) {
                const inverseScale = 1.0 / ((actor.position?.scale || 1.0) * (actor.mod?.body || 1.0));
                const finalScale = (event.params.scale || 1.0) * inverseScale;

                scene.props.push({
                    id: propId,
                    type: event.params.propType,
                    parentId: actor.id,
                    parentBone: event.params.attachBone,
                    x: event.params.offsetX || 0,
                    y: event.params.offsetY || 0,
                    rotation: event.params.rotation || 0,
                    scale: finalScale,
                    color: event.params.color || undefined
                });
            }
        }

        if (event.params.actingState) {
            actor.acting = event.params.actingState;
            actor.heldItemSide = event.params.attachBone.includes('right') ? 'right' : 'left';
        }

        if (event.params.vfx) actor.vfx_aura = true;
        if (event.params.invertGravity) {
            if (!actor.physics) actor.physics = {};
            actor.physics.invertGravity = true;
        }
    } 
    // ─── 2. PRE-BAKED LEGACY MACROS ──────────────────────────────────
    else {
        switch (event.script) {
          case 'brush_teeth':
            if (!scene.props) scene.props = [];
            const tbId = `${actor.id}_toothbrush`;
            if (!scene.props.find(p => p.id === tbId)) {
              const invScale = 1.0 / ((actor.position?.scale || 1.0) * (actor.mod?.body || 1.0));
              scene.props.push({ 
                  id: tbId, type: 'toothbrush', parentId: actor.id, parentBone: 'wrist_right', 
                  x: 35, y: 15, rotation: -110, scale: 0.8 * invScale 
              });
            }
            actor.acting = 'brush_teeth_motion';
            actor.heldItemSide = 'right';
            break;

          case 'anime_rage':
            actor.acting = 'anime_rage_pose';
            actor.exaggeration = 2.0; 
            actor.anger = 1.0;
            actor.vfx_aura = true; 
            if (!actor.physics) actor.physics = {};
            actor.physics.invertGravity = true;
            break;
            
          case 'clear_macros':
            actor.acting = 'neutral';
            actor.vfx_aura = false;
            actor.heldItemSide = null;
            if (actor.physics) actor.physics.invertGravity = false;
            if (scene.props) scene.props = scene.props.filter(p => !p.id.startsWith(actor.id + '_'));
            break;
        }
    }

    state.set('scene', { ...scene }, true);
    state.set('characters', { ...chars }, true);
  }
}
