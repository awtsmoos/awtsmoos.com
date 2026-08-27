//B"H
// B"H
// Expressive Character Animator - Phoenix Engine v1.3 - Data-Driven Refactor & Expansion

// --- UTILITY FUNCTIONS ---
const Utils = {
    lerp: (a, b, t) => a + (b - a) * t,
    smoothStep: (t) => t * t * (3 - 2 * t),
    degToRad: (deg) => deg * (Math.PI / 180),
    radToDeg: (rad) => rad * (180 / Math.PI),
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    randomRange: (min, max) => Math.random() * (max - min) + min,

    matrixIdentity: () => ({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }),
    matrixMultiply: (m1, m2) => ({
        a: m1.a * m2.a + m1.c * m2.b, b: m1.b * m2.a + m1.d * m2.b,
        c: m1.a * m2.c + m1.c * m2.d, d: m1.b * m2.c + m1.d * m2.d,
        tx: m1.a * m2.tx + m1.c * m2.ty + m1.tx, ty: m1.b * m2.tx + m1.d * m2.ty + m1.ty,
    }),
    matrixTranslate: (m, x, y) => Utils.matrixMultiply(m, { a: 1, b: 0, c: 0, d: 1, tx: x, ty: y }),
    matrixRotate: (m, angleRad) => {
        const cos = Math.cos(angleRad); const sin = Math.sin(angleRad);
        return Utils.matrixMultiply(m, { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 });
    },
    matrixScale: (m, sx, sy) => Utils.matrixMultiply(m, { a: sx, b: 0, c: 0, d: sy, tx: 0, ty: 0 }),
    applyMatrixToContext: (ctx, m) => ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty),
    transformPoint: (p, m) => ({ x: m.a * p.x + m.c * p.y + m.tx, y: m.b * p.x + m.d * p.y + m.ty }),
    getTranslationFromMatrix: (m) => ({ x: m.tx, y: m.ty }),
    getRotationFromMatrix: (m) => Math.atan2(m.b, m.a),

    solve2LinkIK: (startX, startY, targetX, targetY, len1, len2, preferClockwiseBend = false) => {
        const dx = targetX - startX; const dy = targetY - startY;
        let dist = Math.sqrt(dx * dx + dy * dy); const epsilon = 0.01;
        if (dist > len1 + len2 - epsilon) {
            const ratio = (len1 + len2 - epsilon) / (dist || 1);
            targetX = startX + dx * ratio; targetY = startY + dy * ratio; dist = len1 + len2 - epsilon;
        } else if (dist < Math.abs(len1 - len2) + epsilon) {
            const ratio = (Math.abs(len1 - len2) + epsilon) / (dist || 1);
            targetX = startX + dx * ratio; targetY = startY + dy * ratio; dist = Math.abs(len1 - len2) + epsilon;
        }
        const a = (len1 * len1 - len2 * len2 + dist * dist) / (2 * dist || 1);
        const h = Math.sqrt(Math.max(0, len1 * len1 - a * a));
        const midX = startX + a * (dx / (dist || 1)); const midY = startY + a * (dy / (dist || 1));
        const bendSign = preferClockwiseBend ? 1 : -1;
        return {
            elbow: { x: midX + bendSign * h * (dy / (dist || 1)), y: midY - bendSign * h * (dx / (dist || 1)) },
            hand: { x: targetX, y: targetY }
        };
    },
    adjustColor: (color, percent) => {
        if (!color || typeof color !== 'string' || !color.startsWith("#")) return color;
        try {
            let num = parseInt(color.replace("#", ""), 16);
            let amt = Math.round(2.55 * percent);
            let R = Utils.clamp(Math.round((num >> 16) + amt), 0, 255);
            let G = Utils.clamp(Math.round(((num >> 8) & 0x00FF) + amt), 0, 255);
            let B = Utils.clamp(Math.round((num & 0x0000FF) + amt), 0, 255);
            return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1).toUpperCase();
        } catch (e) { return color; }
    },
};

class Animator {
    constructor(canvasElement, uiElements) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.ui = uiElements;
        this.isPlaying = false; this.animationFrameId = null; this.lastTimestamp = 0; this.currentTime = 0;
        this.eventTimeline = []; this.currentEventGroupIndex = -1; this.activeEventGroup = null; this.activeEventGroupStatus = {};
        this.charactersState = {};
        this.objectsState = {}; // NEW: For interactable objects
        this.cameraState = {
            worldX: 0, worldY: 0, zoom: 1, targetWorldX: 0, targetWorldY: 0, targetZoom: 1,
            focusEntityIds: [], panSpeed: 0.08, zoomSpeed: 0.08,
            lerpThreshold: 0.01, zoomThreshold: 0.0001, minZoom: 0.05, maxZoom: 10.0,
            verticalFocusBias: 0.15,
        };
        this.sceneLayers = []; this.defaultLayerName = 'main';
        this.speechSynthesis = window.speechSynthesis; this.availableVoices = [];
        this.speechBubbleConfig = { // Moved from global for potential instance-specific config
            bgColor: "rgba(255, 255, 255, 0.9)", borderColor: "#666", textColor: "#333",
            fontFamily: "Arial, sans-serif", fontSizeScreen: 14, lineHeightFactor: 1.2,
            paddingScreen: 10, cornerRadiusScreen: 8, pointerHeightScreen: 10, pointerWidthScreen: 15,
            marginScreen: { top: 10, bottom: 10, side: 10 }, maxWidthScreenFactor: 0.3, minWidthScreen: 50,
            shadow: { color: "rgba(0,0,0,0.2)", blur: 5, offsetX: 2, offsetY: 2 }
        };

        this._initSpeechSynthesis();
        this._defineAllGlobalData();
        this._bindUIEvents();
        this._checkForEmbeddedData();
    }

    _initSpeechSynthesis() { /* Same as before */
        if (!this.speechSynthesis) {
            console.warn("Speech Synthesis not supported.");
            if (this.ui.statusDiv && !this.animationData) this.ui.statusDiv.textContent = "Speech Synthesis not supported.";
            return;
        }
        const loadVoices = () => {
            this.availableVoices = this.speechSynthesis.getVoices();
            console.log("Available TTS voices:", this.availableVoices.map(v => ({ name: v.name, lang: v.lang })));
            if (this.ui.statusDiv && !this.animationData) {
                this.ui.statusDiv.textContent = `TTS voices loaded (${this.availableVoices.length}). Load JSON.`;
            }
        };
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();
    }

    _defineAllGlobalData() {
        const GD = Animator.GlobalData;

        GD.CHARACTER_TEMPLATES['human_default'] = {
            baseHeight: 160,
            palette: {
                skinColor: '#FCD9B6', skinDarkerColor: '#E0AF8C', hairColor: '#4A3B31', hairDarkerColor: '#3A2F29',
                pupilColor: '#333333', eyeWhiteColor: '#FFFFFF', mouthColor: '#C23A4B',
                shirtColor: '#5DADE2', sleeveColor: '#5DADE2', pantsColor: '#34495E',
                shoeColor: '#4A3B31', tzitzitColor: '#F5F5F5', outlineColor: '#2C3E50', yarmulkeColor: '@hairDarkerColor' // Use palette reference
            },
            parts: [
                // ... (torso, head, eyes, mouth, arms, legs as before) ...
                { id: 'torso', parentId: null, anchorToParent: { x: 0.5, y: 0.5 }, pivot: { x: 0.5, y: 0.9 }, dimensions: { wFactor: 0.3, hFactor: 0.4 }, shape: { type: 'rect', fill: 'shirtColor' }, zIndex: 0 },
                { id: 'head', parentId: 'torso', anchorToParent: { x: 0.5, y: 0.05 }, pivot: { x: 0.5, y: 0.8 }, dimensions: { wFactor: 0.28, hFactor: 0.33 }, shape: { type: 'ellipse', fill: 'skinColor' }, zIndex: 5 },
                { id: 'yarmulke', parentId: 'head', anchorToParent: { x: 0.5, y: 0.08 }, pivot: { x: 0.5, y: 0.8 }, dimensions: { wFactor: 0.15, hFactor: 0.06 }, shape: { type: 'ellipse', fill: 'yarmulkeColor'}, zIndex: 5.1, genderConditional: 'male' }, // Sits slightly above head anchor, higher pivot for "on top" feel
                { id: 'eyeL', parentId: 'head', anchorToParent: { x: 0.3, y: 0.4 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.07, hFactor: 0.045 }, shape: { type: 'eye', fill: 'eyeWhiteColor', pupilFill: 'pupilColor', pupilSizeFactor: 0.025 }, zIndex: 6 },
                { id: 'eyeR', parentId: 'head', anchorToParent: { x: 0.7, y: 0.4 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.07, hFactor: 0.045 }, shape: { type: 'eye', fill: 'eyeWhiteColor', pupilFill: 'pupilColor', pupilSizeFactor: 0.025 }, zIndex: 6 },
                { id: 'mouth', parentId: 'head', anchorToParent: { x: 0.5, y: 0.75 }, pivot: { x: 0.5, y: 0.5 }, dimensions: { wFactor: 0.14, hFactor: 0.06 }, shape: { type: 'mouth', color: 'mouthColor', initialShape: 'neutral' }, zIndex: 6 },
                { id: 'armUpperL', parentId: 'torso', anchorToParent: { x: 0.1, y: 0.15 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.07, hFactor: 0.25 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: -1, ikChain: ['armUpperL', 'armLowerL', 'handL'] },
                { id: 'armLowerL', parentId: 'armUpperL', anchorToParent: { x: 0.5, y: 0.98 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.22 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: -1 },
                { id: 'handL', parentId: 'armLowerL', anchorToParent: { x: 0.5, y: 0.98 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.06 }, shape: { type: 'ellipse', fill: 'skinColor' }, zIndex: -1 },
                { id: 'armUpperR', parentId: 'torso', anchorToParent: { x: 0.9, y: 0.15 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.07, hFactor: 0.25 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: 1, ikChain: ['armUpperR', 'armLowerR', 'handR'] },
                { id: 'armLowerR', parentId: 'armUpperR', anchorToParent: { x: 0.5, y: 0.98 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.22 }, shape: { type: 'rect', fill: 'sleeveColor' }, zIndex: 1 },
                { id: 'handR', parentId: 'armLowerR', anchorToParent: { x: 0.5, y: 0.98 }, pivot: { x: 0.5, y: 0.1 }, dimensions: { wFactor: 0.06, hFactor: 0.06 }, shape: { type: 'ellipse', fill: 'skinColor' }, zIndex: 1 },
                { id: 'legUpperL', parentId: 'torso', anchorToParent: {x:0.3, y:0.98}, pivot: {x:0.5, y:0.1}, dimensions: {wFactor:0.09, hFactor:0.28}, shape: { type: 'rect', fill: 'pantsColor'}, zIndex: -2 },
                { id: 'legLowerL', parentId: 'legUpperL', anchorToParent: {x:0.5, y:0.98}, pivot: {x:0.5, y:0.1}, dimensions: {wFactor:0.08, hFactor:0.26}, shape: { type: 'rect', fill: 'pantsColor'}, zIndex: -2 },
                { id: 'footL', parentId: 'legLowerL', anchorToParent: {x:0.5, y:0.98}, pivot: {x:0.2, y:0.5}, dimensions: {wFactor:0.11, hFactor:0.05}, shape: { type: 'ellipse', fill: 'shoeColor'}, zIndex: -2 },
                { id: 'legUpperR', parentId: 'torso', anchorToParent: {x:0.7, y:0.98}, pivot: {x:0.5, y:0.1}, dimensions: {wFactor:0.09, hFactor:0.28}, shape: { type: 'rect', fill: 'pantsColor'}, zIndex: -1 },
                { id: 'legLowerR', parentId: 'legUpperR', anchorToParent: {x:0.5, y:0.98}, pivot: {x:0.5, y:0.1}, dimensions: {wFactor:0.08, hFactor:0.26}, shape: { type: 'rect', fill: 'pantsColor'}, zIndex: -1 },
                { id: 'footR', parentId: 'legLowerR', anchorToParent: {x:0.5, y:0.98}, pivot: {x:0.2, y:0.5}, dimensions: {wFactor:0.11, hFactor:0.05}, shape: { type: 'ellipse', fill: 'shoeColor'}, zIndex: -1 },
                { id: 'tzitzit_FL', parentId: 'torso', anchorToParent: {x:0.25, y:0.85}, pivot: {x:0.5, y:0}, dimensions:{wFactor:0.02, hFactor:0.2}, shape: { type: 'tzitzit_strand', numStrings:2, color: 'tzitzitColor'}, zIndex: 2, genderConditional: 'male', attachedBehaviors:[{type:'simpleSpringPhysics', stiffness:0.2, damping:0.85, gravityFactor:1.5, angleLimit:40}] }, // Adjusted physics params
                { id: 'tzitzit_FR', parentId: 'torso', anchorToParent: {x:0.75, y:0.85}, pivot: {x:0.5, y:0}, dimensions:{wFactor:0.02, hFactor:0.2}, shape: { type: 'tzitzit_strand', numStrings:2, color: 'tzitzitColor'}, zIndex: 2, genderConditional: 'male', attachedBehaviors:[{type:'simpleSpringPhysics', stiffness:0.2, damping:0.85, gravityFactor:1.5, angleLimit:40}] },
            ],
            facingOverrides: { /* Same as before, ensure yarmulke is not affected or handled if needed */
                 "profile_left": {
                    yarmulke: { anchorToParent: { x: 0.45, y:0.08 } }, // Adjust if head anchor changes
                    // ... other profile_left overrides
                    armUpperL: { visible: false }, armLowerL: { visible: false }, handL: { visible: false },
                    legUpperL: { visible: false }, legLowerL: { visible: false }, footL: { visible: false },
                    tzitzit_FL: {visible:false}, 
                    head: { anchorToParent: { x: 0.45 } }, eyeR: { anchorToParent: { x: 0.35 } }, eyeL: { visible: false }, mouth: { anchorToParent: {x:0.3 } },
                    armUpperR: { idAlias: 'armUpper_profile', zIndex: 1 }, armLowerR: { idAlias: 'armLower_profile', zIndex: 1 }, handR: { idAlias: 'hand_profile', zIndex: 1 },
                    legUpperR: { idAlias: 'legUpper_profile', zIndex: 0 }, legLowerR: {idAlias: 'legLower_profile', zIndex: 0}, footR: {idAlias: 'foot_profile', zIndex: 0},
                    tzitzit_FR: { anchorToParent: {x:0.5}, zIndex: 2},
                },
                "profile_right": {
                    yarmulke: { anchorToParent: { x: 0.55, y:0.08 } }, // Adjust if head anchor changes
                    // ... other profile_right overrides
                    armUpperR: { visible: false }, armLowerR: { visible: false }, handR: { visible: false },
                    legUpperR: { visible: false }, legLowerR: { visible: false }, footR: { visible: false },
                    tzitzit_FR: {visible:false},
                    head: { anchorToParent: { x: 0.55 } }, eyeL: { anchorToParent: { x: 0.65 } }, eyeR: { visible: false }, mouth: { anchorToParent: {x:0.7 } },
                    armUpperL: { idAlias: 'armUpper_profile', zIndex: 1 }, armLowerL: { idAlias: 'armLower_profile', zIndex: 1 }, handL: { idAlias: 'hand_profile', zIndex: 1 },
                    legUpperL: { idAlias: 'legUpper_profile', zIndex: 0 }, legLowerL: {idAlias: 'legLower_profile', zIndex: 0}, footL: {idAlias: 'foot_profile', zIndex: 0},
                    tzitzit_FL: { anchorToParent: {x:0.5}, zIndex: 2},
                },
                 "front": { 
                    yarmulke: { anchorToParent: { x: 0.5, y:0.08 } }, // Reset to default
                    // ... other front overrides
                    armUpperL: { idAlias: null }, armUpperR: { idAlias: null },
                    legUpperL: { idAlias: null }, legUpperR: { idAlias: null }
                }
            },
            defaultBehaviors: [ /* Same as before */
                { type: "blink", config: { intervalMin: 2200, intervalMax: 5500, duration: 0.16, targetPartIds: ['eyeL', 'eyeR'] } },
                { type: "eyeDart", config: { intervalMin: 2800, intervalMax: 6500, duration: 0.13, targetPartIds: ['eyeL', 'eyeR'], rangeFactor: 0.0025 } }
            ]
        };

        GD.POSES['idle_default'] = { /* Same as before */
            torso: { yFactor: (phase) => Math.sin(phase * 0.6) * 0.006, rootMotionYFactor: 0.008 },
            head: { rotation: (phase) => Math.sin(phase * 0.8) * 2.8 },
            armUpperL: { rotation: 8 }, armLowerL: { rotation: 4 },
            armUpperR: { rotation: -8 }, armLowerR: { rotation: -4 },
            armUpper_profile: { rotation: 4 }, armLower_profile: { rotation: 2 },
        };
        GD.POSES['thinking_chin_touch'] = { /* Same as before */
            head: { rotation: -9 },
            handR: { ikTarget: { partId: 'head', anchorFactor: { x: 0.65, y: 0.88 } }, preferBendClockwise: false },
            hand_profile: { ikTarget: { partId: 'head', anchorFactor: { x: 0.65, y: 0.88 } }, preferBendClockwise: false },
            armUpperL: { rotation: 12 }, armLowerL: { rotation: 8 }
        };
        GD.POSES['walk'] = { /* Same as before */
            rootMotionYFactor: (phase) => Math.abs(Math.sin(phase*0.5)) * -0.015,
            torso: { rotation: (phase) => Math.sin(phase) * 1.5 },
            head: { rotation: (phase) => Math.sin(phase) * 2.5 },
            armUpper_profile: { rotation: (phase) => 35 * Math.sin(phase) },
            armLower_profile: { rotation: (phase) => 20 * Math.sin(phase) + 10 },
            armUpperL: { rotation: (phase) => 40 * Math.sin(phase) },
            armLowerL: { rotation: (phase) => 25 * Math.sin(phase) + 10 },
            armUpperR: { rotation: (phase) => -40 * Math.sin(phase) },
            armLowerR: { rotation: (phase) => -25 * Math.sin(phase) + 10 },
            legUpper_profile: { rotation: (phase) => -30 * Math.sin(phase) },
            legLower_profile: { rotation: (phase) => 20 * Math.max(0, Math.cos(phase)) + 5 },
            legUpperL: { rotation: (phase) => -35 * Math.sin(phase) },
            legLowerL: { rotation: (phase) => 25 * Math.max(0, Math.cos(phase)) + 5 },
            legUpperR: { rotation: (phase) => 35 * Math.sin(phase) },
            legLowerR: { rotation: (phase) => 25 * Math.max(0, Math.cos(phase + Math.PI)) + 5 },
        };
        GD.POSES['sit_simple'] = { // NEW: Sitting pose
            torso: { rotation: -5, yFactor: -0.15 }, // Torso slightly back and lower
            head: { rotation: 5 },
            // Arms resting or slightly forward
            armUpperL: { rotation: 25 }, armLowerL: { rotation: 35 },
            armUpperR: { rotation: -25 }, armLowerR: { rotation: -35 },
            armUpper_profile: { rotation: 30 }, armLower_profile: { rotation: 30 },
            // Legs bent for sitting
            legUpperL: { rotation: -80 }, legLowerL: { rotation: 75 }, footL: { rotation: 5 },
            legUpperR: { rotation: -80 }, legLowerR: { rotation: 75 }, footR: { rotation: 5 },
            legUpper_profile: { rotation: -80 }, legLower_profile: { rotation: 75 }, foot_profile: {rotation: 5},
            // Could add chair interaction here if an object system is more developed
        };

        GD.EXPRESSIONS = { /* Same as before */
            'neutral': { eyeL: { openFactor: 1.0 }, eyeR: { openFactor: 1.0 }, mouth: { shapeKey: 'neutral' } },
            'happy': { eyeL: { openFactor: 0.8 }, eyeR: { openFactor: 0.8 }, mouth: { shapeKey: 'smile' } },
            'surprised': { eyeL: { openFactor: 1.2 }, eyeR: { openFactor: 1.2 }, mouth: { shapeKey: 'o_large' } }
        };
        GD.MOUTH_SHAPES = { /* Same as before */
            'neutral': { path: [{ cmd: 'M', x: -0.5, y: 0 }, { cmd: 'L', x: 0.5, y: 0 }], openFactor: 0 },
            'smile': { path: [{ cmd: 'M', x: -0.5, y: 0 }, { cmd: 'Q', x1: 0, y1: 0.3, x: 0.5, y: 0 }], openFactor: 0.1 },
            'o_large': { type: 'ellipse', widthFactor: 0.7, heightFactor: 0.75, openFactor: 0.8 }
        };

        GD.SHAPE_RENDERERS = { /* Mostly same, check for null style props */
            rect: (ctx, shapeDef, style, w, h) => {
                ctx.fillStyle = style.fill || 'magenta'; ctx.fillRect(0, 0, w, h);
                if (style.stroke && style.lineWidth > 0) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lineWidth; ctx.strokeRect(0, 0, w, h); }
            },
            ellipse: (ctx, shapeDef, style, w, h) => {
                ctx.fillStyle = style.fill || 'magenta'; ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
                if (style.stroke && style.lineWidth > 0) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lineWidth; ctx.stroke(); }
            },
            eye: (ctx, shapeDef, style, w, h, params) => {
                const open = params.openFactor !== undefined ? params.openFactor : 1;
                const pSX = params.pupilShiftX || 0; const pSY = params.pupilShiftY || 0;
                const visH = h * open; const pRad = shapeDef.pupilSizeFactor * style.baseScale;
                ctx.fillStyle = style.fill ||Animator.GlobalData.CHARACTER_TEMPLATES.human_default.palette.eyeWhiteColor;
                ctx.beginPath(); ctx.ellipse(w/2, h/2, w/2, visH/2, 0,0,Math.PI*2); ctx.fill();
                if(visH > pRad*0.5 && style.pupilFill){
                    ctx.fillStyle=style.pupilFill; ctx.beginPath();
                    const mPX = w/2-pRad; const mPY = visH/2-pRad; // Max pupil xy offset
                    const cPX = Utils.clamp(pSX, -mPX, mPX); const cPY = Utils.clamp(pSY, -mPY, mPY); // Clamped
                    ctx.arc(w/2+cPX, h/2+cPY, pRad,0,Math.PI*2); ctx.fill();
                    // Highlight
                    ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.arc(w/2+cPX+pRad*0.25,h/2+cPY-pRad*0.25, pRad*0.3,0,Math.PI*2); ctx.fill();
                }
            },
            mouth: (ctx, shapeDef, style, w, h, params) => {
                const key = params.shapeKey || 'neutral';
                const mouthDef = GD.MOUTH_SHAPES[key] || GD.MOUTH_SHAPES['neutral'];
                const mouthWidth = w * (mouthDef.widthFactor || 1);
                const mouthHeight = h * (mouthDef.heightFactor || 1);
                ctx.strokeStyle = style.color || Animator.GlobalData.CHARACTER_TEMPLATES.human_default.palette.mouthColor;
                ctx.fillStyle = Utils.adjustColor(style.color || Animator.GlobalData.CHARACTER_TEMPLATES.human_default.palette.mouthColor, -15);
                ctx.lineWidth = Math.max(1, (style.lineWidth || (0.01 * style.baseScale * 0.07)) * 0.7); // Ensure lineWidth is reasonable
                ctx.beginPath();
                const centerX = w / 2, centerY = h / 2;
                if (mouthDef.type === 'ellipse') {
                    ctx.ellipse(centerX, centerY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
                } else if (mouthDef.path) {
                    mouthDef.path.forEach(cmd => {
                        const p = cmd;
                        switch (p.cmd) {
                            case 'M': ctx.moveTo(centerX + p.x * mouthWidth, centerY + p.y * mouthHeight); break;
                            case 'L': ctx.lineTo(centerX + p.x * mouthWidth, centerY + p.y * mouthHeight); break;
                            case 'Q': ctx.quadraticCurveTo(centerX + p.x1 * mouthWidth, centerY + p.y1 * mouthHeight, centerX + p.x * mouthWidth, centerY + p.y * mouthHeight); break;
                        }
                    });
                }
                if (mouthDef.openFactor > 0.05) ctx.closePath();
                if (mouthDef.openFactor > 0.05) ctx.fill();
                ctx.stroke();
            },
            tzitzit_strand: (ctx, shapeDef, style, w, h) => { /* Same as before */
                ctx.strokeStyle = style.color || Animator.GlobalData.CHARACTER_TEMPLATES.human_default.palette.tzitzitColor;
                ctx.lineWidth = Math.max(1, style.baseScale * 0.007);
                const numStrings = shapeDef.numStrings || 2;
                const spacing = w / Math.max(1, numStrings);
                for(let i = 0; i < numStrings; ++i) {
                    ctx.beginPath();
                    const sx = (i - (numStrings - 1) / 2) * spacing;
                    ctx.moveTo(sx, 0);
                    ctx.lineTo(sx, h);
                    ctx.stroke();
                }
            },
            line: (ctx, shapeDef, style, w, h) => { /* Same as before */
                 ctx.strokeStyle = style.color || style.stroke || 'black';
                 ctx.lineWidth = h; // h is thickness
                 ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
            },
        };
        
        GD.BEHAVIOR_HANDLERS.blink = (charState, behaviorInstance, deltaTime, currentTime, baseScale) => { /* Same as before */
            const cfg = behaviorInstance.config; let state = charState.behaviorStates.blink;
            if(!state){state = charState.behaviorStates.blink = {last:currentTime, next:Utils.randomRange(cfg.intervalMin,cfg.intervalMax), active:false, prog:0};}
            if(state.active){ state.prog += deltaTime/(cfg.duration||0.18);
                if(state.prog>=1){ state.active=false; state.prog=0; cfg.targetPartIds.forEach(id=>charState.parts[id]&&(charState.parts[id].computedParams.openFactor=1));}
                else{ const phase=1-Math.sin(state.prog*Math.PI); cfg.targetPartIds.forEach(id=>charState.parts[id]&&(charState.parts[id].computedParams.openFactor=phase*0.99+0.01));} // Ensure not fully closed
            } else if(currentTime > state.last+state.next){state.active=true; state.prog=0; state.last=currentTime; state.next=Utils.randomRange(cfg.intervalMin,cfg.intervalMax);}
        };
        GD.BEHAVIOR_HANDLERS.eyeDart = (charState, behaviorInstance, deltaTime, currentTime, baseScale) => { /* Same as before */
            const cfg = behaviorInstance.config; let state = charState.behaviorStates.eyeDart;
            if(!state){state = charState.behaviorStates.eyeDart = {last:currentTime, next:Utils.randomRange(cfg.intervalMin,cfg.intervalMax), active:false, prog:0, cX:0,cY:0,tX:0,tY:0,sX:0,sY:0};}
            if(state.active){ state.prog += deltaTime/(cfg.duration||0.15);
                if(state.prog>=1){state.active=false;state.prog=0;state.cX=state.tX;state.cY=state.tY;}
                else{const t=Utils.smoothStep(state.prog); state.cX=Utils.lerp(state.sX,state.tX,t); state.cY=Utils.lerp(state.sY,state.tY,t);}
            } else if(currentTime > state.last+state.next){
                state.active=true; state.prog=0; state.last=currentTime; state.next=Utils.randomRange(cfg.intervalMin,cfg.intervalMax);
                state.sX=state.cX; state.sY=state.cY;
                const range = (cfg.rangeFactor||0.0025)*baseScale; state.tX=Utils.randomRange(-range,range); state.tY=Utils.randomRange(-range,range);
            }
            cfg.targetPartIds.forEach(id=>{if(charState.parts[id]){charState.parts[id].computedParams.pupilShiftX=state.cX; charState.parts[id].computedParams.pupilShiftY=state.cY;}});
        };
        GD.BEHAVIOR_HANDLERS.simpleSpringPhysics = (charState, behaviorInstance, deltaTime, currentTime, baseScale) => {
            const part = charState.parts[behaviorInstance.partId]; if (!part) return;
            const cfg = behaviorInstance.config;
            let state = part.behaviorStates.simpleSpringPhysics;
            if(!state){state=part.behaviorStates.simpleSpringPhysics={angleRad:0, velRad:0};} // Using radians

            let parentWorldAngleRad = 0;
            if(part.effectiveDefinition.parentId && charState.parts[part.effectiveDefinition.parentId]?.worldMatrix){
                parentWorldAngleRad = Utils.getRotationFromMatrix(charState.parts[part.effectiveDefinition.parentId].worldMatrix);
            }

            const stiffness = cfg.stiffness || 0.1;
            const damping = cfg.damping || 0.9;
            const gravityFactor = cfg.gravityFactor || 0.05; // This is now more like a strength multiplier
            const angleLimitDeg = cfg.angleLimit || 40;
            const angleLimitRad = Utils.degToRad(angleLimitDeg);

            // Spring force: tries to return to 0 angle (relative to parent's attachment)
            const springF = -stiffness * state.angleRad;
            // Damping force
            const dampF = -damping * state.velRad;
            // Gravitational force: pulls the part towards "world down" from the parent's perspective
            // gravTargetAngleRad is the angle (in radians, in parent's frame) that the part would need to be at
            // to point "down" in world coordinates.
            const gravTargetAngleRad = -parentWorldAngleRad; // Angle of world "down" relative to parent's X-axis
            // Force is proportional to displacement from this target: sin(current - target_for_gravity)
            // We want force to pull towards gravTargetAngleRad, so if angleRad > gravTargetAngleRad, force is negative.
            const gravF = gravityFactor * Math.sin(gravTargetAngleRad - state.angleRad);

            const accel = springF + dampF + gravF;
            state.velRad += accel * deltaTime; // deltaTime is in seconds, velRad in rad/s, accel in rad/s^2
            let newAngleRad = state.angleRad + state.velRad * deltaTime;

            if(Math.abs(newAngleRad) > angleLimitRad){
                newAngleRad = Utils.clamp(newAngleRad, -angleLimitRad, angleLimitRad);
                state.velRad *= -0.4; // Lose some energy on hitting limit
            }
            state.angleRad = newAngleRad;
            part.proceduralRotation = Utils.radToDeg(state.angleRad); // Store in degrees for drawing
        };

        // NEW: Basic object template
        GD.OBJECT_TEMPLATES = {
            'generic_box': {
                dimensions: { w: 50, h: 50 }, // Absolute pixels for now, or could be relative to scene
                shape: { type: 'rect', fill: '#A0A0A0', stroke: '#333333', lineWidth: 2 },
                physics: { mass: 1, friction: 0.5 }, // Basic physics properties
                grabbablePoints: [{ x: 0.5, y: 0.5 }] // Relative to object dimensions
            },
            'generic_ball': {
                dimensions: { w: 40, h: 40 },
                shape: { type: 'ellipse', fill: '#D0A0A0', stroke: '#333333', lineWidth: 2 },
                physics: { mass: 0.5, friction: 0.3 },
                grabbablePoints: [{ x: 0.5, y: 0.5 }]
            }
        };
    }

    _bindUIEvents() { /* Same as before */
        this.ui.loadJsonBtn.addEventListener('click', () => this.loadJsonFromTextarea());
        this.ui.jsonFileUpload.addEventListener('change', (e) => this.loadJsonFromFile(e));
        this.ui.playStopBtn.addEventListener('click', () => this.togglePlayStop());
        this.ui.restartBtn.addEventListener('click', () => this.restartAnimation());
        this.ui.exportBtn.addEventListener('click', () => this.exportAnimation());
    }
    _checkForEmbeddedData() { /* Same as before */
        const embeddedDataScript = document.getElementById('animationDataJson');
        if (embeddedDataScript?.textContent?.trim()) {
            try {
                const jsonData = JSON.parse(embeddedDataScript.textContent);
                this.loadAnimation(jsonData);
                this.ui.inputContainer.classList.add('hidden-exported');
                document.getElementById('exportBtn')?.classList.add('hidden-exported');
                document.getElementById('playbackControlsContainer')?.classList.add('full-width-exported');
                document.body.classList.add('exported-body');
                document.querySelector('h1')?.classList.add('exported-h1');
                if (this.animationData?.scene?.autoplay) setTimeout(() => this.playAnimation(), 100);
            } catch (e) { console.error("Error loading embedded JSON:", e); this.ui.statusDiv.textContent = "Error: " + e.message; }
        }
    }
    loadJsonFromTextarea() { /* Same */ try { this.loadAnimation(JSON.parse(this.ui.jsonInput.value)); } catch (e) { this.ui.statusDiv.textContent = "JSON Error: " + e.message + "\n" + e.stack; } }
    loadJsonFromFile(event) { /* Same */
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e_read) => { try { this.ui.jsonInput.value = e_read.target.result; this.loadAnimation(JSON.parse(e_read.target.result)); } catch (e) { this.ui.statusDiv.textContent = "File JSON Error: " + e.message; } };
        reader.readAsText(file);
    }

    loadAnimation(data) {
        if (!data?.scene || !data?.characters || !data?.timeline) { this.ui.statusDiv.textContent = "Invalid JSON structure. Missing scene, characters, or timeline."; return; }
        this.stopAnimation(); this.animationData = data; this.currentTime = 0;

        this.canvas.width = data.scene.width || 800; this.canvas.height = data.scene.height || 600;
        this.canvas.style.backgroundColor = data.scene.backgroundColor || "#F0F8FF";
        this.sceneLayers = (data.scene.layers || [{ name: this.defaultLayerName, zIndex: 0, parallaxFactor: 1.0 }]).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        if (!this.sceneLayers.find(l => l.name === this.defaultLayerName)) this.sceneLayers.push({ name: this.defaultLayerName, zIndex: 0, parallaxFactor: 1.0 });

        const iCam = data.scene.initialCamera || {};
        this.cameraState = { ...this.cameraState, worldX: iCam.x ?? this.canvas.width / 2, worldY: iCam.y ?? this.canvas.height / 2, zoom: iCam.zoom ?? 1, focusEntityIds: iCam.focusEntityIds || [] };
        this.cameraState.targetWorldX = this.cameraState.worldX; this.cameraState.targetWorldY = this.cameraState.worldY; this.cameraState.targetZoom = this.cameraState.zoom;
        
        this.eventTimeline = data.timeline.map((g, gi) => g.map((e, ei) => ({ ...e, _instanceId: `g${gi}_e${ei}` })));
        
        this.charactersState = {}; data.characters.forEach(cd => this._initializeCharacter(cd));
        this.objectsState = {}; (data.objects || []).forEach(od => this._initializeObject(od));

        // IMPORTANT FIX: Ensure all characters and objects have their initial state fully calculated BEFORE first draw
        Object.values(this.charactersState).forEach(cs => this._updateCharacter(cs, 0)); // deltaTime = 0 for initial setup
        Object.values(this.objectsState).forEach(os => this._updateObject(os, 0)); // deltaTime = 0

        this.ui.statusDiv.textContent = `Loaded. ${this.eventTimeline.length} groups.`; this.ui.playbackControlsContainer.classList.remove('hidden');
        if (this.eventTimeline[0]?.[0]) this.eventTimeline[0].forEach(e => { if (e.type === 'camera') this._applyCameraEvent(e, true); });
        
        this.drawScene(); // Now this should be safe
    }

    _initializeCharacter(charDef) {
        const templateId = charDef.templateId || 'human_default'; const template = Animator.GlobalData.CHARACTER_TEMPLATES[templateId];
        if (!template) { console.warn(`Template ${templateId} missing for ${charDef.id}.`); return; }

        const charState = {
            id: charDef.id, templateId, x: charDef.initialPosition.x, y: charDef.initialPosition.y,
            targetX: charDef.initialPosition.x, targetY: charDef.initialPosition.y,
            walkStartTime: 0, walkDuration: 0, walkStartX:0, walkStartY:0,
            facingDirection: charDef.facing || 'right', facingMode: charDef.facingMode || 'profile',
            activePoseName: charDef.initialPose || 'idle_default', previousPoseName: charDef.initialPose || 'idle_default',
            poseTransitionProgress: 1.0, poseTransitionDuration: charDef.poseTransitionDuration || 0.35,
            activeExpressionName: charDef.appearance?.expression || 'neutral', previousExpressionName: charDef.appearance?.expression || 'neutral',
            expressionTransitionProgress: 1.0, expressionTransitionDuration: charDef.expressionTransitionDuration || 0.3,
            dialogueText: null, isSpeakingTTS: false, ttsUtterance: null, currentActions: [],
            layer: charDef.layer || this.defaultLayerName, size: charDef.size || 1.0,
            palette: { ...template.palette, ...(charDef.appearance?.palette || {}) },
            parts: {}, behaviorStates: {},
            activeBehaviors: JSON.parse(JSON.stringify(charDef.behaviors || template.defaultBehaviors || [])),
            posePhase: Math.random() * Math.PI * 2, rootMotionYOffset: 0,
            appearanceFlags: { // More structured appearance flags
                gender: charDef.appearance?.gender || 'neutral', // e.g., 'male', 'female'
                hasTzitzit: charDef.appearance?.hasTzitzit ?? ( (charDef.appearance?.gender === 'male') ),
                hasYarmulke: charDef.appearance?.hasYarmulke ?? ( (charDef.appearance?.gender === 'male') ),
            },
            attachedObject: null, // { objectId: string, hand: 'L' | 'R', localOffset: {x,y,rot} }
        };

        template.parts.forEach(pDef => {
            charState.parts[pDef.id] = {
                definition: JSON.parse(JSON.stringify(pDef)), effectiveDefinition: {},
                localMatrix: Utils.matrixIdentity(), worldMatrix: Utils.matrixIdentity(),
                visible: pDef.visible !== false, zIndex: pDef.zIndex || 0,
                // currentDimensions will be set by _updateCharacterDimensions
                currentDimensions: { w:0, h:0 }, // Initialize to prevent error if accessed too early
                computedStyle: { baseScale: template.baseHeight * charState.size }, computedParams: {}, proceduralRotation: 0,
                behaviorStates: {}
            };
            if (pDef.attachedBehaviors) {
                charState.parts[pDef.id].attachedBehaviors = JSON.parse(JSON.stringify(pDef.attachedBehaviors));
            }
        });
        // _resolvePartDefinitions and other calculations will be done by the initial _updateCharacter call.
        this.charactersState[charDef.id] = charState;
    }

    _initializeObject(objDef) {
        const templateId = objDef.templateId || 'generic_box';
        const template = Animator.GlobalData.OBJECT_TEMPLATES[templateId];
        if (!template) { console.warn(`Object template ${templateId} missing for ${objDef.id}.`); return; }

        const objState = {
            id: objDef.id, templateId,
            x: objDef.initialPosition.x, y: objDef.initialPosition.y, rotation: objDef.initialRotation || 0, // Degrees
            targetX: objDef.initialPosition.x, targetY: objDef.initialPosition.y, targetRotation: objDef.initialRotation || 0,
            layer: objDef.layer || this.defaultLayerName,
            size: objDef.size || 1.0, // Multiplier for template dimensions
            palette: { ...template.palette, ...(objDef.appearance?.palette || {}) }, // If objects have palettes
            definition: JSON.parse(JSON.stringify(template)), // Store a copy of its base definition
            worldMatrix: Utils.matrixIdentity(),
            currentDimensions: { // Calculated based on template and size
                w: (template.dimensions.w || 10) * (objDef.size || 1.0),
                h: (template.dimensions.h || 10) * (objDef.size || 1.0)
            },
            visible: objDef.visible !== false,
            isAttachedTo: null, // { characterId: string, hand: string }
            // Future: physics state (velocity, angularVelocity etc.)
        };
        this.objectsState[objDef.id] = objState;
    }


    togglePlayStop() { if (!this.animationData) return; this.isPlaying ? this.stopAnimation() : this.playAnimation(); }
    playAnimation() { /* Largely same, ensures prerequisites */
        if (!this.animationData || this.isPlaying) return;
        this.isPlaying = true; this.ui.playStopBtn.textContent = "Stop";
        if (this.currentEventGroupIndex === -1 || this.currentEventGroupIndex >= this.eventTimeline.length) {
            this.restartAnimationPrerequisites();
        }
        this.lastTimestamp = performance.now();
        this.processNextEventGroup();
        if (!this.animationFrameId) this.animationLoop();
    }
    stopAnimation() { /* Largely same */
        this.isPlaying = false; this.ui.playStopBtn.textContent = "Play";
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        if (this.speechSynthesis?.speaking) this.speechSynthesis.cancel();
        Object.values(this.charactersState).forEach(cs => { if (cs.ttsUtterance) cs.ttsUtterance.onend = null; cs.isSpeakingTTS = false; });
        // this.drawScene(); // Final paint, if needed, but animationLoop stop is usually fine
    }
    restartAnimationPrerequisites() { /* Largely same, ensures re-init */
        this.currentEventGroupIndex = -1; this.activeEventGroup = null; this.activeEventGroupStatus = {}; this.currentTime = 0;
        if (this.speechSynthesis?.speaking) this.speechSynthesis.cancel();
        
        if (this.animationData) {
            // Re-initialize characters and objects to their defined initial states
            this.charactersState = {}; 
            (this.animationData.characters || []).forEach(cd => this._initializeCharacter(cd));
            this.objectsState = {}; 
            (this.animationData.objects || []).forEach(od => this._initializeObject(od));

            Object.values(this.charactersState).forEach(cs => this._updateCharacter(cs, 0));
            Object.values(this.objectsState).forEach(os => this._updateObject(os, 0));

            const iCam = this.animationData.scene?.initialCamera || {};
            this.cameraState.targetWorldX = iCam.x ?? this.canvas.width / 2; this.cameraState.targetWorldY = iCam.y ?? this.canvas.height / 2; this.cameraState.targetZoom = iCam.zoom ?? 1;
            this.cameraState.worldX = this.cameraState.targetWorldX; this.cameraState.worldY = this.cameraState.targetWorldY; this.cameraState.zoom = this.cameraState.targetZoom;
            if (this.eventTimeline[0]?.[0]) this.eventTimeline[0].forEach(e => { if (e.type === 'camera') this._applyCameraEvent(e, true); });
        }
    }
    restartAnimation() { /* Largely same */
        if (!this.animationData) return; const wasPlaying = this.isPlaying;
        this.stopAnimation(); this.restartAnimationPrerequisites(); this.drawScene();
        if (wasPlaying) setTimeout(() => this.playAnimation(), 50);
    }

    animationLoop() {
        if (!this.isPlaying && (!this.activeEventGroup || Object.values(this.activeEventGroupStatus).every(s => s.completed))) {
            this.animationFrameId = null; 
            this.drawScene(); // One final draw when paused/stopped completely
            return;
        }
        const now = performance.now(); const dt = Math.min(0.1, (now - this.lastTimestamp) / 1000 || 0.016);
        this.lastTimestamp = now; if (this.isPlaying) this.currentTime += dt;
        
        this._updateState(dt); this.drawScene();
        this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
    }

    _updateState(deltaTime) {
        this._updateCamera(deltaTime);
        Object.values(this.charactersState).forEach(cs => this._updateCharacter(cs, deltaTime));
        Object.values(this.objectsState).forEach(os => this._updateObject(os, deltaTime));
        this._checkActiveEventGroupCompletion();
    }

    _updateCamera(deltaTime) { /* Same logic as before */
        this._calculateCameraFocusTarget();
        const dtFactor = deltaTime * 60;
        if (Math.abs(this.cameraState.targetWorldX - this.cameraState.worldX) > this.cameraState.lerpThreshold ||
            Math.abs(this.cameraState.targetWorldY - this.cameraState.worldY) > this.cameraState.lerpThreshold) {
            this.cameraState.worldX = Utils.lerp(this.cameraState.worldX, this.cameraState.targetWorldX, this.cameraState.panSpeed * dtFactor);
            this.cameraState.worldY = Utils.lerp(this.cameraState.worldY, this.cameraState.targetWorldY, this.cameraState.panSpeed * dtFactor);
        } else { this.cameraState.worldX = this.cameraState.targetWorldX; this.cameraState.worldY = this.cameraState.targetWorldY; }
        if (Math.abs(this.cameraState.targetZoom - this.cameraState.zoom) > this.cameraState.zoomThreshold) {
            this.cameraState.zoom = Utils.lerp(this.cameraState.zoom, this.cameraState.targetZoom, this.cameraState.zoomSpeed * dtFactor);
        } else { this.cameraState.zoom = this.cameraState.targetZoom; }
        this.cameraState.zoom = Utils.clamp(this.cameraState.zoom, this.cameraState.minZoom, this.cameraState.maxZoom);
    }

    _updateCharacterDimensions(charState) { // NEW: Centralized dimension calculation
        const template = Animator.GlobalData.CHARACTER_TEMPLATES[charState.templateId];
        if (!template) return;
        const baseScale = template.baseHeight * charState.size;

        for (const pId in charState.parts) {
            const pState = charState.parts[pId];
            const effDef = pState.effectiveDefinition; // Assumes _resolvePartDefinitions was called
            
            if (effDef && effDef.dimensions) {
                 pState.currentDimensions = {
                    w: (effDef.dimensions.wFactor || 0.1) * baseScale,
                    h: (effDef.dimensions.hFactor || 0.1) * baseScale,
                };
            } else {
                // Fallback if effectiveDefinition or its dimensions are missing (should not happen in normal flow)
                pState.currentDimensions = { w: baseScale * 0.1, h: baseScale * 0.1 };
                if(!effDef) console.warn(`Part ${pId} in ${charState.id} missing effectiveDefinition.`);
                else if(!effDef.dimensions) console.warn(`Part ${pId} in ${charState.id} missing dimensions in effectiveDefinition.`);
            }
        }
    }

    _updateCharacter(charState, deltaTime) {
        const template = Animator.GlobalData.CHARACTER_TEMPLATES[charState.templateId];
        if (!template) return;
        const baseScale = template.baseHeight * charState.size;

        // Transitions
        if (charState.poseTransitionProgress < 1) charState.poseTransitionProgress = Math.min(1, charState.poseTransitionProgress + deltaTime / (charState.poseTransitionDuration || 0.001));
        if (charState.expressionTransitionProgress < 1) charState.expressionTransitionProgress = Math.min(1, charState.expressionTransitionProgress + deltaTime / (charState.expressionTransitionDuration || 0.001));

        // Walk movement
        if (charState.walkDuration > 0) {
            const timeInWalk = this.currentTime - charState.walkStartTime;
            const progress = Utils.clamp(timeInWalk / charState.walkDuration, 0, 1);
            charState.x = Utils.lerp(charState.walkStartX, charState.targetX, Utils.smoothStep(progress));
            charState.y = Utils.lerp(charState.walkStartY, charState.targetY, Utils.smoothStep(progress));
            if (progress >= 1) charState.walkDuration = 0;
        }

        this._resolvePartDefinitions(charState); // Update effective defs based on facing, gender etc.
        this._updateCharacterDimensions(charState); // IMPORTANT: Calculate current dimensions for all parts

        // Pose phase
        let poseSpeedFactor = (Animator.GlobalData.POSES[charState.activePoseName]?.speedFactor || 1.0);
        if(charState.walkDuration > 0 && charState.activePoseName === 'walk') poseSpeedFactor *= 1.8;
        charState.posePhase = (charState.posePhase + deltaTime * poseSpeedFactor * 2.5) % (Math.PI * 2);

        // Character-level behaviors
        (charState.activeBehaviors || []).forEach(behDef => {
            const handler = Animator.GlobalData.BEHAVIOR_HANDLERS[behDef.type];
            if (handler) handler(charState, behDef, deltaTime, this.currentTime, baseScale);
        });
        // Part-level attached behaviors
        for (const partId in charState.parts) {
            const partState = charState.parts[partId];
            if (partState.attachedBehaviors) {
                partState.attachedBehaviors.forEach(attBehDef => {
                    const handler = Animator.GlobalData.BEHAVIOR_HANDLERS[attBehDef.type];
                    if (handler) handler(charState, { partId, config: attBehDef.config || attBehDef }, deltaTime, this.currentTime, baseScale); // Pass config if nested
                });
            }
        }

        this._evaluatePoseAndExpression(charState, baseScale);
        this._solveIKForCharacter(charState, baseScale);
        this._calculateAllPartTransforms(charState); // baseScale no longer needed here if currentDimensions are pre-calc'd

        // Update attached object's position if any
        if (charState.attachedObject && this.objectsState[charState.attachedObject.objectId]) {
            const objState = this.objectsState[charState.attachedObject.objectId];
            const handId = charState.attachedObject.hand === 'L' ? 'handL' : 'handR';
            const handPart = charState.parts[handId] || charState.parts['hand_profile']; // Consider profile alias

            if (handPart && handPart.worldMatrix) {
                // Simple attachment: object origin matches hand origin + offset
                // More complex: use a defined "grip point" on the hand and object
                let handWorldPos = Utils.getTranslationFromMatrix(handPart.worldMatrix);
                let handWorldRotRad = Utils.getRotationFromMatrix(handPart.worldMatrix);
                
                // Apply character's global transform to hand's local world pos (relative to char origin)
                let attachmentMatrix = Utils.matrixIdentity();
                attachmentMatrix = Utils.matrixTranslate(attachmentMatrix, charState.x, charState.y);
                attachmentMatrix = Utils.matrixScale(attachmentMatrix, charState.size, charState.size);
                attachmentMatrix = Utils.matrixMultiply(attachmentMatrix, handPart.worldMatrix);
                
                // TODO: Incorporate charState.attachedObject.localOffset if defined
                // For now, object's origin matches transformed hand's origin
                objState.x = Utils.getTranslationFromMatrix(attachmentMatrix).x;
                objState.y = Utils.getTranslationFromMatrix(attachmentMatrix).y;
                objState.rotation = Utils.radToDeg(Utils.getRotationFromMatrix(attachmentMatrix));

                objState.isAttachedTo = { characterId: charState.id, hand: charState.attachedObject.hand };
            }
        }
    }

    _updateObject(objState, deltaTime) {
        if (objState.isAttachedTo) {
            // Position is handled by the character holding it.
            // We still need to update its world matrix for drawing.
            let m = Utils.matrixIdentity();
            m = Utils.matrixTranslate(m, objState.x, objState.y);
            m = Utils.matrixRotate(m, Utils.degToRad(objState.rotation));
            // Scale if object definition includes it relative to its own origin/pivot
            // m = Utils.matrixScale(m, objState.size, objState.size); // NO, size is already in currentDimensions
            objState.worldMatrix = m;
            return;
        }

        // If not attached, could have its own animation (e.g., moving, physics)
        // For now, objects are static unless attached or moved by an event.
        // Lerp towards target if defined by an event (TODO: implement object move events)
        let m = Utils.matrixIdentity();
        m = Utils.matrixTranslate(m, objState.x, objState.y);
        m = Utils.matrixRotate(m, Utils.degToRad(objState.rotation));
        objState.worldMatrix = m;
    }

    _resolvePartDefinitions(charState) {
        const template = Animator.GlobalData.CHARACTER_TEMPLATES[charState.templateId];
        if (!template) return;

        const facingKey = `${charState.facingMode}_${charState.facingDirection}`;
        const modeKey = charState.facingMode; // Fallback if specific direction override not found
        const overrides = template.facingOverrides?.[facingKey] || template.facingOverrides?.[modeKey] || {};

        for (const partId in charState.parts) {
            const partState = charState.parts[partId];
            // Start with a fresh copy of the base definition for this part
            partState.effectiveDefinition = JSON.parse(JSON.stringify(partState.definition));
            const effDef = partState.effectiveDefinition;

            // Apply palette (resolve color names like '@hairColor' or 'hairColor')
            ['fill', 'stroke', 'color', 'pupilFill'].forEach(prop => {
                if (effDef.shape && effDef.shape[prop]) {
                    let colorValue = effDef.shape[prop];
                    if (colorValue.startsWith('@')) { // Palette reference
                        colorValue = charState.palette[colorValue.substring(1)];
                    } else if (charState.palette[colorValue]) { // Direct key
                         colorValue = charState.palette[colorValue];
                    }
                    effDef.shape[prop] = colorValue || effDef.shape[prop]; // Fallback to original if not resolved
                }
            });
            
            // Apply facing overrides
            const partOvr = overrides[partId];
            if (partOvr) {
                Object.keys(partOvr).forEach(key => {
                    if (typeof partOvr[key] === 'object' && partOvr[key] !== null && !Array.isArray(partOvr[key])) {
                        effDef[key] = { ...(effDef[key] || {}), ...partOvr[key] }; // Deep merge for objects like anchorToParent
                    } else {
                        effDef[key] = partOvr[key]; // Direct assignment for primitives or arrays
                    }
                });
            }
            
            // Handle gender-specific parts (tzitzit, yarmulke)
            if (effDef.genderConditional) {
                let show = false;
                if (effDef.genderConditional === 'male' && charState.appearanceFlags.gender === 'male') {
                    if (partId.startsWith('tzitzit_')) show = charState.appearanceFlags.hasTzitzit;
                    else if (partId === 'yarmulke') show = charState.appearanceFlags.hasYarmulke;
                    else show = true; // Default to show if male and condition is 'male'
                }
                // Add 'female' or other conditions if needed
                effDef.visible = show;
            }
            // Final visibility and zIndex from effective definition
            partState.visible = effDef.visible !== false;
            partState.zIndex = effDef.zIndex !== undefined ? effDef.zIndex : (partState.definition.zIndex || 0) ;
        }
    }
    
    _evaluatePoseAndExpression(charState, baseScale) { /* Logic mostly same, uses baseScale */
        const GD = Animator.GlobalData;
        const curPoseN = charState.activePoseName; const prevPoseN = charState.previousPoseName; const tP = Utils.smoothStep(charState.poseTransitionProgress);
        const curExprN = charState.activeExpressionName; const prevExprN = charState.previousExpressionName; const tE = Utils.smoothStep(charState.expressionTransitionProgress);
        
        const curPose = GD.POSES[curPoseN] || {}; const prevPose = GD.POSES[prevPoseN] || {};
        const curExpr = GD.EXPRESSIONS[curExprN] || {}; const prevExpr = GD.EXPRESSIONS[prevExprN] || {};

        const getPVal = (poseDef, partIdForPose, prop, defaultValue) => {
            const partPose = poseDef[partIdForPose];
            if (partPose && partPose[prop] !== undefined) {
                return typeof partPose[prop] === 'function' ? partPose[prop](charState.posePhase) : partPose[prop];
            }
            return defaultValue;
        };
        const getEVal = (exprDef, partId, prop, defaultValue) => {
            const partExpr = exprDef[partId];
            return (partExpr && partExpr[prop] !== undefined) ? partExpr[prop] : defaultValue;
        };

        // Root motion for body bobbing (applied at character's base translation)
        const prevRootY = (prevPose.torso && typeof prevPose.torso.rootMotionYFactor === 'function' ? prevPose.torso.rootMotionYFactor(charState.posePhase) : (prevPose.torso?.rootMotionYFactor || 0));
        const currRootY = (curPose.torso && typeof curPose.torso.rootMotionYFactor === 'function' ? curPose.torso.rootMotionYFactor(charState.posePhase) : (curPose.torso?.rootMotionYFactor || 0));
        charState.rootMotionYOffset = Utils.lerp(prevRootY, currRootY, tP) * baseScale;


        for (const pId in charState.parts) {
            const pState = charState.parts[pId];
            // Use idAlias from effectiveDefinition if available for pose lookup
            const idForPose = pState.effectiveDefinition?.idAlias || pId;

            pState.poseTransform = { // These are local offsets/rotations for the part
                x: Utils.lerp(getPVal(prevPose, idForPose, 'xFactor', 0), getPVal(curPose, idForPose, 'xFactor', 0), tP) * baseScale,
                y: Utils.lerp(getPVal(prevPose, idForPose, 'yFactor', 0), getPVal(curPose, idForPose, 'yFactor', 0), tP) * baseScale,
                rotation: Utils.lerp(getPVal(prevPose, idForPose, 'rotation', 0), getPVal(curPose, idForPose, 'rotation', 0), tP),
            };
            
            // Reset computedParams and apply expression values
            pState.computedParams = { ...(pState.computedParams || {}) }; // Keep existing (e.g. from behaviors)
            if (pState.effectiveDefinition?.shape?.type === 'eye') {
                pState.computedParams.openFactor = Utils.lerp(getEVal(prevExpr, pId, 'openFactor', 1), getEVal(curExpr, pId, 'openFactor', 1), tE);
            } else if (pState.effectiveDefinition?.shape?.type === 'mouth') {
                pState.computedParams.shapeKey = tE < 0.5 ? (getEVal(prevExpr, pId, 'shapeKey', 'neutral')) : (getEVal(curExpr, pId, 'shapeKey', 'neutral'));
            }
        }
    }

    _solveIKForCharacter(charState, baseScale) { // Uses pre-calculated currentDimensions
        const currentPoseDef = Animator.GlobalData.POSES[charState.activePoseName] || {};
        for (const posePartKey in currentPoseDef) {
            const poseProps = currentPoseDef[posePartKey];
            if (!poseProps.ikTarget) continue;

            let effectorPartState = null, effectorPartId = null;
            for (const id in charState.parts) { // Find actual part by id or alias
                if ((charState.parts[id].effectiveDefinition.idAlias === posePartKey) || (id === posePartKey)) {
                    effectorPartState = charState.parts[id]; effectorPartId = id; break;
                }
            }
            if (!effectorPartState || !effectorPartState.effectiveDefinition.ikChain || effectorPartState.effectiveDefinition.ikChain.length !== 3) continue;
            
            const [ulIdAliased, llIdAliased, effIdAliased] = effectorPartState.effectiveDefinition.ikChain;
            // Resolve actual part IDs from aliases in the chain definition
            const resolveChainAlias = (alias) => {
                for(const pid in charState.parts) if(charState.parts[pid].effectiveDefinition.idAlias === alias || pid === alias) return pid;
                return alias;
            }
            const ulId = resolveChainAlias(ulIdAliased);
            const llId = resolveChainAlias(llIdAliased);
            // const effIdActual = resolveChainAlias(effIdAliased); // Effector is already resolved

            const ulState = charState.parts[ulId], llState = charState.parts[llId];
            if (!ulState || !llState || !ulState.currentDimensions || !llState.currentDimensions) continue;

            const len1 = (ulState.effectiveDefinition.dimensions.hFactor || 0.1) * baseScale; // Length of upper limb
            const len2 = (llState.effectiveDefinition.dimensions.hFactor || 0.1) * baseScale; // Length of lower limb

            // IK Start: Pivot of Upper Limb (ulState).
            // This requires the world matrix of ulState's parent.
            const ulParentId = ulState.effectiveDefinition.parentId;
            const ulParentWorldMatrix = ulParentId ? (charState.parts[ulParentId]?.worldMatrix || Utils.matrixIdentity()) : Utils.matrixIdentity();
            
            // Calculate world position of ulAnchor on its parent
            const ulAnchorLocalOnParent = { x: 0, y: 0 };
            if (ulParentId && charState.parts[ulParentId] && charState.parts[ulParentId].currentDimensions) {
                const parentDims = charState.parts[ulParentId].currentDimensions;
                ulAnchorLocalOnParent.x = ulState.effectiveDefinition.anchorToParent.x * parentDims.w;
                ulAnchorLocalOnParent.y = ulState.effectiveDefinition.anchorToParent.y * parentDims.h;
            }
            // Transform this anchor point by parent's world matrix to get world position of UL's origin (0,0)
            const ulOriginWorld = Utils.transformPoint(ulAnchorLocalOnParent, ulParentWorldMatrix);
            
            // The IK chain starts at the *pivot* of the upper limb.
            // So, transform UL's local pivot by its own (still unrotated by IK) frame.
            // The matrix to UL's origin is effectively `ulParentWorldMatrix * Translate(ulAnchorLocalOnParent)`
            // Let's consider the poseTransform.x/y already applied to ulState.
            // For IK, the start point is the joint's location. If ulState.poseTransform.x/y is an offset from the anchor:
            const startX = ulOriginWorld.x + (ulState.poseTransform?.x || 0); // Simplified: Assumes poseTransform x/y are offsets from anchor
            const startY = ulOriginWorld.y + (ulState.poseTransform?.y || 0); // This is the base of the limb segment.
                                                                               // A more rigorous approach would transform the pivot point specifically.

            // IK Target:
            const targetDef = poseProps.ikTarget;
            const targetPartState = charState.parts[targetDef.partId];
            if (!targetPartState || !targetPartState.worldMatrix || !targetPartState.currentDimensions) continue;

            const targetAnchorFactor = targetDef.anchorFactor || {x: 0.5, y: 0.5}; // Default to center
            const tDimW = targetPartState.currentDimensions.w; const tDimH = targetPartState.currentDimensions.h;
            // Target point in target part's local space
            const targetLocalPt = { x: targetAnchorFactor.x * tDimW, y: targetAnchorFactor.y * tDimH };
            // Transform by target part's full world matrix (character + part specific)
            let targetPartFullWorldMatrix = Utils.matrixIdentity();
            targetPartFullWorldMatrix = Utils.matrixTranslate(targetPartFullWorldMatrix, charState.x, charState.y);
            targetPartFullWorldMatrix = Utils.matrixScale(targetPartFullWorldMatrix, charState.size, charState.size);
            targetPartFullWorldMatrix = Utils.matrixMultiply(targetPartFullWorldMatrix, targetPartState.worldMatrix); // worldMatrix is relative to char root
            const targetWorldPt = Utils.transformPoint(targetLocalPt, targetPartFullWorldMatrix);


            // Transform startX, startY to full world coordinates too
            let startPointMatrix = Utils.matrixIdentity();
            startPointMatrix = Utils.matrixTranslate(startPointMatrix, charState.x, charState.y);
            startPointMatrix = Utils.matrixScale(startPointMatrix, charState.size, charState.size);
            const finalStartX = startPointMatrix.a * startX + startPointMatrix.c * startY + startPointMatrix.tx;
            const finalStartY = startPointMatrix.b * startX + startPointMatrix.d * startY + startPointMatrix.ty;

            const ikResult = Utils.solve2LinkIK(finalStartX, finalStartY, targetWorldPt.x, targetWorldPt.y, len1, len2, poseProps.preferBendClockwise);

            // Convert world angles back to local rotations for parts
            // Parent's rotation in world space (rotation of the frame UL is attached to)
            const parentActualRotationRad = Utils.getRotationFromMatrix(ulParentWorldMatrix);

            const ulAngleWorldRad = Math.atan2(ikResult.elbow.y - finalStartY, ikResult.elbow.x - finalStartX);
            const llAngleWorldRad = Math.atan2(ikResult.hand.y - ikResult.elbow.y, ikResult.hand.x - ikResult.elbow.x);

            ulState.poseTransform.rotation = Utils.radToDeg(ulAngleWorldRad - parentActualRotationRad);
            // Lower limb's rotation is relative to the new orientation of the upper limb
            llState.poseTransform.rotation = Utils.radToDeg(llAngleWorldRad - ulAngleWorldRad);
            
            // Effector (hand) typically aligns with the lower limb, but can have its own offset if needed.
            // For simplicity, assume hand aligns with lower arm, or has a fixed relative rotation.
            // If hand has its own desired rotation (e.g. from pose), it might be overridden or added.
            // Here, we assume IK dictates hand's base rotation through lower arm.
            // The original had: effectorPartState.poseTransform.rotation = llState.poseTransform.rotation;
            // This might be too simplistic if hand has an independent base rotation in the pose.
            // Let's keep it for now: IK drives the chain.
            if (effectorPartState.poseTransform) {
                 effectorPartState.poseTransform.rotation = llState.poseTransform.rotation; // Or add to an existing base rotation
            }
        }
    }

    _calculateAllPartTransforms(charState) { // baseScale removed, currentDimensions are already set
        const template = Animator.GlobalData.CHARACTER_TEMPLATES[charState.templateId];
        if (!template) return;

        const calculateRecursive = (partId, parentWorldMatrix) => {
            const pState = charState.parts[partId];
            if (!pState || !pState.visible || !pState.effectiveDefinition || !pState.currentDimensions) {
                 if (pState && pState.visible && !pState.currentDimensions) console.warn(`Part ${partId} visible but no currentDimensions.`);
                 return;
            }
            const effDef = pState.effectiveDefinition;
            const pDim = pState.currentDimensions;

            let anchorMatrix = Utils.matrixIdentity();
            if (effDef.parentId) {
                 const parentState = charState.parts[effDef.parentId];
                 if (parentState && parentState.currentDimensions) { // Check parent has dimensions
                    const parentDim = parentState.currentDimensions;
                    anchorMatrix = Utils.matrixTranslate(anchorMatrix,
                        (effDef.anchorToParent.x || 0.5) * parentDim.w,
                        (effDef.anchorToParent.y || 0.5) * parentDim.h
                    );
                 } else if (parentState) {
                    // console.warn(`Parent part ${effDef.parentId} of ${partId} missing currentDimensions.`);
                 }
            }
            
            let localMatrix = Utils.matrixIdentity();
            localMatrix = Utils.matrixTranslate(localMatrix, -(effDef.pivot.x || 0.5) * pDim.w, -(effDef.pivot.y || 0.5) * pDim.h);
            localMatrix = Utils.matrixTranslate(localMatrix, pState.poseTransform?.x || 0, pState.poseTransform?.y || 0);
            const totalLocalRotDeg = (pState.poseTransform?.rotation || 0) + (pState.proceduralRotation || 0);
            localMatrix = Utils.matrixRotate(localMatrix, Utils.degToRad(totalLocalRotDeg));
            localMatrix = Utils.matrixTranslate(localMatrix, (effDef.pivot.x || 0.5) * pDim.w, (effDef.pivot.y || 0.5) * pDim.h);

            pState.worldMatrix = Utils.matrixMultiply(parentWorldMatrix, anchorMatrix);
            pState.worldMatrix = Utils.matrixMultiply(pState.worldMatrix, localMatrix);
            
            // Recursively calculate for children. Iterate over template definition to ensure order.
            template.parts.forEach(childDef => {
                if (childDef.parentId === partId) {
                    calculateRecursive(childDef.id, pState.worldMatrix);
                }
            });
        };
        
        let charRootMatrix = Utils.matrixIdentity(); // Base matrix for the character (e.g. for root motion)
        charRootMatrix = Utils.matrixTranslate(charRootMatrix, 0, charState.rootMotionYOffset);

        // Start recursion for root parts (those without a parentId)
        template.parts.forEach(pDef => {
            if (!pDef.parentId) {
                calculateRecursive(pDef.id, charRootMatrix);
            }
        });
    }

    // --- EVENT HANDLING --- (processNext, _initiateEvent, _finalizeEvent, _checkCompletion, _applyCameraEvent)
    processNextEventGroup() { /* Same logic as before */
        if (this.currentEventGroupIndex >= this.eventTimeline.length - 1) {
            if (this.animationData?.scene?.loop) { this.restartAnimationPrerequisites(); }
            else { this.ui.statusDiv.textContent = "Animation finished."; this.stopAnimation(); return; }
        }
        this.currentEventGroupIndex++; this.activeEventGroup = this.eventTimeline[this.currentEventGroupIndex];
        this.activeEventGroupStatus = {};
        if (!this.activeEventGroup?.length) { if (this.isPlaying) this.processNextEventGroup(); return; }

        this.ui.statusDiv.textContent = `Group ${this.currentEventGroupIndex + 1}/${this.eventTimeline.length}`;
        this.activeEventGroup.forEach(event => {
            this.activeEventGroupStatus[event._instanceId] = { completed: false, startTime: this.currentTime };
            this._initiateEvent(event);
        });
        this._checkActiveEventGroupCompletion(); // Check for instant completions
    }

    _initiateEvent(event) { /* Modified for new events */
        const status = this.activeEventGroupStatus[event._instanceId];
        status.type = event.duration !== undefined ? 'timed' : (event.type === 'dialogue' && event.speak ? 'tts' : 'instant');
        if(status.type === 'timed' && event.duration > 0) status.duration = event.duration;
        else if (status.type === 'timed' && (!event.duration || event.duration <=0)) status.type = 'instant'; // Treat 0-duration timed as instant


        const char = event.characterId ? this.charactersState[event.characterId] : null;
        const obj = event.objectId ? this.objectsState[event.objectId] : null;

        switch (event.type) {
            case 'pose':
                if(char){ char.previousPoseName=char.activePoseName; char.activePoseName=event.poseName; char.poseTransitionProgress=0; char.poseTransitionDuration = event.transitionDuration ?? char.poseTransitionDuration; if(char.poseTransitionDuration<=0.01) char.poseTransitionProgress=1;}
                if(status.type==='instant' || (char && char.poseTransitionDuration<=0.01)) status.completed=true; else if(!status.duration && char) status.duration = char.poseTransitionDuration; break;
            case 'expression':
                if(char){ char.previousExpressionName=char.activeExpressionName; char.activeExpressionName=event.expressionName; char.expressionTransitionProgress=0; char.expressionTransitionDuration = event.transitionDuration ?? char.expressionTransitionDuration; if(char.expressionTransitionDuration<=0.01)char.expressionTransitionProgress=1;}
                if(status.type==='instant' || (char && char.expressionTransitionDuration<=0.01)) status.completed=true; else if(!status.duration && char) status.duration = char.expressionTransitionDuration; break;
            case 'walk':
                if(char && event.targetPosition){ char.walkStartX=char.x; char.walkStartY=char.y; char.targetX=event.targetPosition.x; char.targetY=event.targetPosition.y; char.walkStartTime=this.currentTime; char.walkDuration=event.duration; status.duration=event.duration;
                    if(event.facing){char.facingDirection=event.facing; if(event.facingMode)char.facingMode=event.facingMode;} else {const dX=char.targetX-char.x; if(Math.abs(dX)>1)char.facingDirection=dX>0?'right':'left';}
                } else { status.completed=true; } break;
            case 'dialogue': // Same as before
                if(char && event.text){ char.dialogueText=event.text; char.isSpeakingTTS=false; status.duration = event.duration || (event.text.length*0.07); 
                    if(this.speechSynthesis && event.speak && this.availableVoices.length){ this.speechSynthesis.cancel();
                        const utt = new SpeechSynthesisUtterance(event.text); char.ttsUtterance = utt;
                        const voice = (event.voiceName && this.availableVoices.find(v=>v.name===event.voiceName)) || (event.voiceLang && this.availableVoices.find(v=>v.lang.startsWith(event.voiceLang)));
                        if(voice)utt.voice=voice; utt.pitch=event.pitch||1; utt.rate=event.rate||1; char.isSpeakingTTS=true; status.type='tts';
                        utt.onend = () => { if(this.activeEventGroupStatus[event._instanceId]===status){status.completed=true; this._finalizeEvent(event); this._checkActiveEventGroupCompletion();} char.isSpeakingTTS=false; char.dialogueText=null;};
                        utt.onerror = (e_tts) => { console.error("TTS Error:",e_tts); if(this.activeEventGroupStatus[event._instanceId]===status){status.completed=true;this._finalizeEvent(event);this._checkActiveEventGroupCompletion();} char.isSpeakingTTS=false; char.dialogueText=null;};
                        this.speechSynthesis.speak(utt);
                    } else { if(status.type !== 'tts') status.completed = (status.duration <=0); } 
                } else { status.completed=true; } break;
            case 'camera': this._applyCameraEvent(event,false); if(event.duration && event.duration > 0) status.duration=event.duration; else status.completed=true; break;
            case 'attachObject': // NEW
                if (char && obj && event.hand) { // hand: 'L' or 'R'
                    char.attachedObject = { objectId: obj.id, hand: event.hand, localOffset: event.offset }; // offset is {x,y,rot} relative to hand
                    obj.isAttachedTo = { characterId: char.id, hand: event.hand };
                    // This is an instant action
                    status.completed = true;
                } else { status.completed = true; }
                break;
            case 'detachObject': // NEW
                 if (char && char.attachedObject) {
                    const oldObj = this.objectsState[char.attachedObject.objectId];
                    if (oldObj) oldObj.isAttachedTo = null;
                    char.attachedObject = null;
                    status.completed = true;
                } else { status.completed = true; }
                break;
            default: status.completed = true; break;
        }
         // If an event was determined to be instant from the start and has no explicit duration from logic above
        if (status.type === 'instant' && !status.duration) {
            status.completed = true;
        }
    }
    _finalizeEvent(event) { /* Modified for new events */
        const char = event.characterId ? this.charactersState[event.characterId] : null;
        switch(event.type){
            case 'pose': if(char && (char.poseTransitionDuration<=0.01 || event.transitionDuration <=0.01) ) char.poseTransitionProgress=1; break;
            case 'expression': if(char && (char.expressionTransitionDuration<=0.01 || event.transitionDuration <=0.01)) char.expressionTransitionProgress=1; break;
            case 'walk': if(char && event.targetPosition){char.x=char.targetX; char.y=char.targetY; char.walkDuration=0;} break;
            case 'dialogue': if(char && !char.isSpeakingTTS) char.dialogueText=null; break;
            case 'camera': if(event.duration) this._applyCameraEvent(event,true); break;
            // attach/detach are instant, no finalization needed beyond _initiateEvent
        }
    }
    _checkActiveEventGroupCompletion() { /* Same logic as before */
        if(!this.activeEventGroup) return; let allDone=true;
        for(const event of this.activeEventGroup){ const status = this.activeEventGroupStatus[event._instanceId];
            if(!status || status.completed) continue;
            if(status.type === 'timed' && this.currentTime >= status.startTime + status.duration){ status.completed=true; this._finalizeEvent(event); }
            if(status.type === 'tts' && !status.completed && this.charactersState[event.characterId]?.isSpeakingTTS === false && this.currentTime > status.startTime + 0.2){ 
                 status.completed = true; this._finalizeEvent(event);
            }
            if(!status.completed) allDone=false;
        }
        if(allDone){ this.activeEventGroup=null; if(this.isPlaying) this.processNextEventGroup(); else { this.ui.statusDiv.textContent = `Group ${this.currentEventGroupIndex + 1} done. Paused.`; this.drawScene(); /* final draw on pause */}}
    }
    _applyCameraEvent(event, immediate) { /* Same logic as before */
        let explicitPan = false;
        if (event.panTarget) { this.cameraState.targetWorldX = event.panTarget.x; this.cameraState.targetWorldY = event.panTarget.y; explicitPan = true;}
        if (event.zoomTarget !== undefined) this.cameraState.targetZoom = event.zoomTarget;
        if (event.focusEntityIds) { this.cameraState.focusEntityIds = Array.isArray(event.focusEntityIds) ? event.focusEntityIds : [event.focusEntityIds]; explicitPan=false;}
        else if (event.panToEntity && !explicitPan) { const ent = this.charactersState[event.panToEntity]; if(ent){this.cameraState.targetWorldX = ent.x; this.cameraState.targetWorldY = ent.y;} }
        
        if(!explicitPan && this.cameraState.focusEntityIds.length > 0) this._calculateCameraFocusTarget();
        
        if(immediate){this.cameraState.worldX=this.cameraState.targetWorldX; this.cameraState.worldY=this.cameraState.targetWorldY; this.cameraState.zoom=this.cameraState.targetZoom;}
    }
    _calculateCameraFocusTarget() { /* Same logic as before */
        if (!this.cameraState.focusEntityIds?.length) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, count = 0;
        this.cameraState.focusEntityIds.forEach(id => { 
            const char = this.charactersState[id]; // Could extend to focus on objects too
            if(!char || !char.templateId)return;
            const t = Animator.GlobalData.CHARACTER_TEMPLATES[char.templateId]; 
            if (!t) return;
            const h=t.baseHeight*char.size; const w=(t.parts.find(p=>p.id==='torso')?.dimensions.wFactor || 0.3)*h;
            minX=Math.min(minX,char.x-w/2); maxX=Math.max(maxX,char.x+w/2); minY=Math.min(minY,char.y-h); maxY=Math.max(maxY,char.y); count++;
        });
        if(count>0){ this.cameraState.targetWorldX=(minX+maxX)/2; const bH=maxY-minY; this.cameraState.targetWorldY=(minY+maxY)/2 + bH*this.cameraState.verticalFocusBias;
            const pad=0.25; const reqW=(maxX-minX)*(1+pad*2); const reqH=bH*(1+pad*2);
            if(reqW>0 && reqH>0) this.cameraState.targetZoom = Math.min(this.canvas.width/reqW, this.canvas.height/reqH);
        }
    }

    // --- DRAWING ---
    drawScene() {
        this.ctx.fillStyle = this.animationData?.scene?.backgroundColor || this.canvas.style.backgroundColor || "#F0F8FF";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height); if(!this.animationData)return;

        // Collect all drawable entities
        let entitiesToDraw = [];
        Object.values(this.charactersState).forEach(c => entitiesToDraw.push({type:'character', entity:c, sortY:c.y, layerName:c.layer}));
        Object.values(this.objectsState).forEach(o => entitiesToDraw.push({type:'object', entity:o, sortY:o.y, layerName:o.layer}));

        this.sceneLayers.forEach(layerCfg => {
            const layerEnts = entitiesToDraw.filter(it=>it.layerName===layerCfg.name).sort((a,b)=>a.sortY-b.sortY);
            this.ctx.save(); const cam=this.cameraState; const par=layerCfg.parallaxFactor??1.0;
            this.ctx.translate(this.canvas.width/2,this.canvas.height/2); this.ctx.scale(cam.zoom,cam.zoom); this.ctx.translate(-cam.worldX*par, -cam.worldY*par);
            
            layerEnts.forEach(item => {
                if (item.type === 'character') this._drawCharacter(item.entity);
                else if (item.type === 'object') this._drawObject(item.entity);
            });
            this.ctx.restore();
        });

        // Draw UI elements like speech bubbles in screen space (on top)
        this.ctx.save();
        Object.values(this.charactersState).forEach(c => { if(c.dialogueText) this._drawSpeechBubbleScreenSpace(c); });
        this.ctx.restore();
    }

    _drawCharacter(charState) {
        const template = Animator.GlobalData.CHARACTER_TEMPLATES[charState.templateId];
        if (!template) return;
        this.ctx.save();
        this.ctx.translate(charState.x, charState.y); // Character's root position in world
        this.ctx.scale(charState.size, charState.size); // Character's global scale

        const partsToDraw = Object.values(charState.parts).filter(p=>p.visible && p.worldMatrix && p.currentDimensions).sort((a,b)=>(a.zIndex||0)-(b.zIndex||0));
        
        partsToDraw.forEach(pState => {
            if(!pState.effectiveDefinition || !pState.effectiveDefinition.shape) {
                // console.warn(`Part ${pState.definition.id} of ${charState.id} missing effective shape.`);
                return;
            }
            this.ctx.save();
            Utils.applyMatrixToContext(this.ctx, pState.worldMatrix); // This matrix is relative to character root
            
            const shapeDef = pState.effectiveDefinition.shape;
            const renderer = Animator.GlobalData.SHAPE_RENDERERS[shapeDef.type];
            
            if(renderer && pState.currentDimensions.w > 0 && pState.currentDimensions.h > 0){ // Ensure valid dimensions
                const style = {
                    fill: shapeDef.fill, // Already resolved color string or palette key
                    stroke: shapeDef.stroke || pState.effectiveDefinition.stroke || template.palette.outlineColor,
                    lineWidth: (pState.effectiveDefinition.lineWidthFactor || 0.01) * template.baseHeight * 0.07,
                    color: shapeDef.color, // For things like mouth lines
                    pupilFill: shapeDef.pupilFill,
                    baseScale: template.baseHeight // For calculations within renderer (e.g. pupil size)
                };
                 // Resolve colors from palette again if they are still keys (e.g. outlineColor from template)
                ['fill', 'stroke', 'color', 'pupilFill'].forEach(prop => {
                    if (style[prop] && typeof style[prop] === 'string' && charState.palette[style[prop]]) {
                        style[prop] = charState.palette[style[prop]];
                    }
                });

                renderer(this.ctx, shapeDef, style, pState.currentDimensions.w, pState.currentDimensions.h, pState.computedParams);
            } else if (!renderer) {
                // console.warn(`No renderer for shape type: ${shapeDef.type}`);
            }
            this.ctx.restore();
        });
        this.ctx.restore();
    }

    _drawObject(objState) {
        const template = objState.definition; // Already a copy of the template
        if (!template || !objState.worldMatrix) return;

        this.ctx.save();
        // objState.worldMatrix is already the full world transform for the object
        Utils.applyMatrixToContext(this.ctx, objState.worldMatrix);

        const shapeDef = template.shape;
        const renderer = Animator.GlobalData.SHAPE_RENDERERS[shapeDef.type];
        if (renderer && objState.currentDimensions.w > 0 && objState.currentDimensions.h > 0) {
            const style = {
                fill: objState.palette[shapeDef.fill] || shapeDef.fill || 'gray',
                stroke: objState.palette[shapeDef.stroke] || shapeDef.stroke || 'black',
                lineWidth: shapeDef.lineWidth || 2,
                // baseScale might not be relevant for objects unless their parts scale like characters
                baseScale: 100 // Arbitrary default if needed by a renderer
            };
            renderer(this.ctx, shapeDef, style, objState.currentDimensions.w, objState.currentDimensions.h, {});
        }
        this.ctx.restore();
    }

    _drawSpeechBubbleScreenSpace(charState) { /* Same as before, uses this.speechBubbleConfig */
        const head = charState.parts['head'];
        if(!head?.visible || !charState.dialogueText || !head.worldMatrix || !head.currentDimensions) return;

        // Transform head's origin (which is relative to char root) to full world space, then to screen space
        let headMatrixRelativeToChar = head.worldMatrix;
        let headFullWorldMatrix = Utils.matrixIdentity();
        headFullWorldMatrix = Utils.matrixTranslate(headFullWorldMatrix, charState.x, charState.y);
        headFullWorldMatrix = Utils.matrixScale(headFullWorldMatrix, charState.size, charState.size);
        headFullWorldMatrix = Utils.matrixMultiply(headFullWorldMatrix, headMatrixRelativeToChar);
        
        // Anchor point on head, e.g. top-center of head's bounding box in its local space
        const localAnchorY = -head.currentDimensions.h * 0.1; // A bit above the head's pivot y (usually center-ish)
        const headAnchorWorld = Utils.transformPoint({x: 0, y: localAnchorY }, headFullWorldMatrix);
        const anchorScreen = this._worldToScreen(headAnchorWorld.x, headAnchorWorld.y);

        const metrics = this._calculateSpeechBubbleScreenMetrics(charState, anchorScreen.x, anchorScreen.y);
        if(!metrics) return;

        const cfg = this.speechBubbleConfig; const ctx = this.ctx; ctx.save();
        ctx.fillStyle=cfg.bgColor; ctx.strokeStyle=cfg.borderColor; ctx.lineWidth=1.5;
        if(cfg.shadow){ctx.shadowColor=cfg.shadow.color;ctx.shadowBlur=cfg.shadow.blur;ctx.shadowOffsetX=cfg.shadow.offsetX;ctx.shadowOffsetY=cfg.shadow.offsetY;}
        
        ctx.beginPath();
        ctx.moveTo(metrics.rectX + metrics.radius, metrics.rectY);
        ctx.lineTo(metrics.rectX + metrics.rectWidth - metrics.radius, metrics.rectY);
        ctx.arcTo(metrics.rectX + metrics.rectWidth, metrics.rectY, metrics.rectX + metrics.rectWidth, metrics.rectY + metrics.radius, metrics.radius);

        if (metrics.pointerSide === 'bottom') {
            ctx.lineTo(metrics.rectX + metrics.rectWidth, metrics.rectY + metrics.rectHeight - metrics.radius - (metrics.onRightHalf ? 0 : metrics.pointerHeight)); // To before pointer base start (if pointer on left of corner)
             if (!metrics.onRightHalf && metrics.pointerBaseCenterX > metrics.rectX + metrics.radius && metrics.pointerBaseCenterX < metrics.rectX + metrics.rectWidth - metrics.radius) { // Pointer not at corner
                ctx.lineTo(metrics.pointerBaseCenterX + metrics.pointerWidth / 2, metrics.rectY + metrics.rectHeight);
                ctx.lineTo(metrics.pointerTipX, metrics.pointerTipY);
                ctx.lineTo(metrics.pointerBaseCenterX - metrics.pointerWidth / 2, metrics.rectY + metrics.rectHeight);
            }
            ctx.lineTo(metrics.rectX + metrics.rectWidth, metrics.rectY + metrics.rectHeight - metrics.radius); // To after pointer base end
            ctx.arcTo(metrics.rectX + metrics.rectWidth, metrics.rectY + metrics.rectHeight, metrics.rectX + metrics.rectWidth - metrics.radius, metrics.rectY + metrics.rectHeight, metrics.radius);
            ctx.lineTo(metrics.rectX + metrics.radius, metrics.rectY + metrics.rectHeight);
            if (metrics.onRightHalf && metrics.pointerBaseCenterX > metrics.rectX + metrics.radius && metrics.pointerBaseCenterX < metrics.rectX + metrics.rectWidth - metrics.radius) { // Pointer not at corner
                 ctx.lineTo(metrics.pointerBaseCenterX + metrics.pointerWidth / 2, metrics.rectY + metrics.rectHeight);
                 ctx.lineTo(metrics.pointerTipX, metrics.pointerTipY);
                 ctx.lineTo(metrics.pointerBaseCenterX - metrics.pointerWidth / 2, metrics.rectY + metrics.rectHeight);
            }
        } else { // Top pointer (simplified for brevity, assuming pointer not at corner for now)
            ctx.lineTo(metrics.rectX + metrics.rectWidth, metrics.rectY + metrics.pointerHeight + metrics.radius);
            ctx.arcTo(metrics.rectX + metrics.rectWidth, metrics.rectY + metrics.pointerHeight, metrics.rectX + metrics.rectWidth - metrics.radius, metrics.rectY + metrics.pointerHeight, metrics.radius);

            if (metrics.pointerBaseCenterX > metrics.rectX + metrics.radius && metrics.pointerBaseCenterX < metrics.rectX + metrics.rectWidth - metrics.radius) {
                ctx.lineTo(metrics.pointerBaseCenterX + metrics.pointerWidth / 2, metrics.rectY + metrics.pointerHeight);
                ctx.lineTo(metrics.pointerTipX, metrics.pointerTipY);
                ctx.lineTo(metrics.pointerBaseCenterX - metrics.pointerWidth / 2, metrics.rectY + metrics.pointerHeight);
            }
             ctx.lineTo(metrics.rectX + metrics.radius, metrics.rectY + metrics.pointerHeight); // Line to start of top left arc
        }
        // Common for both top/bottom pointer regarding left side
        ctx.arcTo(metrics.rectX, metrics.rectY + (metrics.pointerSide === 'top' ? metrics.pointerHeight : 0) + (metrics.pointerSide === 'bottom' ? metrics.rectHeight - metrics.radius: metrics.radius) , metrics.rectX, metrics.rectY + (metrics.pointerSide === 'top' ? metrics.pointerHeight : 0) + metrics.radius, metrics.radius);
        ctx.lineTo(metrics.rectX, metrics.rectY + metrics.radius + (metrics.pointerSide === 'top' ? metrics.pointerHeight : 0));
        ctx.arcTo(metrics.rectX, metrics.rectY + (metrics.pointerSide === 'top' ? metrics.pointerHeight : 0), metrics.rectX + metrics.radius, metrics.rectY + (metrics.pointerSide === 'top' ? metrics.pointerHeight : 0), metrics.radius);

        ctx.closePath(); ctx.fill(); ctx.shadowColor="transparent"; ctx.stroke();
        ctx.fillStyle=cfg.textColor;ctx.font=`${cfg.fontSizeScreen}px ${cfg.fontFamily}`;ctx.textAlign="left";ctx.textBaseline="top";
        metrics.lines.forEach((ln,idx)=>ctx.fillText(ln,metrics.textX,metrics.textY+idx*metrics.lineHeight));
        ctx.restore();
    }
    _calculateSpeechBubbleScreenMetrics(charState, anchorX, anchorY) { /* Same as before */
        const cfg=this.speechBubbleConfig; this.ctx.font=`${cfg.fontSizeScreen}px ${cfg.fontFamily}`;
        const lines=this._wrapTextScreen(charState.dialogueText, this.canvas.width*cfg.maxWidthScreenFactor-2*cfg.paddingScreen); if(!lines.length)return null;
        const lh=cfg.fontSizeScreen*cfg.lineHeightFactor; const th=lines.length*lh-(lh-cfg.fontSizeScreen); // Text height
        const tw=Math.max(...lines.map(l=>this.ctx.measureText(l).width)); // Max text width
        const bw=Math.max(cfg.minWidthScreen,tw+2*cfg.paddingScreen); // Bubble width
        const bh=th+2*cfg.paddingScreen; // Bubble height (text part)
        const ph=cfg.pointerHeightScreen; const pw=cfg.pointerWidthScreen;
        let rx=anchorX-bw/2; let ry=anchorY-bh-ph-cfg.marginScreen.top; let ptx=anchorX; let pty=anchorY-cfg.marginScreen.top; let pbcx=anchorX; let ps='bottom'; // Pointer side
        if(rx<cfg.marginScreen.side)rx=cfg.marginScreen.side; if(rx+bw>this.canvas.width-cfg.marginScreen.side)rx=this.canvas.width-cfg.marginScreen.side-bw;
        pbcx=Utils.clamp(anchorX,rx+pw/2+cfg.cornerRadiusScreen,rx+bw-pw/2-cfg.cornerRadiusScreen); // Clamp pointer base center, respecting corners
        if(ry<cfg.marginScreen.top){ry=anchorY+cfg.marginScreen.bottom+ph;pty=anchorY+cfg.marginScreen.bottom;ps='top';} // If bubble goes off top, flip to bottom
        const onRH=pbcx > rx+bw/2; // Is pointer base on right half of bubble
        return {lines,lineHeight:lh,textX:rx+cfg.paddingScreen,textY:ry+cfg.paddingScreen+(ps==='top'?ph:0),rectX:rx,rectY:ry+(ps==='top'?ph:0),rectWidth:bw,rectHeight:bh,pointerTipX:ptx,pointerTipY:pty,pointerHeight:ph,pointerWidth:pw,pointerBaseCenterX:pbcx,radius:cfg.cornerRadiusScreen,pointerSide:ps,onRightHalf:onRH};
    }
    _wrapTextScreen(text, maxWidth) { /* Same */
        const words=text.split(' '); const lines=[]; if(!words.length||words[0]==='')return[]; let cur=words[0];
        for(let i=1;i<words.length;i++){const w=words[i]; if(this.ctx.measureText(cur+" "+w).width<maxWidth){cur+=" "+w;}else{lines.push(cur);cur=w;}}
        lines.push(cur); return lines;
    }
    _worldToScreen(worldX, worldY) { /* Same */ const c=this.cameraState; return {x:(worldX-c.worldX)*c.zoom+this.canvas.width/2, y:(worldY-c.worldY)*c.zoom+this.canvas.height/2};}

    exportAnimation() { /* Same as before */
        if(!this.animationData){this.ui.statusDiv.textContent="No data to export.";return;}
        let html=document.documentElement.outerHTML;
        const scriptContent = document.getElementById('mainAnimationScript').textContent;
        html = html.replace(/<script id="mainAnimationScript"[\s\S]*?>[\s\S]*?<\/script>/, `<script id="mainAnimationScript">${scriptContent.replace(/<\/script>/g,'<\\/script>')}<\/script>`);
        const animDataStr=JSON.stringify(this.animationData,null,2).replace(/<\/script>/g,'<\\/script>');
        if(html.match(/<script id="animationDataJson" type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/)){
            html=html.replace(/<script id="animationDataJson" type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/, `<script id="animationDataJson" type="application/json">${animDataStr}<\/script>`);
        } else { html=html.replace('</body>', `<script id="animationDataJson" type="application/json">${animDataStr}<\/script>\n</body>`); }
        const stylesMarker = '/* Exported player minimal style overrides */';
        const stylesContent = `body.exported-body{justify-content:center;align-items:center;min-height:100vh;padding-top:10px;} h1.exported-h1{margin-bottom:10px;font-size:1.6em;} #inputContainer.hidden-exported,#exportBtn.hidden-exported{display:none!important;} #playbackControlsContainer.full-width-exported{width:auto;max-width:${this.canvas.width}px;box-shadow:none;background-color:transparent;padding:10px 0;margin-bottom:10px;}`;
        if(!html.includes(stylesMarker)){
            if(html.match(/<\/style>/i)) html=html.replace(/<\/style>/i,`\n${stylesMarker}\n${stylesContent}\n<\/style>`);
            else html=html.replace('</head>',`<style>\n${stylesMarker}\n${stylesContent}\n</style>\n</head>`);
        }
        const blob=new Blob([html],{type:'text/html'}); const a=document.createElement('a');
        a.href=URL.createObjectURL(blob); a.download=`anim_phx_v1.3_${Date.now()}.html`;
        document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
        this.ui.statusDiv.textContent="Exported HTML.";
    }
}

Animator.GlobalData = {
    CHARACTER_TEMPLATES: {}, POSES: {}, EXPRESSIONS: {}, MOUTH_SHAPES: {},
    BEHAVIOR_HANDLERS: {}, SHAPE_RENDERERS: {}, OBJECT_TEMPLATES: {}
};

document.addEventListener('DOMContentLoaded', () => {
    const ui = { jsonInput: document.getElementById('jsonInput'), jsonFileUpload: document.getElementById('jsonFileUpload'), loadJsonBtn: document.getElementById('loadJsonBtn'), statusDiv: document.getElementById('status'), animationCanvas: document.getElementById('animationCanvas'), playbackControlsContainer: document.getElementById('playbackControlsContainer'), playStopBtn: document.getElementById('playStopBtn'), restartBtn: document.getElementById('restartBtn'), exportBtn: document.getElementById('exportBtn'), inputContainer: document.getElementById('inputContainer') };
    window.animatorInstance = new Animator(ui.animationCanvas, ui);
});