
// B"H
// Animator.Utils.js
window.AnimatorUtils = {
    // --- GENERAL MATH & INTERPOLATION ---
    lerp: (a, b, t) => a + (b - a) * t,
    smoothStep: (t) => t * t * (3 - 2 * t), // Hermite interpolation (0-1 in, 0-1 out, eases in/out)
    degToRad: (deg) => deg * (Math.PI / 180),
    radToDeg: (rad) => rad * (180 / Math.PI),
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    randomRange: (min, max) => Math.random() * (max - min) + min,

    // --- MATRIX OPERATIONS (2D Affine Transforms) ---
    // Column-major order: [a, b, c, d, tx, ty] where a,b are col1; c,d are col2; tx,ty is col3
    // Corresponds to:
    // | a  c  tx |
    // | b  d  ty |
    // | 0  0  1  |
    matrixIdentity: () => ({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }),
    matrixMultiply: (m1, m2) => ({
        a: m1.a * m2.a + m1.c * m2.b,          b: m1.b * m2.a + m1.d * m2.b,
        c: m1.a * m2.c + m1.c * m2.d,          d: m1.b * m2.c + m1.d * m2.d,
        tx: m1.a * m2.tx + m1.c * m2.ty + m1.tx, ty: m1.b * m2.tx + m1.d * m2.ty + m1.ty,
    }),
    matrixTranslate: (m, x, y) => AnimatorUtils.matrixMultiply(m, { a: 1, b: 0, c: 0, d: 1, tx: x, ty: y }),
    matrixRotate: (m, angleRad) => { // Rotates around the current matrix's origin
        const cos = Math.cos(angleRad); const sin = Math.sin(angleRad);
        return AnimatorUtils.matrixMultiply(m, { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 });
    },
    matrixScale: (m, sx, sy) => AnimatorUtils.matrixMultiply(m, { a: sx, b: 0, c: 0, d: sy, tx: 0, ty: 0 }),

    // Apply matrix to canvas context
    applyMatrixToContext: (ctx, m) => ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty),

    // Transform a point {x, y} by a matrix
    transformPoint: (p, m) => ({
        x: m.a * p.x + m.c * p.y + m.tx,
        y: m.b * p.x + m.d * p.y + m.ty
    }),
    // Inverse transform a point (useful for screen to world, etc., if matrix is invertible)
    invertMatrix: (m) => {
        const det = m.a * m.d - m.b * m.c;
        if (Math.abs(det) < 1e-10) { // Consider nearly singular as non-invertible
            console.warn("Matrix is not invertible (determinant is near zero).");
            return AnimatorUtils.matrixIdentity(); // Or throw error
        }
        const invDet = 1.0 / det;
        return {
            a: m.d * invDet,
            b: -m.b * invDet,
            c: -m.c * invDet,
            d: m.a * invDet,
            tx: (m.c * m.ty - m.d * m.tx) * invDet,
            ty: (m.b * m.tx - m.a * m.ty) * invDet
        };
    },
    getTranslationFromMatrix: (m) => ({ x: m.tx, y: m.ty }),
    getRotationFromMatrix: (m) => Math.atan2(m.b, m.a), // Returns radians
    getScaleFromMatrix: (m) => ({
        sx: Math.sqrt(m.a * m.a + m.b * m.b), // Magnitude of first basis vector
        sy: Math.sqrt(m.c * m.c + m.d * m.d)  // Magnitude of second basis vector
        // This assumes no shear. If shear exists, it's more complex.
    }),


    // --- INVERSE KINEMATICS (2-Link) ---
    // Solves for angles needed to reach targetX, targetY from baseX, baseY
    // Returns { angles: [rad0, rad1], elbow: {x,y}, hand: {x,y} (possibly constrained hand pos) }
    // rad0 is angle of limb1 relative to world-x, rad1 is angle of limb2 relative to limb1
    solve2LinkIK: (baseX, baseY, targetX, targetY, len1, len2, preferClockwiseBend = false) => {
        const dx = targetX - baseX;
        const dy = targetY - baseY;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        const epsilon = 0.001;

        // If target is out of reach, move target to edge of reachable circle
        if (dist > len1 + len2 - epsilon) {
            const ratio = (len1 + len2 - epsilon) / (dist || 1);
            targetX = baseX + dx * ratio;
            targetY = baseY + dy * ratio;
            dist = len1 + len2 - epsilon;
            distSq = dist * dist;
        }
        // If target is too close (inside inner circle, if len1 != len2), move to edge of inner circle
        else if (dist < Math.abs(len1 - len2) + epsilon) {
            const ratio = (Math.abs(len1 - len2) + epsilon) / (dist || 1);
            targetX = baseX + dx * ratio;
            targetY = baseY + dy * ratio;
            dist = Math.abs(len1 - len2) + epsilon;
            distSq = dist * dist;
        }

        // Law of Cosines to find angle at elbow (angle2)
        // distSq = len1^2 + len2^2 - 2 * len1 * len2 * cos(PI - angle2_internal)
        // cos(PI - angle2_internal) = (len1^2 + len2^2 - distSq) / (2 * len1 * len2)
        // angle2_internal is the angle inside the triangle at the elbow.
        // We want the bend angle, which is PI - angle2_internal for a convex bend.
        let cosAngle2Internal = (len1 * len1 + len2 * len2 - distSq) / (2 * len1 * len2);
        cosAngle2Internal = AnimatorUtils.clamp(cosAngle2Internal, -1, 1);
        let angle2Internal = Math.acos(cosAngle2Internal);
        let angle2 = Math.PI - angle2Internal; // Elbow bend angle (0 for straight, positive for typical bend)

        // Law of Cosines to find angle alpha at base (angle between len1 and line to target)
        // len2^2 = len1^2 + dist^2 - 2 * len1 * dist * cos(alpha)
        let cosAlpha = (len1 * len1 + distSq - len2 * len2) / (2 * len1 * dist);
        cosAlpha = AnimatorUtils.clamp(cosAlpha, -1, 1);
        let alpha = Math.acos(cosAlpha);

        const targetAngle = Math.atan2(dy, dx); // Angle from base to target

        // Adjust for bend direction
        const bendSign = preferClockwiseBend ? -1 : 1;
        const finalAngle0 = targetAngle - (alpha * bendSign); // Angle of first limb
        const finalAngle1 = angle2 * bendSign;          // Angle of second limb relative to first

        const elbowX = baseX + len1 * Math.cos(finalAngle0);
        const elbowY = baseY + len1 * Math.sin(finalAngle0);
        
        // The 'hand' here is the (possibly constrained) targetX, targetY
        const finalHandX = baseX + len1 * Math.cos(finalAngle0) + len2 * Math.cos(finalAngle0 + finalAngle1);
        const finalHandY = baseY + len1 * Math.sin(finalAngle0) + len2 * Math.sin(finalAngle0 + finalAngle1);


        return {
            angles: [finalAngle0, finalAngle1], // [world rotation for limb1, local rotation for limb2]
            elbow: { x: elbowX, y: elbowY },
            hand: { x: finalHandX, y: finalHandY }
        };
    },

    // --- COLOR UTILITIES ---
    adjustColor: (color, percent) => {
        if (!color || typeof color !== 'string' || !color.startsWith("#")) return color;
        try {
            let num = parseInt(color.slice(1), 16);
            let amt = Math.round(2.55 * percent);
            let R = AnimatorUtils.clamp(Math.round((num >> 16) + amt), 0, 255);
            let G = AnimatorUtils.clamp(Math.round(((num >> 8) & 0x00FF) + amt), 0, 255);
            let B = AnimatorUtils.clamp(Math.round((num & 0x0000FF) + amt), 0, 255);
            return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1).toUpperCase();
        } catch (e) { return color; }
    },

    // --- DEFAULT SHAPE RENDERERS --- (Copied and verified from previous response)
    _defaultShapeRenderers: {
        rect: (ctx, shapeDef, style, w, h, computedParams) => {
            ctx.fillStyle = style.fill || 'magenta';
            ctx.fillRect(0, 0, w, h);
            if (style.stroke && (style.lineWidth || shapeDef.lineWidth || 1) > 0) {
                ctx.strokeStyle = style.stroke;
                ctx.lineWidth = style.lineWidth || shapeDef.lineWidth || 1;
                ctx.strokeRect(0, 0, w, h);
            }
        },
        ellipse: (ctx, shapeDef, style, w, h, computedParams) => {
            ctx.fillStyle = style.fill || 'magenta';
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            if (style.stroke && (style.lineWidth || shapeDef.lineWidth || 1) > 0) {
                ctx.strokeStyle = style.stroke;
                ctx.lineWidth = style.lineWidth || shapeDef.lineWidth || 1;
                ctx.stroke();
            }
        },
        eye: (ctx, shapeDef, style, w, h, computedParams) => {
            const openFactor = computedParams.openFactor !== undefined ? computedParams.openFactor : 1.0;
            const pupilShiftX = computedParams.pupilShiftX || 0;
            const pupilShiftY = computedParams.pupilShiftY || 0;
            
            const eyeHeight = h * openFactor;
            const pupilRadius = shapeDef.pupilSizeFactor * style.baseScale;

            ctx.fillStyle = style.fill || 'white';
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, w / 2, eyeHeight / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            if (eyeHeight > pupilRadius * 0.5 && style.pupilFill) {
                ctx.fillStyle = style.pupilFill || 'black';
                const maxPupilOffsetX = Math.max(0, w / 2 - pupilRadius);
                const maxPupilOffsetY = Math.max(0, eyeHeight / 2 - pupilRadius);
                const clampedPupilX = w / 2 + AnimatorUtils.clamp(pupilShiftX, -maxPupilOffsetX, maxPupilOffsetX);
                const clampedPupilY = h / 2 + AnimatorUtils.clamp(pupilShiftY, -maxPupilOffsetY, maxPupilOffsetY);

                ctx.beginPath();
                ctx.arc(clampedPupilX, clampedPupilY, pupilRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "rgba(255,255,255,0.5)";
                ctx.beginPath();
                ctx.arc(clampedPupilX + pupilRadius * 0.25, clampedPupilY - pupilRadius * 0.25, pupilRadius * 0.35, 0, Math.PI*2);
                ctx.fill();
            }
        },
        mouth: (ctx, shapeDef, style, w, h, computedParams) => {
            const mouthKey = computedParams.shapeKey || shapeDef.initialShape || 'neutral';
            const AD = window.AnimatorData || {}; 
            const mouthDef = AD.MOUTH_SHAPES[mouthKey] || AD.MOUTH_SHAPES['neutral'] || {path: [{cmd:'M',x:-0.5,y:0},{cmd:'L',x:0.5,y:0}], openFactor:0};
            ctx.strokeStyle = style.color || 'black';
            ctx.lineWidth = Math.max(1, (shapeDef.lineWidthFactor || 0.005) * style.baseScale);
            const mouthDrawWidth = w * (mouthDef.widthFactor || 1);
            const mouthDrawHeight = h * (mouthDef.heightFactor || 1);
            const cx = w / 2; const cy = h / 2;
            ctx.beginPath();
            if (mouthDef.type === 'ellipse') {
                ctx.ellipse(cx, cy, mouthDrawWidth / 2, mouthDrawHeight / 2, 0, 0, Math.PI * 2);
            } else if (mouthDef.path) {
                mouthDef.path.forEach(cmd => {
                    const p = cmd;
                    switch (p.cmd) {
                        case 'M': ctx.moveTo(cx + p.x * mouthDrawWidth, cy + p.y * mouthDrawHeight); break;
                        case 'L': ctx.lineTo(cx + p.x * mouthDrawWidth, cy + p.y * mouthDrawHeight); break;
                        case 'Q': ctx.quadraticCurveTo(cx + p.x1 * mouthDrawWidth, cy + p.y1 * mouthDrawHeight, cx + p.x * mouthDrawWidth, cy + p.y * mouthDrawHeight); break;
                    }
                });
            }
            if (mouthDef.openFactor > 0.05) {
                ctx.fillStyle = AnimatorUtils.adjustColor(style.color || '#AA4455', -15);
                ctx.fill();
            }
            ctx.stroke();
        },
        tzitzit_strand: (ctx, shapeDef, style, w, h, computedParams) => {
            ctx.strokeStyle = style.color || 'white';
            ctx.lineWidth = Math.max(1, (shapeDef.lineWidthFactor || 0.007) * style.baseScale);
            const numStrings = shapeDef.numStrings || 2;
            const stringWidth = ctx.lineWidth; // Each strand takes up lineWidth
            // Total width occupied by strings if they are side-by-side
            const totalStringMaterialWidth = numStrings * stringWidth;
            // Remaining space for gaps, if w is wider than material
            const totalGapWidth = Math.max(0, w - totalStringMaterialWidth);
            const gapCount = Math.max(1, numStrings -1);
            const gapSize = (numStrings > 1) ? totalGapWidth / gapCount : 0;

            let currentX = -w/2 + stringWidth/2; // Start from left edge of part's bounding box

            for(let i = 0; i < numStrings; ++i) {
                ctx.beginPath();
                // Pivot of tzitzit part is top-center. We draw from 0,0 to 0,h relative to that pivot.
                // So we need to shift sx for multiple strands.
                const sx = (i - (numStrings - 1) / 2) * (stringWidth + gapSize) ;
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx, h);
                ctx.stroke();
            }
        }
    },

    // --- DEFAULT BEHAVIOR HANDLERS --- (Copied and verified from previous response)
    _defaultBehaviorHandlers: {
        blink: (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const cfg = behaviorInstance.config;
            let state = charState.behaviorStates.blink;
            if (!state) {
                state = charState.behaviorStates.blink = {
                    lastBlinkTime: currentTime,
                    nextBlinkDelay: AnimatorUtils.randomRange(cfg.intervalMin, cfg.intervalMax) / 1000,
                    isBlinking: false, blinkProgress: 0
                };
            }

            if (state.isBlinking) {
                state.blinkProgress += deltaTime / (cfg.duration || 0.16);
                let openFactor;
                if (state.blinkProgress < 0.5) { 
                    openFactor = 1 - AnimatorUtils.smoothStep(state.blinkProgress * 2) * 0.95;
                } else { 
                    openFactor = 0.05 + AnimatorUtils.smoothStep((state.blinkProgress - 0.5) * 2) * 0.95;
                }
                openFactor = AnimatorUtils.clamp(openFactor, 0.05, 1.0);

                cfg.targetPartIds.forEach(id => {
                    if (charState.parts[id]) charState.parts[id].computedParams.openFactor = openFactor;
                });

                if (state.blinkProgress >= 1) {
                    state.isBlinking = false; state.blinkProgress = 0;
                    state.lastBlinkTime = currentTime;
                    state.nextBlinkDelay = AnimatorUtils.randomRange(cfg.intervalMin, cfg.intervalMax) / 1000;
                    cfg.targetPartIds.forEach(id => {
                         if (charState.parts[id]) charState.parts[id].computedParams.openFactor = 1.0;
                    });
                }
            } else if (currentTime > state.lastBlinkTime + state.nextBlinkDelay) {
                state.isBlinking = true; state.blinkProgress = 0;
            }
        },
        eyeDart: (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const cfg = behaviorInstance.config;
            let state = charState.behaviorStates.eyeDart;
            if (!state) {
                state = charState.behaviorStates.eyeDart = {
                    lastDartTime: currentTime, nextDartDelay: AnimatorUtils.randomRange(cfg.intervalMin, cfg.intervalMax) / 1000,
                    isDarting: false, dartProgress: 0,
                    currentPupilShiftX: 0, currentPupilShiftY: 0,
                    targetPupilShiftX: 0, targetPupilShiftY: 0,
                    startPupilShiftX: 0, startPupilShiftY: 0
                };
            }

            if (state.isDarting) {
                state.dartProgress += deltaTime / (cfg.duration || 0.13);
                const t = AnimatorUtils.smoothStep(state.dartProgress);
                state.currentPupilShiftX = AnimatorUtils.lerp(state.startPupilShiftX, state.targetPupilShiftX, t);
                state.currentPupilShiftY = AnimatorUtils.lerp(state.startPupilShiftY, state.targetPupilShiftY, t);

                if (state.dartProgress >= 1) {
                    state.isDarting = false; state.dartProgress = 0;
                    state.lastDartTime = currentTime;
                    state.nextDartDelay = AnimatorUtils.randomRange(cfg.intervalMin, cfg.intervalMax) / 1000;
                    state.currentPupilShiftX = state.targetPupilShiftX;
                    state.currentPupilShiftY = state.targetPupilShiftY;
                }
            } else if (currentTime > state.lastDartTime + state.nextDartDelay) {
                state.isDarting = true; state.dartProgress = 0;
                state.startPupilShiftX = state.currentPupilShiftX;
                state.startPupilShiftY = state.currentPupilShiftY;
                const range = (cfg.rangeFactor || 0.0025) * baseScale;
                state.targetPupilShiftX = AnimatorUtils.randomRange(-range, range);
                state.targetPupilShiftY = AnimatorUtils.randomRange(-range * 0.5, range * 0.5);
            }

            cfg.targetPartIds.forEach(id => {
                if (charState.parts[id]) {
                    // This behavior directly sets pupilShiftX/Y, overriding expression-based shifts if any.
                    charState.parts[id].computedParams.pupilShiftX = state.currentPupilShiftX;
                    charState.parts[id].computedParams.pupilShiftY = state.currentPupilShiftY;
                }
            });
        },


        lipSync: (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const cfg = behaviorInstance.config;
            const mouthPartId = cfg.targetPartIds && cfg.targetPartIds[0] ? cfg.targetPartIds[0] : 'mouth';
            const mouthState = charState.parts[mouthPartId];

            if (!mouthState || !mouthState.computedParams) { // Ensure computedParams exists
                if (charState.behaviorStates.lipSync) delete charState.behaviorStates.lipSync;
                return;
            }
            
            if (!charState.isSpeakingTTS) {
                if (charState.behaviorStates.lipSync) {
                    delete charState.behaviorStates.lipSync;
                    // When stopping speech, mouth should revert to its expression-defined shape.
                    // This happens naturally because this behavior won't override computedParams.shapeKey anymore.
                    // The expression evaluation in _evaluatePoseAndExpression will set it.
                }
                return;
            }

            let state = charState.behaviorStates.lipSync;
            if (!state) {
                state = charState.behaviorStates.lipSync = {
                    lastShapeChangeTime: 0,
                    nextShapeChangeDelay: 0, // Force immediate change
                    currentShapeKey: mouthState.computedParams.shapeKey || 'neutral' 
                };
            }

            if (currentTime >= state.lastShapeChangeTime + state.nextShapeChangeDelay) {
                const DATA_ACCESS = window.AnimatorData; 
                const mouthShapesAvailable = Object.keys(DATA_ACCESS.MOUTH_SHAPES);
                let randomShape = state.currentShapeKey;

                if (mouthShapesAvailable.length > 1) {
                    let attempts = 0;
                    do {
                        randomShape = mouthShapesAvailable[Math.floor(Math.random() * mouthShapesAvailable.length)];
                        attempts++;
                    } while (mouthShapesAvailable.length > 2 && randomShape === state.currentShapeKey && attempts < 10); // Avoid same shape if many options, with limit
                }
                
                state.currentShapeKey = randomShape;
                state.lastShapeChangeTime = currentTime;
                state.nextShapeChangeDelay = AnimatorUtils.randomRange(cfg.minChangeInterval || 0.08, cfg.maxChangeInterval || 0.20);
            }
            mouthState.computedParams.shapeKey = state.currentShapeKey;
        },

        
        simpleSpringPhysics: (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const part = charState.parts[behaviorInstance.partId];
            if (!part) return;
            const cfg = behaviorInstance.config; // { stiffness, damping, gravityFactor, angleLimit }
            let state = part.behaviorStates.simpleSpringPhysics;
            if (!state) {
                state = part.behaviorStates.simpleSpringPhysics = { angleRad: 0, velRad: 0 };
            }

            // Get parent's world rotation (character-relative frame)
            let parentCharRelAngleRad = 0;
            if (part.effectiveDefinition.parentId && charState.parts[part.effectiveDefinition.parentId]?.charRelativeWorldMatrix) {
                 parentCharRelAngleRad = AnimatorUtils.getRotationFromMatrix(charState.parts[part.effectiveDefinition.parentId].charRelativeWorldMatrix);
            }
            // Note: If the character itself rotates, that charState.rotation should also be factored in here
            // to get the true world orientation of the parent part. For now, assuming character is upright.

            const stiffness = cfg.stiffness || 0.2;
            const damping = cfg.damping || 0.85;
            const gravityStrength = cfg.gravityFactor || 1.5;
            const angleLimitRad = AnimatorUtils.degToRad(cfg.angleLimit || 40);

            // Gravity wants to pull the part towards "world down".
            // "World down" is -PI/2 from world-X.
            // We need to find what angle (relative to parent's current orientation) corresponds to world down.
            // If parent is rotated by P, and part is rotated by A relative to parent, part's world angle is P+A.
            // We want P+A = -PI/2 (for vertical down). So target A_gravity = -PI/2 - P.
            // However, our spring is defined relative to the *parent's x-axis*.
            // So, the resting angle due to gravity is simply -parentCharRelAngleRad (if gravity pulls along world -Y).
            const gravityEquilibriumAngle = -parentCharRelAngleRad;

            const springForce = -stiffness * state.angleRad; // Pulls towards 0 relative to parent
            const gravityForce = gravityStrength * Math.sin(gravityEquilibriumAngle - state.angleRad); // Pulls from current angle towards gravityEquilibriumAngle
            const dampingForce = -damping * state.velRad;

            const accel = springForce + gravityForce + dampingForce;
            state.velRad += accel * deltaTime; // Simple Euler integration
            let newAngleRad = state.angleRad + state.velRad * deltaTime;

            if (Math.abs(newAngleRad) > angleLimitRad) {
                newAngleRad = AnimatorUtils.clamp(newAngleRad, -angleLimitRad, angleLimitRad);
                state.velRad *= -0.3; // Energy loss on impact
            }
            state.angleRad = newAngleRad;
            part.proceduralRotation = AnimatorUtils.radToDeg(state.angleRad); // Store in degrees
        }
    }
};