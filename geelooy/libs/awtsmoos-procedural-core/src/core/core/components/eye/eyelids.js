
// B"H

/**
 * ===============================================================
 * EYELID GEOMETRY MANIFEST
 * ---------------------------------------------------------------
 * The lids are curtains of flesh that glide over the moon of the
 * eye. Their geometry must be slightly larger than the sclera so
 * that during blinking the iris disappears beneath living skin.
 *
 * This generator produces upper and lower lids using a UV sphere
 * and collapsing the hidden hemisphere inward.
 *
 * Returned object follows the engine's declarative primitive spec.
 * ===============================================================
 */

export function getQuadrantLidMesh(isTop) {

    const hiddenRings = isTop ? [9,16] : [0,7];

    return {
        primitive:"uvSphere",

        parameters:{
            radius:1.22,
            rings:16,
            segments:24,
            color:[0.94,0.76,0.64,1.0]
        },

        modifiers:[
            {
                type:"scaleRings",
                params:{
                    rings:hiddenRings,
                    scale:[0.001,0.001,0.001]
                }
            },

            {
                type:"translateRings",
                params:{
                    rings:hiddenRings,
                    translation:[0,isTop?-0.15:0.15,0]
                }
            },

            {
                type:"smoothNormals"
            }
        ]
    };
}

/**
 * Default eyelid rotation when open.
 * Upper lid tilts upward, lower downward.
 */
export function getDefaultLidRotation(isTop){
    return isTop
        ?[-0.785,0,0]
        :[0.785,0,0];
}

/**
 * Blink keyframes for animation system.
 */
export function getBlinkKeyframes(isTop){

    const openRot=getDefaultLidRotation(isTop);
    const closedRot=[0,0,0];

    return[
        {time:0,rotation:openRot},
        {time:0.45,rotation:closedRot},
        {time:0.9,rotation:openRot}
    ];
}
