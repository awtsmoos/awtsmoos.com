//B"H
//B"H
// Animator.SceneDrawing.js (v1.2 - Corrected Matrix Application)
// B"H - Helper functions for drawing the scene elements

window.AnimatorSceneDrawing = {
    // Default speech bubble configuration
    speechBubbleConfig: { 
        bgColor: "rgba(255, 255, 255, 0.9)", 
        borderColor: "#666", 
        textColor: "#333", 
        fontFamily: "Arial, sans-serif", 
        fontSizeScreen: 14, 
        lineHeightFactor: 1.2, 
        paddingScreen: 10, 
        cornerRadiusScreen: 8, 
        pointerHeightScreen: 10, 
        pointerWidthScreen: 15, 
        marginScreen: { top: 12, bottom: 12, side: 10 }, // Increased top/bottom margin
        maxWidthScreenFactor: 0.35, 
        minWidthScreen: 60, 
        shadow: { color: "rgba(0,0,0,0.15)", blur: 4, offsetX: 2, offsetY: 2 } 
    },

    drawScene: function(animatorInstance) {
        const ctx = animatorInstance.ctx;
        const canvas = animatorInstance.canvas;
        const DATA = animatorInstance.DATA; // Local shorthand

        ctx.fillStyle = animatorInstance.animationData?.scene?.backgroundColor || canvas.style.backgroundColor || "#F0F8FF";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        if(!animatorInstance.animationData) return;

        let entitiesToDraw = [];
        Object.values(animatorInstance.charactersState).filter(c => c.visible).forEach(c => {
            entitiesToDraw.push({type:'character', entity:c, sortY:c.y, layerName:c.layer});
        });
        Object.values(animatorInstance.objectsState).filter(o => o.visible).forEach(o => {
            entitiesToDraw.push({type:'object', entity:o, sortY:o.y, layerName:o.layer});
        });

        animatorInstance.sceneLayers.forEach(layerCfg => {
            const layerEnts = entitiesToDraw.filter(it=>it.layerName===layerCfg.name).sort((a,b)=>a.sortY-b.sortY);
            ctx.save(); // Save context state before applying camera transforms for this layer
            const cam = animatorInstance.cameraState;
            const parallaxFactor = layerCfg.parallaxFactor ?? 1.0;
            
            // Apply camera transformations
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.scale(cam.zoom, cam.zoom);
            ctx.translate(-cam.worldX * parallaxFactor, -cam.worldY * parallaxFactor);
            
            layerEnts.forEach(item => {
                if (item.type === 'character') this._drawCharacter(ctx, item.entity, DATA, animatorInstance.UTILS);
                else if (item.type === 'object') this._drawObject(ctx, item.entity, DATA, animatorInstance.UTILS);
            });
            ctx.restore(); // Restore context state after this layer (remove camera transforms)
        });

        ctx.save(); // For screen-space elements like speech bubbles
        Object.values(animatorInstance.charactersState).forEach(c => {
            if(c.dialogueText && c.visible) {
                 this._drawSpeechBubbleScreenSpace(
                    ctx, c, this.speechBubbleConfig, 
                    canvas, animatorInstance.cameraState, 
                    animatorInstance.UTILS, DATA
                );
            }
        });
        ctx.restore();
    },

    _drawCharacter: function(ctx, charState, DATA, UTILS) {
        const template = DATA.CHARACTER_TEMPLATES[charState.templateId];
        if (!template || !charState.visible) return;
        
        // This save/restore is for the character's main world transform (position, size, rotation)
        // These transforms are applied ON TOP of the existing camera transform.
        ctx.save(); 
        ctx.translate(charState.x, charState.y); 
        ctx.scale(charState.size, charState.size); 
        ctx.rotate(UTILS.degToRad(charState.rotation));

        const partsToDraw = Object.values(charState.parts)
            .filter(pState => pState.visible && pState.effectiveDefinition?.shape && pState.currentDimensions?.w > 0 && pState.charRelativeWorldMatrix)
            .sort((a,b)=>(a.effectiveDefinition.zIndex||0)-(b.effectiveDefinition.zIndex||0));
        
        partsToDraw.forEach(pState => {
            // This save/restore is for each part's individual transform,
            // relative to the character's already transformed state.
            ctx.save();
            
            // Apply the part's matrix (which is relative to the character's local origin)
            // This matrix is multiplied with the current CTM (which includes camera and character's main transform).
            const mPart = pState.charRelativeWorldMatrix;
            ctx.transform(mPart.a, mPart.b, mPart.c, mPart.d, mPart.tx, mPart.ty);
            
            const shapeDef = pState.effectiveDefinition.shape;
            const renderer = DATA.SHAPE_RENDERERS[shapeDef.type];
            if(renderer){
                const style = {
                    fill: charState.resolvedPalette[shapeDef.fill] || shapeDef.fill,
                    stroke: charState.resolvedPalette[shapeDef.stroke] || charState.resolvedPalette[template.palette.outlineColor] || template.palette.outlineColor || 'transparent',
                    lineWidth: (pState.effectiveDefinition.lineWidthFactor || 0.007) * template.baseHeight,
                    color: charState.resolvedPalette[shapeDef.color] || shapeDef.color, 
                    pupilFill: charState.resolvedPalette[shapeDef.pupilFill] || shapeDef.pupilFill,
                    baseScale: template.baseHeight
                };
                renderer(ctx, shapeDef, style, pState.currentDimensions.w, pState.currentDimensions.h, pState.computedParams);
            }
            ctx.restore(); // Restore to character's transformed state
        });
        ctx.restore(); // Restore to camera's transformed state
    },

    _drawObject: function(ctx, objState, DATA, UTILS) {
        if (!objState.visible || !objState.worldMatrix || !objState.definition?.shape) return;
        
        // This save/restore is for the object's world transform.
        // objState.worldMatrix is an absolute world transform for the object (from its local to world).
        // It's applied ON TOP of the existing camera transform.
        ctx.save();
        
        const mObj = objState.worldMatrix;
        ctx.transform(mObj.a, mObj.b, mObj.c, mObj.d, mObj.tx, mObj.ty);
        
        const shapeDef = objState.definition.shape;
        const renderer = DATA.SHAPE_RENDERERS[shapeDef.type];
        if (renderer && objState.currentDimensions.w > 0 && objState.currentDimensions.h > 0) {
            const style = {
                fill: objState.resolvedPalette[shapeDef.fill] || shapeDef.fill || 'gray',
                stroke: objState.resolvedPalette[shapeDef.stroke] || shapeDef.stroke || 'black',
                lineWidth: shapeDef.lineWidth || 2, 
                baseScale: 1 
            };
            renderer(ctx, shapeDef, style, objState.currentDimensions.w, objState.currentDimensions.h, {}); 
        }
        ctx.restore(); // Restore to camera's transformed state
    },

    _calculateSpeechBubbleScreenMetrics: function(ctx, dialogueText, cfg, canvas, anchorScreenX, anchorScreenY, UTILS) {
        const originalFont = ctx.font;
        ctx.font = `${cfg.fontSizeScreen}px ${cfg.fontFamily}`;
        
        const wrapText = (text, maxWidth) => {
            const words = text.split(' '); const lines = []; if (!words.length || words[0] === '') return [];
            let currentLine = words[0];
            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                if (ctx.measureText(currentLine + " " + word).width < maxWidth) {
                    currentLine += " " + word;
                } else { lines.push(currentLine); currentLine = word; }
            }
            lines.push(currentLine); return lines;
        };

        const lines = wrapText(dialogueText, canvas.width * cfg.maxWidthScreenFactor - 2 * cfg.paddingScreen);
        ctx.font = originalFont; 
        if (!lines.length) return null;

        const lineHeight = cfg.fontSizeScreen * cfg.lineHeightFactor;
        const textBlockHeight = lines.length * lineHeight - (lineHeight - cfg.fontSizeScreen); 
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
                { x: anchorScreenX, y: anchorScreenY - cfg.marginScreen.top - 2 }, 
                { x: pointerBaseCenterX + cfg.pointerWidthScreen / 2, y: boxY + boxHeight }
            ];
        } else { 
            pointerPoints = [
                { x: pointerBaseCenterX - cfg.pointerWidthScreen / 2, y: boxY },
                { x: anchorScreenX, y: anchorScreenY + cfg.marginScreen.bottom + 2 }, 
                { x: pointerBaseCenterX + cfg.pointerWidthScreen / 2, y: boxY }
            ];
        }
        
        return {
            lines, lineHeight,
            textX: boxX + cfg.paddingScreen,
            textY: boxY + cfg.paddingScreen + (cfg.fontSizeScreen * 0.1), 
            boxX, boxY, boxWidth, boxHeight,
            radius: cfg.cornerRadiusScreen,
            pointerPoints 
        };
    },
    
    _drawSpeechBubbleScreenSpace: function(ctx, charState, cfg, canvas, cameraState, UTILS, DATA) {
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
        
        const localAnchorY = -(headPartState.effectiveDefinition.pivot.y * headPartState.currentDimensions.h) * 0.95 - headPartState.currentDimensions.h * 0.1; 
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
            ctx.shadowColor = cfg.shadow.color;
            ctx.shadowBlur = cfg.shadow.blur;
            ctx.shadowOffsetX = cfg.shadow.offsetX;
            ctx.shadowOffsetY = cfg.shadow.offsetY;
        }

        ctx.beginPath();
        ctx.moveTo(boxX + radius, boxY);
        ctx.arcTo(boxX + boxWidth, boxY,   boxX + boxWidth, boxY + radius, radius); 
        ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight, radius); 
        ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius, radius); 
        ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius); 
        ctx.closePath();
        ctx.fill();
        
        if (pointerPoints && pointerPoints.length === 3) {
            ctx.beginPath(); 
            ctx.moveTo(pointerPoints[0].x, pointerPoints[0].y);
            ctx.lineTo(pointerPoints[1].x, pointerPoints[1].y);
            ctx.lineTo(pointerPoints[2].x, pointerPoints[2].y);
            ctx.fill(); 
        }
        
        ctx.shadowColor = "transparent"; 
        ctx.stroke(); 

        ctx.fillStyle = cfg.textColor;
        ctx.font = `${cfg.fontSizeScreen}px ${cfg.fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top"; 
        lines.forEach((line, index) => {
            ctx.fillText(line, textX, textY + index * lineHeight);
        });

        ctx.restore();
    }
};