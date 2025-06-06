//B"H
// Animator.SceneDrawing.js (v1.3 - Compound Object Drawing, Screen Effects)

window.AnimatorSceneDrawing = {
    speechBubbleConfig: { 
        bgColor: "rgba(255, 255, 255, 0.9)", borderColor: "#666", textColor: "#333", 
        fontFamily: "Arial, sans-serif", fontSizeScreen: 14, lineHeightFactor: 1.2, 
        paddingScreen: 10, cornerRadiusScreen: 8, pointerHeightScreen: 10, pointerWidthScreen: 15, 
        marginScreen: { top: 12, bottom: 12, side: 10 }, 
        maxWidthScreenFactor: 0.35, minWidthScreen: 60, 
        shadow: { color: "rgba(0,0,0,0.15)", blur: 4, offsetX: 2, offsetY: 2 } 
    },
    thoughtBubbleConfig: { // NEW
        bgColor: "rgba(230, 240, 255, 0.85)", borderColor: "#557799", textColor: "#224466",
        fontFamily: "Comic Sans MS, cursive, sans-serif", fontSizeScreen: 13, lineHeightFactor: 1.2,
        paddingScreen: 12, cornerRadiusScreen: 15, pointerHeightScreen: 8, pointerWidthScreen: 12, // Small circles for pointer
        numCircles: 3, circleRadiusFactor: 0.015, // relative to canvas height
        marginScreen: { top: 15, bottom: 15, side: 10 },
        maxWidthScreenFactor: 0.30, minWidthScreen: 50,
        shadow: { color: "rgba(0,0,0,0.1)", blur: 3, offsetX: 1, offsetY: 1 }
    },

    drawScene: function(animatorInstance) {
        const ctx = animatorInstance.ctx;
        const canvas = animatorInstance.canvas;
        const DATA = animatorInstance.DATA;

        ctx.fillStyle = animatorInstance.animationData?.scene?.backgroundColor || canvas.style.backgroundColor || "#F0F8FF";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        if(!animatorInstance.animationData) return;

        // Apply global screen effects if any
        if (animatorInstance.activeScreenEffect) {
            const effect = animatorInstance.activeScreenEffect;
            let filterString = "";
            switch(effect.type) {
                case 'grayscale': filterString = `grayscale(${effect.intensity || 1})`; break;
                case 'sepia': filterString = `sepia(${effect.intensity || 1})`; break;
                case 'blur': filterString = `blur(${(effect.intensity || 2)}px)`; break;
                case 'brightness': filterString = `brightness(${effect.intensity || 0.5})`; break;
                case 'contrast': filterString = `contrast(${effect.intensity || 1.5})`; break;
                case 'vignette': // Vignette is harder with just filter, usually drawn with gradient overlay
                    break; 
            }
            ctx.filter = filterString;
        } else {
            ctx.filter = 'none';
        }


        let entitiesToDraw = [];
        Object.values(animatorInstance.charactersState).filter(c => c.visible).forEach(c => {
            entitiesToDraw.push({type:'character', entity:c, sortY:c.y, layerName:c.layer});
        });
        Object.values(animatorInstance.objectsState).filter(o => o.visible).forEach(o => {
            entitiesToDraw.push({type:'object', entity:o, sortY:o.y, layerName:o.layer});
        });

        animatorInstance.sceneLayers.forEach(layerCfg => {
            const layerEnts = entitiesToDraw.filter(it=>it.layerName===layerCfg.name).sort((a,b)=>a.sortY-b.sortY);
            ctx.save();
            const cam = animatorInstance.cameraState;
            const parallaxFactor = layerCfg.parallaxFactor ?? 1.0;
            
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.scale(cam.zoom, cam.zoom);
            ctx.translate(-cam.worldX * parallaxFactor, -cam.worldY * parallaxFactor);
            
            layerEnts.forEach(item => {
                if (item.type === 'character') this._drawCharacter(ctx, item.entity, DATA, animatorInstance.UTILS);
                else if (item.type === 'object') this._drawObject(ctx, item.entity, DATA, animatorInstance.UTILS, true); // Pass true for root object
            });
            ctx.restore();
        });
        
        // Reset filter for screen-space UI
        ctx.filter = 'none';

        // Draw Vignette if active (manual overlay)
        if (animatorInstance.activeScreenEffect && animatorInstance.activeScreenEffect.type === 'vignette') {
            this._drawVignette(ctx, canvas, animatorInstance.activeScreenEffect.intensity || 0.5);
        }

        ctx.save();
        Object.values(animatorInstance.charactersState).forEach(c => {
            if(c.dialogueText && c.visible) {
                 this._drawSpeechBubbleScreenSpace(ctx, c, this.speechBubbleConfig, canvas, animatorInstance.cameraState, animatorInstance.UTILS, DATA);
            }
            if(c.thoughtText && c.visible) { // NEW for thought bubbles
                 this._drawThoughtBubbleScreenSpace(ctx, c, this.thoughtBubbleConfig, canvas, animatorInstance.cameraState, animatorInstance.UTILS, DATA);
            }
        });
        ctx.restore();
    },

    _drawCharacter: function(ctx, charState, DATA, UTILS) {
        const template = DATA.CHARACTER_TEMPLATES[charState.templateId];
        if (!template || !charState.visible) return;
        
        ctx.save(); 
        ctx.translate(charState.x, charState.y); 
        ctx.scale(charState.size, charState.size); 
        ctx.rotate(UTILS.degToRad(charState.rotation));

        const partsToDraw = Object.values(charState.parts)
            .filter(pState => pState.visible && pState.effectiveDefinition?.shape && pState.currentDimensions?.w > 0 && pState.charRelativeWorldMatrix)
            .sort((a,b)=>(a.effectiveDefinition.zIndex||0)-(b.effectiveDefinition.zIndex||0));
        
        partsToDraw.forEach(pState => {
            ctx.save();
            const mPart = pState.charRelativeWorldMatrix;
            ctx.transform(mPart.a, mPart.b, mPart.c, mPart.d, mPart.tx, mPart.ty);
            
            const shapeDef = pState.effectiveDefinition.shape;
            const renderer = DATA.SHAPE_RENDERERS[shapeDef.type] || UTILS._defaultShapeRenderers[shapeDef.type];
            if(renderer){
                const style = {
                    fill: charState.resolvedPalette[shapeDef.fill] || shapeDef.fill,
                    stroke: charState.resolvedPalette[shapeDef.stroke] || charState.resolvedPalette[template.palette.outlineColor] || template.palette.outlineColor || 'transparent',
                    lineWidth: (pState.effectiveDefinition.lineWidthFactor || 0.007) * template.baseHeight * charState.size, // Multiply by char size too for screen consistency
                    color: charState.resolvedPalette[shapeDef.color] || shapeDef.color, 
                    pupilFill: charState.resolvedPalette[shapeDef.pupilFill] || shapeDef.pupilFill,
                    baseScale: template.baseHeight // Used by some renderers for relative sizing (e.g. pupil)
                };
                renderer(ctx, shapeDef, style, pState.currentDimensions.w, pState.currentDimensions.h, pState.computedParams);
            }
            ctx.restore();
        });
        ctx.restore();
    },

    _drawObject: function(ctx, objState, DATA, UTILS, isRootObject = false) {
        if (!objState.visible || !objState.definition?.shape) return;
        
        ctx.save();
        
        // If it's a root object, its worldMatrix is absolute (already includes camera in SceneDrawing main loop)
        // If it's a child object, its worldMatrix is relative to its parent.
        // The ObjectPipeline calculates worldMatrix for root, and localMatrix for children.
        // The SceneDrawing _drawObject is called with root. Parent matrix is already on CTM.
        // For children, we need to multiply current CTM by child's localMatrix.
        
        const mObj = isRootObject ? objState.worldMatrix : objState.localMatrix;
        if(!mObj) { // Safety check if matrix calculation failed
             console.warn(`Object ${objState.id} has no matrix. Skipping draw.`);
             ctx.restore(); return;
        }
        ctx.transform(mObj.a, mObj.b, mObj.c, mObj.d, mObj.tx, mObj.ty);
        
        const shapeDef = objState.definition.shape;
        const renderer = DATA.SHAPE_RENDERERS[shapeDef.type] || UTILS._defaultShapeRenderers[shapeDef.type];
        
        if (renderer && objState.currentDimensions.w > 0 && objState.currentDimensions.h > 0) {
            const style = {
                fill: objState.resolvedPalette?.[shapeDef.fill] || shapeDef.fill || 'gray',
                stroke: objState.resolvedPalette?.[shapeDef.stroke] || shapeDef.stroke || 'black',
                lineWidth: shapeDef.lineWidth || 2, 
                baseScale: 1 // Objects don't have a "baseHeight" like characters for sub-element scaling
            };
            renderer(ctx, shapeDef, style, objState.currentDimensions.w, objState.currentDimensions.h, {}); 
        }

        // Draw children recursively
        if (objState.childrenStates) {
            Object.values(objState.childrenStates).sort((a,b)=>(a.definition.zIndex||0)-(b.definition.zIndex||0)).forEach(childState => {
                this._drawObject(ctx, childState, DATA, UTILS, false); // Children are not root
            });
        }

        ctx.restore();
    },
    
    _drawVignette: function(ctx, canvas, intensity = 0.5) {
        ctx.save();
        const outerRadius = Math.sqrt(canvas.width*canvas.width + canvas.height*canvas.height) / 2;
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, outerRadius * (1 - intensity * 0.8), // Inner circle starts further out based on intensity
            canvas.width / 2, canvas.height / 2, outerRadius
        );
        gradient.addColorStop(0, `rgba(0,0,0,0)`);
        gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    },

    _calculateSpeechBubbleScreenMetrics: function(ctx, dialogueText, cfg, canvas, anchorScreenX, anchorScreenY, UTILS) {
        // ... (largely same as before, ensure text wrapping respects canvas boundaries)
        const originalFont = ctx.font;
        ctx.font = `${cfg.fontSizeScreen}px ${cfg.fontFamily}`;
        
        const wrapText = (text, maxWidth) => {
            const words = text.split(' '); const lines = []; if (!words.length || words[0] === '') return [];
            let currentLine = words[0];
            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                if (ctx.measureText(currentLine + " " + word).width < maxWidth && currentLine.length + word.length < 100) { // Added char limit per line
                    currentLine += " " + word;
                } else { lines.push(currentLine); currentLine = word; }
            }
            lines.push(currentLine); return lines;
        };

        const lines = wrapText(dialogueText, Math.min(canvas.width * cfg.maxWidthScreenFactor, canvas.width - 2 * cfg.marginScreen.side) - 2 * cfg.paddingScreen);
        ctx.font = originalFont; 
        if (!lines.length) return null;

        const lineHeight = cfg.fontSizeScreen * cfg.lineHeightFactor;
        const textBlockHeight = lines.length * lineHeight - (lineHeight - cfg.fontSizeScreen); // More accurate height
        const textBlockWidth = Math.max(...lines.map(line => { ctx.font = `${cfg.fontSizeScreen}px ${cfg.fontFamily}`; const m = ctx.measureText(line).width; ctx.font = originalFont; return m; }));
        
        const boxWidth = Math.max(cfg.minWidthScreen, textBlockWidth + 2 * cfg.paddingScreen);
        const boxHeight = textBlockHeight + 2 * cfg.paddingScreen;

        let pointerSide = 'bottom'; 
        let boxY = anchorScreenY - boxHeight - cfg.pointerHeightScreen - cfg.marginScreen.top;
        if (boxY < cfg.marginScreen.side) { 
            pointerSide = 'top'; 
            boxY = anchorScreenY + cfg.pointerHeightScreen + cfg.marginScreen.bottom;
        }

        let boxX = anchorScreenX - boxWidth / 2;
        if (boxX < cfg.marginScreen.side) boxX = cfg.marginScreen.side;
        if (boxX + boxWidth > canvas.width - cfg.marginScreen.side) {
            boxX = canvas.width - cfg.marginScreen.side - boxWidth;
        }

        const pointerBaseCenterX = UTILS.clamp(anchorScreenX, 
                                               boxX + cfg.pointerWidthScreen / 2 + cfg.cornerRadiusScreen, 
                                               boxX + boxWidth - cfg.pointerWidthScreen / 2 - cfg.cornerRadiusScreen);
        
        let pointerPoints = [];
        if (pointerSide === 'bottom') { 
            pointerPoints = [
                { x: pointerBaseCenterX - cfg.pointerWidthScreen / 2, y: boxY + boxHeight },
                { x: anchorScreenX, y: anchorScreenY - cfg.marginScreen.top *0.2}, // Pointer aims slightly above anchor for better look
                { x: pointerBaseCenterX + cfg.pointerWidthScreen / 2, y: boxY + boxHeight }
            ];
        } else { // Pointer from top of bubble
            pointerPoints = [
                { x: pointerBaseCenterX - cfg.pointerWidthScreen / 2, y: boxY },
                { x: anchorScreenX, y: anchorScreenY + cfg.marginScreen.bottom * 0.2 }, 
                { x: pointerBaseCenterX + cfg.pointerWidthScreen / 2, y: boxY }
            ];
        }
        
        return {
            lines, lineHeight,
            textX: boxX + cfg.paddingScreen,
            textY: boxY + cfg.paddingScreen + (cfg.fontSizeScreen * 0.1), // Slight nudge for better baseline
            boxX, boxY, boxWidth, boxHeight,
            radius: cfg.cornerRadiusScreen,
            pointerPoints 
        };
    },
    
    _drawSpeechBubbleScreenSpace: function(ctx, charState, cfg, canvas, cameraState, UTILS, DATA) {
        // ... (mostly same, uses _calculateSpeechBubbleScreenMetrics)
        const headPartState = charState.parts['head'];
        if (!headPartState?.visible || !charState.dialogueText || !headPartState.charRelativeWorldMatrix ||
            !headPartState.currentDimensions?.h || !headPartState.effectiveDefinition?.pivot) {
            return;
        }

        let headFullWorldMatrix = UTILS.matrixIdentity();
        headFullWorldMatrix = UTILS.matrixTranslate(headFullWorldMatrix, charState.x, charState.y);
        headFullWorldMatrix = UTILS.matrixScale(headFullWorldMatrix, charState.size, charState.size);
        headFullWorldMatrix = UTILS.matrixRotate(headFullWorldMatrix, UTILS.degToRad(charState.rotation));
        headFullWorldMatrix = UTILS.matrixMultiply(headFullWorldMatrix, headPartState.charRelativeWorldMatrix);
        
        // Anchor point slightly above the head's pivot
        const localAnchorY = -(headPartState.effectiveDefinition.pivot.y * headPartState.currentDimensions.h) * 1.1 - headPartState.currentDimensions.h * 0.1; 
        const headAnchorWorld = UTILS.transformPoint({ x: 0, y: localAnchorY }, headFullWorldMatrix);
        
        const worldToScreen = (worldX, worldY) => ({
            x: (worldX - cameraState.worldX) * cameraState.zoom + canvas.width / 2,
            y: (worldY - cameraState.worldY) * cameraState.zoom + canvas.height / 2
        });
        const anchorScreen = worldToScreen(headAnchorWorld.x, headAnchorWorld.y);
        
        const metrics = this._calculateSpeechBubbleScreenMetrics(ctx, charState.dialogueText, cfg, canvas, anchorScreen.x, anchorScreen.y, UTILS);
        if (!metrics) return;

        const { boxX, boxY, boxWidth, boxHeight, radius, pointerPoints, lines, textX, textY, lineHeight } = metrics;

        ctx.save();
        ctx.fillStyle = cfg.bgColor;
        ctx.strokeStyle = cfg.borderColor;
        ctx.lineWidth = 1.5;
        if (cfg.shadow) {
            ctx.shadowColor = cfg.shadow.color; ctx.shadowBlur = cfg.shadow.blur;
            ctx.shadowOffsetX = cfg.shadow.offsetX; ctx.shadowOffsetY = cfg.shadow.offsetY;
        }

        ctx.beginPath(); // Bubble body
        ctx.moveTo(boxX + radius, boxY);
        ctx.arcTo(boxX + boxWidth, boxY,   boxX + boxWidth, boxY + radius, radius); 
        ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight, radius); 
        ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius, radius); 
        ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius); 
        ctx.closePath();
        ctx.fill();
        
        if (pointerPoints && pointerPoints.length === 3) { // Pointer
            ctx.beginPath(); 
            ctx.moveTo(pointerPoints[0].x, pointerPoints[0].y);
            ctx.lineTo(pointerPoints[1].x, pointerPoints[1].y);
            ctx.lineTo(pointerPoints[2].x, pointerPoints[2].y);
            ctx.closePath(); // Close the pointer triangle
            ctx.fill(); 
        }
        
        ctx.shadowColor = "transparent"; 
        ctx.stroke(); // Stroke bubble body and pointer if closed

        ctx.fillStyle = cfg.textColor;
        ctx.font = `${cfg.fontSizeScreen}px ${cfg.fontFamily}`;
        ctx.textAlign = "left"; ctx.textBaseline = "top"; 
        lines.forEach((line, index) => ctx.fillText(line, textX, textY + index * lineHeight));
        ctx.restore();
    },

    // NEW: _drawThoughtBubbleScreenSpace
    _drawThoughtBubbleScreenSpace: function(ctx, charState, cfg, canvas, cameraState, UTILS, DATA) {
        const headPartState = charState.parts['head'];
         if (!headPartState?.visible || !charState.thoughtText || !headPartState.charRelativeWorldMatrix ||
            !headPartState.currentDimensions?.h || !headPartState.effectiveDefinition?.pivot) {
            return;
        }
        // Similar anchor calculation as speech bubble
        let headFullWorldMatrix = UTILS.matrixIdentity();
        headFullWorldMatrix = UTILS.matrixTranslate(headFullWorldMatrix, charState.x, charState.y);
        headFullWorldMatrix = UTILS.matrixScale(headFullWorldMatrix, charState.size, charState.size);
        headFullWorldMatrix = UTILS.matrixRotate(headFullWorldMatrix, UTILS.degToRad(charState.rotation));
        headFullWorldMatrix = UTILS.matrixMultiply(headFullWorldMatrix, headPartState.charRelativeWorldMatrix);
        
        const localAnchorY = -(headPartState.effectiveDefinition.pivot.y * headPartState.currentDimensions.h) * 1.1 - headPartState.currentDimensions.h * 0.2; 
        const headAnchorWorld = UTILS.transformPoint({ x: headPartState.currentDimensions.w * 0.3, y: localAnchorY }, headFullWorldMatrix); // Offset X for thought
        
        const worldToScreen = (worldX, worldY) => ({
            x: (worldX - cameraState.worldX) * cameraState.zoom + canvas.width / 2,
            y: (worldY - cameraState.worldY) * cameraState.zoom + canvas.height / 2
        });
        const anchorScreen = worldToScreen(headAnchorWorld.x, headAnchorWorld.y);

        // Reuse _calculateSpeechBubbleScreenMetrics for text layout, but cfg is different
        const metrics = this._calculateSpeechBubbleScreenMetrics(ctx, charState.thoughtText, cfg, canvas, anchorScreen.x, anchorScreen.y, UTILS);
        if (!metrics) return;

        const { boxX, boxY, boxWidth, boxHeight, radius, lines, textX, textY, lineHeight } = metrics;

        ctx.save();
        ctx.fillStyle = cfg.bgColor;
        ctx.strokeStyle = cfg.borderColor;
        ctx.lineWidth = 1.5;
        if (cfg.shadow) {
            ctx.shadowColor = cfg.shadow.color; ctx.shadowBlur = cfg.shadow.blur;
            ctx.shadowOffsetX = cfg.shadow.offsetX; ctx.shadowOffsetY = cfg.shadow.offsetY;
        }
        
        // Cloud-like shape for thought bubble (simplified)
        const R = radius; const R2 = radius * 0.7;
        ctx.beginPath();
        ctx.moveTo(boxX + R, boxY);
        ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + R, R);                 // Top-right corner
        ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - R, boxY + boxHeight, R); // Bottom-right corner
        ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - R, R);               // Bottom-left corner
        ctx.arcTo(boxX, boxY, boxX + R, boxY, R);                                     // Top-left corner
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Pointer circles for thought bubble
        let circleAnchorX = UTILS.clamp(anchorScreen.x, boxX + R, boxX + boxWidth - R);
        let circleAnchorY = (metrics.pointerPoints[0].y > boxY + boxHeight/2) ? (boxY + boxHeight - R*0.5) : (boxY + R*0.5); // Bottom or top edge of box
        
        const circleRBase = canvas.height * cfg.circleRadiusFactor;
        for (let i = 0; i < cfg.numCircles; i++) {
            const t = (i + 0.5) / cfg.numCircles;
            const currentCircleR = circleRBase * (1 - t * 0.5);
            const cx = UTILS.lerp(circleAnchorX, anchorScreen.x, t*t); // Circles move towards actual anchor, faster at end
            const cy = UTILS.lerp(circleAnchorY, anchorScreen.y, t*t);
            ctx.beginPath();
            ctx.arc(cx, cy, currentCircleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        ctx.shadowColor = "transparent"; 

        ctx.fillStyle = cfg.textColor;
        ctx.font = `${cfg.fontSizeScreen}px ${cfg.fontFamily}`;
        ctx.textAlign = "left"; ctx.textBaseline = "top"; 
        lines.forEach((line, index) => ctx.fillText(line, textX, textY + index * lineHeight));
        ctx.restore();
    }
};
