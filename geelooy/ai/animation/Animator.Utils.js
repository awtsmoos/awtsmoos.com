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
    distance: (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),
    angleBetweenPoints: (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x),

    // --- PATH UTILITIES ---
    getPointOnLinearPath: (points, t) => {
        if (!points || points.length === 0) return { x: 0, y: 0, angle: 0 };
        if (points.length === 1) return { x: points[0].x, y: points[0].y, angle: 0 };
        const totalLength = points.reduce((acc, p, i) => i > 0 ? acc + AnimatorUtils.distance(points[i-1], p) : 0, 0);
        if (totalLength === 0) return { x: points[0].x, y: points[0].y, angle: 0 }; // All points coincident

        const targetDist = t * totalLength;
        let distCovered = 0;
        for (let i = 1; i < points.length; i++) {
            const segStart = points[i-1];
            const segEnd = points[i];
            const segLen = AnimatorUtils.distance(segStart, segEnd);
            if (distCovered + segLen >= targetDist) {
                const segT = (targetDist - distCovered) / (segLen || 1); // Avoid div by zero if segLen is 0
                return {
                    x: AnimatorUtils.lerp(segStart.x, segEnd.x, segT),
                    y: AnimatorUtils.lerp(segStart.y, segEnd.y, segT),
                    angle: AnimatorUtils.angleBetweenPoints(segStart, segEnd)
                };
            }
            distCovered += segLen;
        }
        // Should reach here only if t >= 1 due to clamping or floating point issues
        const lastAngle = points.length > 1 ? AnimatorUtils.angleBetweenPoints(points[points.length-2], points[points.length-1]) : 0;
        return { x: points[points.length-1].x, y: points[points.length-1].y, angle: lastAngle };
    },


    // --- MATRIX OPERATIONS (2D Affine Transforms) ---
    matrixIdentity: () => ({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }),
    matrixMultiply: (m1, m2) => ({
        a: m1.a * m2.a + m1.c * m2.b,          b: m1.b * m2.a + m1.d * m2.b,
        c: m1.a * m2.c + m1.c * m2.d,          d: m1.b * m2.c + m1.d * m2.d,
        tx: m1.a * m2.tx + m1.c * m2.ty + m1.tx, ty: m1.b * m2.tx + m1.d * m2.ty + m1.ty,
    }),
    matrixTranslate: (m, x, y) => AnimatorUtils.matrixMultiply(m, { a: 1, b: 0, c: 0, d: 1, tx: x, ty: y }),
    matrixRotate: (m, angleRad) => {
        const cos = Math.cos(angleRad); const sin = Math.sin(angleRad);
        return AnimatorUtils.matrixMultiply(m, { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 });
    },
    matrixScale: (m, sx, sy) => AnimatorUtils.matrixMultiply(m, { a: sx, b: 0, c: 0, d: sy, tx: 0, ty: 0 }),
    applyMatrixToContext: (ctx, m) => ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty),
    transformPoint: (p, m) => ({
        x: m.a * p.x + m.c * p.y + m.tx,
        y: m.b * p.x + m.d * p.y + m.ty
    }),
    invertMatrix: (m) => {
        const det = m.a * m.d - m.b * m.c;
        if (Math.abs(det) < 1e-10) {
            console.warn("Matrix is not invertible (determinant is near zero).");
            return AnimatorUtils.matrixIdentity();
        }
        const invDet = 1.0 / det;
        return {
            a: m.d * invDet, b: -m.b * invDet,
            c: -m.c * invDet, d: m.a * invDet,
            tx: (m.c * m.ty - m.d * m.tx) * invDet,
            ty: (m.b * m.tx - m.a * m.ty) * invDet
        };
    },
    getTranslationFromMatrix: (m) => ({ x: m.tx, y: m.ty }),
    getRotationFromMatrix: (m) => Math.atan2(m.b, m.a),
    getScaleFromMatrix: (m) => ({
        sx: Math.sqrt(m.a * m.a + m.b * m.b),
        sy: Math.sqrt(m.c * m.c + m.d * m.d)
    }),

    // --- INVERSE KINEMATICS (2-Link) ---
    solve2LinkIK: (baseX, baseY, targetX, targetY, len1, len2, preferClockwiseBend = false) => {
        const dx = targetX - baseX;
        const dy = targetY - baseY;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        const epsilon = 0.001;

        if (dist > len1 + len2 - epsilon) {
            const ratio = (len1 + len2 - epsilon) / (dist || 1);
            targetX = baseX + dx * ratio; targetY = baseY + dy * ratio;
            dist = len1 + len2 - epsilon; distSq = dist * dist;
        }
        else if (dist < Math.abs(len1 - len2) + epsilon) {
            const ratio = (Math.abs(len1 - len2) + epsilon) / (dist || 1);
            targetX = baseX + dx * ratio; targetY = baseY + dy * ratio;
            dist = Math.abs(len1 - len2) + epsilon; distSq = dist * dist;
        }

        let cosAngle2Internal = (len1 * len1 + len2 * len2 - distSq) / (2 * len1 * len2);
        cosAngle2Internal = AnimatorUtils.clamp(cosAngle2Internal, -1, 1);
        let angle2Internal = Math.acos(cosAngle2Internal);
        let angle2 = Math.PI - angle2Internal; 

        let cosAlpha = (len1 * len1 + distSq - len2 * len2) / (2 * len1 * dist);
        cosAlpha = AnimatorUtils.clamp(cosAlpha, -1, 1);
        let alpha = Math.acos(cosAlpha);

        const targetAngle = Math.atan2(dy, dx);
        const bendSign = preferClockwiseBend ? -1 : 1;
        const finalAngle0 = targetAngle - (alpha * bendSign);
        const finalAngle1 = angle2 * bendSign;

        const elbowX = baseX + len1 * Math.cos(finalAngle0);
        const elbowY = baseY + len1 * Math.sin(finalAngle0);
        const finalHandX = baseX + len1 * Math.cos(finalAngle0) + len2 * Math.cos(finalAngle0 + finalAngle1);
        const finalHandY = baseY + len1 * Math.sin(finalAngle0) + len2 * Math.sin(finalAngle0 + finalAngle1);

        return {
            angles: [finalAngle0, finalAngle1],
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
    hexToRgba: (hex, alpha = 1) => {
        if (!hex || typeof hex !== 'string' || !hex.startsWith("#")) return hex;
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r},${g},${b},${AnimatorUtils.clamp(alpha, 0, 1)})`;
    },

    // --- DEFAULT SHAPE RENDERERS ---
    _defaultShapeRenderers: {
        rect: (ctx, shapeDef, style, w, h, computedParams) => {
            ctx.fillStyle = style.fill || 'magenta';
            if (shapeDef.pattern && style.baseScale) { // Example procedural pattern
                const p = shapeDef.pattern;
                if (p.type === 'stripes') {
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    const stripeWidth = (p.widthFactor || 0.05) * style.baseScale;
                    tempCanvas.width = stripeWidth * 2; tempCanvas.height = stripeWidth * 2;
                    tempCtx.fillStyle = p.color1 || style.fill; tempCtx.fillRect(0,0,stripeWidth*2,stripeWidth*2);
                    tempCtx.fillStyle = p.color2 || 'white';
                    tempCtx.translate(stripeWidth, stripeWidth); tempCtx.rotate(AnimatorUtils.degToRad(p.angle || 45));
                    tempCtx.fillRect(-stripeWidth*2, -stripeWidth/2, stripeWidth*4, stripeWidth);
                    ctx.fillStyle = ctx.createPattern(tempCanvas, 'repeat') || style.fill;
                }
            }
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
                mouthDef.path.forEach(p => {
                    switch (p.cmd) {
                        case 'M': ctx.moveTo(cx + p.x * mouthDrawWidth, cy + p.y * mouthDrawHeight); break;
                        case 'L': ctx.lineTo(cx + p.x * mouthDrawWidth, cy + p.y * mouthDrawHeight); break;
                        case 'Q': ctx.quadraticCurveTo(cx + p.x1 * mouthDrawWidth, cy + p.y1 * mouthDrawHeight, cx + p.x * mouthDrawWidth, cy + p.y * mouthDrawHeight); break;
                        case 'C': ctx.bezierCurveTo(cx + p.x1 * mouthDrawWidth, cy + p.y1*mouthDrawHeight, cx + p.x2*mouthDrawWidth, cy+p.y2*mouthDrawHeight, cx+p.x*mouthDrawWidth, cy+p.y*mouthDrawHeight); break;
                    }
                });
            }
            if (mouthDef.openFactor > 0.05 && style.color) { // only fill if it has a color (not just outline)
                ctx.fillStyle = computedParams.fillColor || AnimatorUtils.adjustColor(style.color, -15); // Allow override
                ctx.fill();
            }
            ctx.stroke();
        },
        eyebrow: (ctx, shapeDef, style, w, h, computedParams) => {
            const eyebrowKey = computedParams.shapeKey || shapeDef.initialShape || 'neutral';
            const AD = window.AnimatorData || {};
            const eyebrowDef = AD.EYEBROW_SHAPES[eyebrowKey] || AD.EYEBROW_SHAPES['neutral'] || {path: [{cmd:'M',x:-0.5,y:0},{cmd:'L',x:0.5,y:0}], thicknessFactor: 0.1};
            
            ctx.strokeStyle = style.color || 'black'; // Eyebrow color often matches hair or is darker
            ctx.lineWidth = Math.max(1, (eyebrowDef.thicknessFactor || 0.1) * h); // Thickness relative to part height
            
            const cx = w / 2; const cy = h / 2; // Eyebrow part is small, pivot often center
            
            ctx.beginPath();
            if (eyebrowDef.path) {
                eyebrowDef.path.forEach(p => {
                    switch (p.cmd) {
                        case 'M': ctx.moveTo(cx + p.x * w, cy + p.y * h); break;
                        case 'L': ctx.lineTo(cx + p.x * w, cy + p.y * h); break;
                        case 'Q': ctx.quadraticCurveTo(cx + p.x1 * w, cy + p.y1 * h, cx + p.x * w, cy + p.y * h); break;
                         case 'C': ctx.bezierCurveTo(cx + p.x1*w, cy + p.y1*h, cx + p.x2*w, cy+p.y2*h, cx+p.x*w, cy+p.y*h); break;
                    }
                });
            }
            ctx.stroke();
        },
        polygon: (ctx, shapeDef, style, w, h, computedParams) => {
            if (!shapeDef.points || shapeDef.points.length < 3) return;
            ctx.fillStyle = style.fill || 'magenta';
            ctx.beginPath();
            // Points are assumed to be {x,y} factors of w,h relative to 0,0 of bounding box
            ctx.moveTo(shapeDef.points[0].x * w, shapeDef.points[0].y * h);
            for (let i = 1; i < shapeDef.points.length; i++) {
                ctx.lineTo(shapeDef.points[i].x * w, shapeDef.points[i].y * h);
            }
            ctx.closePath();
            ctx.fill();
            if (style.stroke && (style.lineWidth || shapeDef.lineWidth || 1) > 0) {
                ctx.strokeStyle = style.stroke;
                ctx.lineWidth = style.lineWidth || shapeDef.lineWidth || 1;
                ctx.stroke();
            }
        },
        path: (ctx, shapeDef, style, w, h, computedParams) => { // For stroke-only paths
            if (!shapeDef.pathData) return; // pathData is array of commands like mouth
            ctx.strokeStyle = style.stroke || 'black';
            ctx.lineWidth = style.lineWidth || shapeDef.lineWidth || 1;
            const pathDrawWidth = w * (shapeDef.widthFactor || 1);
            const pathDrawHeight = h * (shapeDef.heightFactor || 1);
            const cx = w / 2; const cy = h / 2;

            ctx.beginPath();
            shapeDef.pathData.forEach(p => {
                switch (p.cmd) {
                    case 'M': ctx.moveTo(cx + p.x * pathDrawWidth, cy + p.y * pathDrawHeight); break;
                    case 'L': ctx.lineTo(cx + p.x * pathDrawWidth, cy + p.y * pathDrawHeight); break;
                    case 'Q': ctx.quadraticCurveTo(cx + p.x1 * pathDrawWidth, cy + p.y1 * pathDrawHeight, cx + p.x * pathDrawWidth, cy + p.y * pathDrawHeight); break;
                    case 'C': ctx.bezierCurveTo(cx + p.x1*pathDrawWidth, cy+p.y1*pathDrawHeight, cx+p.x2*pathDrawWidth, cy+p.y2*pathDrawHeight, cx+p.x*pathDrawWidth, cy+p.y*pathDrawHeight); break;
                }
            });
            ctx.stroke();
        },
        tzitzit_strand: (ctx, shapeDef, style, w, h, computedParams) => { // Copied and verified
            ctx.strokeStyle = style.color || 'white';
            ctx.lineWidth = Math.max(1, (shapeDef.lineWidthFactor || 0.007) * style.baseScale);
            const numStrings = shapeDef.numStrings || 2;
            const stringWidth = ctx.lineWidth;
            const totalStringMaterialWidth = numStrings * stringWidth;
            const totalGapWidth = Math.max(0, w - totalStringMaterialWidth);
            const gapCount = Math.max(1, numStrings -1);
            const gapSize = (numStrings > 1) ? totalGapWidth / gapCount : 0;

            for(let i = 0; i < numStrings; ++i) {
                ctx.beginPath();
                const sx = (i - (numStrings - 1) / 2) * (stringWidth + gapSize) ;
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx, h);
                ctx.stroke();
            }
        }
    },

    // --- DEFAULT BEHAVIOR HANDLERS ---
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
            // Only apply if not overridden by a lookAt behavior
            if (!charState.behaviorStates.lookAtController?.isActive) {
                cfg.targetPartIds.forEach(id => {
                    if (charState.parts[id]) {
                        charState.parts[id].computedParams.pupilShiftX = state.currentPupilShiftX;
                        charState.parts[id].computedParams.pupilShiftY = state.currentPupilShiftY;
                    }
                });
            }
        },
        lipSync: (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const cfg = behaviorInstance.config;
            const mouthPartId = cfg.targetPartIds && cfg.targetPartIds[0] ? cfg.targetPartIds[0] : 'mouth';
            const mouthState = charState.parts[mouthPartId];

            if (!mouthState || !mouthState.computedParams) {
                if (charState.behaviorStates.lipSync) delete charState.behaviorStates.lipSync;
                return;
            }
            
            if (!charState.isSpeakingTTS) {
                if (charState.behaviorStates.lipSync) {
                    // Revert to expression-defined shapeKey when speech stops
                    const currentExpression = window.AnimatorData.EXPRESSIONS[charState.activeExpressionName] || {};
                    const mouthExpr = currentExpression[mouthPartId] || {};
                    mouthState.computedParams.shapeKey = mouthExpr.shapeKey || 'neutral';
                    delete charState.behaviorStates.lipSync;
                }
                return;
            }

            let state = charState.behaviorStates.lipSync;
            if (!state) {
                state = charState.behaviorStates.lipSync = {
                    lastShapeChangeTime: 0,
                    nextShapeChangeDelay: 0,
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
                    } while (mouthShapesAvailable.length > 2 && randomShape === state.currentShapeKey && attempts < 10);
                }
                
                state.currentShapeKey = randomShape;
                state.lastShapeChangeTime = currentTime;
                state.nextShapeChangeDelay = AnimatorUtils.randomRange(cfg.minChangeInterval || 0.08, cfg.maxChangeInterval || 0.20);
                
                // Subtle head nod/tilt during speech
                if (charState.parts.head && cfg.affectHeadMovement) {
                    charState.parts.head.proceduralRotation = (charState.parts.head.proceduralRotation||0) + AnimatorUtils.randomRange(-0.5, 0.5);
                    charState.parts.head.proceduralOffsetY = (charState.parts.head.proceduralOffsetY||0) + AnimatorUtils.randomRange(-0.0005 * baseScale, 0.0005 * baseScale);
                }
            }
            mouthState.computedParams.shapeKey = state.currentShapeKey;
        },
        simpleSpringPhysics: (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const part = charState.parts[behaviorInstance.partId];
            if (!part) return;
            const cfg = behaviorInstance.config;
            let state = part.behaviorStates.simpleSpringPhysics;
            if (!state) {
                state = part.behaviorStates.simpleSpringPhysics = { angleRad: 0, velRad: 0 };
            }

            let parentCharRelAngleRad = 0;
            if (part.effectiveDefinition.parentId && charState.parts[part.effectiveDefinition.parentId]?.charRelativeWorldMatrix) {
                 parentCharRelAngleRad = AnimatorUtils.getRotationFromMatrix(charState.parts[part.effectiveDefinition.parentId].charRelativeWorldMatrix);
            }
            
            const stiffness = cfg.stiffness || 0.2;
            const damping = cfg.damping || 0.85;
            const gravityStrength = cfg.gravityFactor || 1.5;
            const angleLimitRad = AnimatorUtils.degToRad(cfg.angleLimit || 40);
            const gravityEquilibriumAngle = -parentCharRelAngleRad; // Simplified: assumes gravity pulls along world -Y
            
            const springForce = -stiffness * state.angleRad;
            const gravityForce = gravityStrength * Math.sin(gravityEquilibriumAngle - state.angleRad);
            const dampingForce = -damping * state.velRad;

            const accel = springForce + gravityForce + dampingForce;
            state.velRad += accel * deltaTime;
            let newAngleRad = state.angleRad + state.velRad * deltaTime;

            if (Math.abs(newAngleRad) > angleLimitRad) {
                newAngleRad = AnimatorUtils.clamp(newAngleRad, -angleLimitRad, angleLimitRad);
                state.velRad *= -0.3; // Energy loss
            }
            state.angleRad = newAngleRad;
            part.proceduralRotation = AnimatorUtils.radToDeg(state.angleRad);
        },
        // --- NEW BEHAVIORS ---
        eyebrowFidget: (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const cfg = behaviorInstance.config; // targetPartIds: ['eyebrowL', 'eyebrowR'], interval, duration, yRangeFactor, rotRange
            let state = charState.behaviorStates.eyebrowFidget;
            if (!state) {
                state = charState.behaviorStates.eyebrowFidget = {
                    lastTime: currentTime, nextDelay: AnimatorUtils.randomRange(cfg.intervalMin || 2, cfg.intervalMax || 5),
                    isFidgeting: false, progress: 0,
                    startYOffset: {}, targetYOffset: {}, currentYOffset: {},
                    startRot: {}, targetRot: {}, currentRot: {}
                };
                cfg.targetPartIds.forEach(id => {
                    state.startYOffset[id] = 0; state.targetYOffset[id] = 0; state.currentYOffset[id] = 0;
                    state.startRot[id] = 0; state.targetRot[id] = 0; state.currentRot[id] = 0;
                });
            }

            if (state.isFidgeting) {
                state.progress += deltaTime / (cfg.duration || 0.2);
                const t = AnimatorUtils.smoothStep(state.progress);
                cfg.targetPartIds.forEach(id => {
                    state.currentYOffset[id] = AnimatorUtils.lerp(state.startYOffset[id], state.targetYOffset[id], t);
                    state.currentRot[id] = AnimatorUtils.lerp(state.startRot[id], state.targetRot[id], t);
                });
                if (state.progress >= 1) {
                    state.isFidgeting = false; state.progress = 0; state.lastTime = currentTime;
                    state.nextDelay = AnimatorUtils.randomRange(cfg.intervalMin || 2, cfg.intervalMax || 5);
                    cfg.targetPartIds.forEach(id => { state.currentYOffset[id] = state.targetYOffset[id]; state.currentRot[id] = state.targetRot[id];});
                }
            } else if (currentTime > state.lastTime + state.nextDelay && charState.activeExpressionName === 'neutral') { // Only fidget if neutral expression for now
                state.isFidgeting = true; state.progress = 0;
                cfg.targetPartIds.forEach(id => {
                    state.startYOffset[id] = state.currentYOffset[id]; state.startRot[id] = state.currentRot[id];
                    const yRange = (cfg.yRangeFactor || 0.005) * baseScale;
                    const rotRange = cfg.rotRangeDeg || 5;
                    state.targetYOffset[id] = AnimatorUtils.randomRange(-yRange, yRange);
                    state.targetRot[id] = AnimatorUtils.randomRange(-rotRange, rotRange);
                });
            }
             // Apply to computedParams, which expression evaluation will then combine with expression values
            cfg.targetPartIds.forEach(id => {
                if (charState.parts[id] && charState.parts[id].computedParams) {
                     charState.parts[id].computedParams.proceduralYOffset = state.currentYOffset[id];
                     charState.parts[id].computedParams.proceduralRotation = state.currentRot[id];
                }
            });
        },
        pathFollower: (entityState, behaviorInstance, deltaTime, currentTime, baseScale, animatorInstance) => {
            // This behavior will be managed by an event. The event creates/updates 'pathFollowState' on the entity.
            // entityState can be charState or objState
            const pathFollowState = entityState.pathFollowState;
            if (!pathFollowState || !pathFollowState.isActive) return;

            const pathData = animatorInstance.DATA.SCENE_DATA.paths[pathFollowState.pathId];
            if (!pathData || !pathData.points || pathData.points.length === 0) {
                pathFollowState.isActive = false; return;
            }
            
            pathFollowState.progress += deltaTime / pathFollowState.duration;
            let t = pathFollowState.progress;
            let pathCompletedThisFrame = false;

            if (t >= 1.0) {
                if (pathFollowState.loop) {
                    t = t % 1.0;
                    pathFollowState.progress = t; // reset progress for next loop iteration
                } else {
                    t = 1.0;
                    pathFollowState.isActive = false; // Mark as inactive, event processor will finalize
                    pathCompletedThisFrame = true;
                }
            }
            
            const pointOnPath = AnimatorUtils.getPointOnLinearPath(pathData.points, t);
            entityState.x = pointOnPath.x;
            entityState.y = pointOnPath.y;
            if (pathFollowState.orientToPath) {
                entityState.rotation = AnimatorUtils.radToDeg(pointOnPath.angle);
                if (entityState.templateId && entityState.parts) { // If character, adjust facing based on angle
                    const angleDeg = entityState.rotation % 360;
                    if (angleDeg > -90 && angleDeg < 90) entityState.facingDirection = 'right';
                    else entityState.facingDirection = 'left';
                }
            }
            
            if(pathCompletedThisFrame && entityState.id.startsWith("char_")) { // If it's a character
                const charState = entityState; // Cast for clarity
                 // Set walkDuration to 0 to stop movement updates by _updateCharacterMovementAndTransitions
                charState.walkDuration = 0; 
                charState.targetX = charState.x; // Sync targetX/Y
                charState.targetY = charState.y;
            }
        },
        // Add more behaviors like moodManager, lookAtController, gaitChanger, objectJiggle, zoneMonitor here...
    }
};