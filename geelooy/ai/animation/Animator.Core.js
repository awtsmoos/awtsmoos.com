//B"H
// Animator.Core.js (v1.9.1 - Refactored for Debugging + Ultra-Robust Position & Camera Focus)
// B"H

class Animator {
    constructor(canvasElement, uiElements) {
        this.canvas = canvasElement; this.ctx = this.canvas.getContext('2d'); this.ui = uiElements;
        if (!window.AnimatorData || !window.AnimatorUtils || !window.AnimatorCharacterPipeline ||
            !window.AnimatorSceneDrawing || !window.AnimatorSpeech ||
            !window.AnimatorCore_DataHandler || !window.AnimatorCore_CameraControls ||
            !window.AnimatorCore_EventProcessor || !window.AnimatorCore_StateManagement) {
            const errorMsg = "FATAL ERROR: One or more core script components not loaded! Check script include order and new module names.";
            console.error(errorMsg); if (this.ui.statusDiv) this.ui.statusDiv.textContent = errorMsg; throw new Error(errorMsg);
        }
        this.DATA = window.AnimatorData; this.UTILS = window.AnimatorUtils;
        this.CHAR_PIPELINE = window.AnimatorCharacterPipeline; this.SCENE_DRAWING = window.AnimatorSceneDrawing;
        this.SPEECH = window.AnimatorSpeech;
        
        // New Modules
        this.DATA_HANDLER = window.AnimatorCore_DataHandler;
        this.CAMERA_CONTROLS = window.AnimatorCore_CameraControls;
        this.EVENT_PROCESSOR = window.AnimatorCore_EventProcessor;
        this.STATE_MGMT = window.AnimatorCore_StateManagement;

        this.DATA.SHAPE_RENDERERS = { ...this.UTILS._defaultShapeRenderers, ...this.DATA.SHAPE_RENDERERS };
        this.DATA.BEHAVIOR_HANDLERS = { ...this.UTILS._defaultBehaviorHandlers, ...this.DATA.BEHAVIOR_HANDLERS };

        this.isPlaying = false; this.animationFrameId = null; this.lastTimestamp = 0; this.currentTime = 0;
        this.eventTimeline = []; this.currentEventGroupIndex = -1; this.activeEventGroup = null; this.activeEventGroupStatus = {};
        this.charactersState = {}; this.objectsState = {};
        // Initial camera state values - these will be properly set by loadAnimation
        this.cameraState = {
            worldX: 0, worldY: 0, zoom: 1,
            targetWorldX: 0, targetWorldY: 0, targetZoom: 1,
            focusEntityIds: [], panSpeed: 0.08, zoomSpeed: 0.08,
            lerpThreshold: 0.01, zoomThreshold: 0.0001,
            minZoom: 0.1, maxZoom: 5.0, verticalFocusBias: 0.15
        };
        this.sceneLayers = []; this.defaultLayerName = 'main';

        this.SPEECH.initialize((statusMsg) => {
            if (this.ui.statusDiv && !this.animationData) this.ui.statusDiv.textContent = statusMsg + " Load JSON to begin.";
        });
        this._bindUIEvents();
        this.DATA_HANDLER._checkForEmbeddedData(this); // Use DATA_HANDLER
    }

    _bindUIEvents() {
        this.ui.loadJsonBtn.addEventListener('click', () => this.DATA_HANDLER.loadJsonFromTextarea(this));
        this.ui.jsonFileUpload.addEventListener('change', (e) => this.DATA_HANDLER.loadJsonFromFile(this, e));
        this.ui.playStopBtn.addEventListener('click', () => this.togglePlayStop());
        this.ui.restartBtn.addEventListener('click', () => this.restartAnimation());
        this.ui.exportBtn.addEventListener('click', () => this.exportAnimation());
    }
    
    // loadAnimation, _initializeCharacterState, _initializeObjectState, _resolvePalette, _checkForEmbeddedData, restartAnimationPrerequisites
    // are now in Animator.DataHandler.js

    // _updateCamera, _calculateCameraFocusTarget, _applyCameraEvent
    // are now in Animator.CameraControls.js

    // processNextEventGroup, _initiateEvent, _finalizeEvent, _checkActiveEventGroupCompletion
    // are now in Animator.EventProcessor.js
    
    // _updateState, _updateObjectState
    // are now in Animator.StateManagement.js

    togglePlayStop() { if (!this.animationData) return; this.isPlaying ? this.stopAnimation() : this.playAnimation(); }

    playAnimation() {
        if (!this.animationData || this.isPlaying) return;
        this.isPlaying = true;
        this.ui.playStopBtn.textContent = "Stop";
        if (this.currentEventGroupIndex === -1 || this.currentEventGroupIndex >= this.eventTimeline.length) {
            console.log("[ANIM_DEBUG_FLOW] playAnimation: Restarting prerequisites due to timeline position.");
            this.DATA_HANDLER.restartAnimationPrerequisites(this);
        }
        this.lastTimestamp = performance.now();
        if (!this.activeEventGroup && this.currentEventGroupIndex < this.eventTimeline.length -1 ) { // Check condition
             console.log("[ANIM_DEBUG_FLOW] playAnimation: No active event group, processing next.");
            this.EVENT_PROCESSOR.processNextEventGroup(this);
        }
        if (!this.animationFrameId) {
            console.log("[ANIM_DEBUG_FLOW] playAnimation: Starting animation loop.");
            this.animationLoop();
        }
    }

    stopAnimation() {
        this.isPlaying = false;
        this.ui.playStopBtn.textContent = "Play";
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log("[ANIM_DEBUG_FLOW] stopAnimation: Cancelled animation frame.");
        }
        this.SPEECH.cancel();
        Object.values(this.charactersState).forEach(cs => { cs.isSpeakingTTS = false; cs.ttsUtterance = null; });
        if (this.animationData) this.SCENE_DRAWING.drawScene(this);
    }

    restartAnimation() {
        if (!this.animationData) return;
        const wasPlaying = this.isPlaying;
        console.log(`[ANIM_DEBUG_FLOW] restartAnimation: Initiated. Was playing: ${wasPlaying}`);
        this.stopAnimation();
        this.DATA_HANDLER.restartAnimationPrerequisites(this);
        this.SCENE_DRAWING.drawScene(this);
        if (wasPlaying) setTimeout(() => this.playAnimation(), 50);
    }

    animationLoop() {
        if (!this.animationData) {
            this.animationFrameId = null;
            console.log("[ANIM_DEBUG_FLOW] animationLoop: No animation data. Loop terminated.");
            return;
        }
        if (!this.isPlaying && (!this.activeEventGroup || Object.values(this.activeEventGroupStatus).every(s => s.completed))) {
            this.animationFrameId = null;
            this.SCENE_DRAWING.drawScene(this); // Final draw when paused and all events done
            // console.log("[ANIM_DEBUG_FLOW] animationLoop: Paused and active group completed. Loop terminated.");
            return;
        }
        const now = performance.now();
        const dt = this.UTILS.clamp((now - this.lastTimestamp) / 1000, 0, 0.1) || 0.016;
        this.lastTimestamp = now;
        if (this.isPlaying) this.currentTime += dt;

        // console.log(`[ANIM_DEBUG_FLOW] animationLoop: deltaTime=${dt.toFixed(4)}, currentTime=${this.currentTime.toFixed(2)}`);
        this.STATE_MGMT._updateState(this, dt);
        this.SCENE_DRAWING.drawScene(this);
        this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
    }


    exportAnimation() {
        // THIS FUNCTION IS NOT UPDATED FOR THE REFACTORING.
        // It will likely NOT work as expected because it doesn't know about the new JS files.
        // For debugging, this is less critical. If you need export to work, this needs significant changes.
        console.warn("Animator.Core.exportAnimation() has NOT been updated for the recent refactoring and may not work correctly.");
        if (!this.animationData) { this.ui.statusDiv.textContent = "No data to export."; return; }
        let html = document.documentElement.outerHTML;
        const scriptTagsToRemovePattern = /<script src="Animator\.(Data|Utils|CharacterPipeline|SceneDrawing|Speech|Core|DataHandler|CameraControls|EventProcessor|StateManagement)\.js"><\/script>\s*/g; // Added new files to pattern
        const coreScriptReplacementPattern = /<script src="Animator\.Core\.js"><\/script>\s*<!-- This is Animator.Core\.js -->/;


        const mainScriptContent = `
// --- Animator.Data.js ---
window.AnimatorData = ${JSON.stringify(this.DATA, null, 2)};

// --- Animator.Utils.js ---
window.AnimatorUtils = {${Object.entries(this.UTILS).map(([key, value]) => typeof value === 'function' ? `${key}: ${value.toString()}` : `${key}: ${JSON.stringify(value)}`).join(',\n')}};

// --- Animator.CharacterPipeline.js ---
window.AnimatorCharacterPipeline = {${Object.entries(this.CHAR_PIPELINE).map(([key, value]) => `${key}: ${value.toString()}`).join(',\n')}};

// --- Animator.SceneDrawing.js ---
window.AnimatorSceneDrawing = {${Object.entries(this.SCENE_DRAWING).map(([key, value]) => `${key}: ${value.toString()}`).join(',\n')}};

// --- Animator.Speech.js ---
window.AnimatorSpeech = {${Object.entries(this.SPEECH).map(([key, value]) => typeof value === 'function' ? `${key}: ${value.toString()}` : `${key}: ${JSON.stringify(value, (k, v) => (v instanceof Map ? Array.from(v.entries()) : v) )}`).join(',\n')}};
if(window.AnimatorSpeech._utterances && Array.isArray(window.AnimatorSpeech._utterances)) { window.AnimatorSpeech._utterances = new Map(window.AnimatorSpeech._utterances); }

// --- Animator.DataHandler.js (Example - needs real content if exporting) ---
window.AnimatorCore_DataHandler = { /* ... stringified AnimatorCore_DataHandler ... */ };
// --- Animator.CameraControls.js (Example) ---
window.AnimatorCore_CameraControls = { /* ... stringified AnimatorCore_CameraControls ... */ };
// --- Animator.EventProcessor.js (Example) ---
window.AnimatorCore_EventProcessor = { /* ... stringified AnimatorCore_EventProcessor ... */ };
// --- Animator.StateManagement.js (Example) ---
window.AnimatorCore_StateManagement = { /* ... stringified AnimatorCore_StateManagement ... */ };


// --- Animator.Core.js ---
${Animator.toString()}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => { 
    const ui = { 
        jsonInput: document.getElementById('jsonInput'), 
        jsonFileUpload: document.getElementById('jsonFileUpload'), 
        loadJsonBtn: document.getElementById('loadJsonBtn'), 
        statusDiv: document.getElementById('status'), 
        animationCanvas: document.getElementById('animationCanvas'), 
        playbackControlsContainer: document.getElementById('playbackControlsContainer'), 
        playStopBtn: document.getElementById('playStopBtn'), 
        restartBtn: document.getElementById('restartBtn'), 
        exportBtn: document.getElementById('exportBtn'), 
        inputContainer: document.getElementById('inputContainer') 
    }; 
    // This check needs to be updated for new modules if export is to work
    if (window.AnimatorData && window.AnimatorUtils && window.AnimatorCharacterPipeline && window.AnimatorSceneDrawing && window.AnimatorSpeech /* && New Modules */) { 
        window.animatorInstance = new Animator(ui.animationCanvas, ui); 
    } else { 
        ui.statusDiv.textContent = "ERROR: Core script components not loaded after export process."; 
        console.error("Export error: One or more Animator modules not found in global scope after script bundling.");
    } 
});`;

        html = html.replace(scriptTagsToRemovePattern, '');
        html = html.replace(coreScriptReplacementPattern, `<script id="mainAnimationScript">${mainScriptContent.replace(/<\/script>/g, '<\\/script>')}</script>`);
        if (!html.includes('<script id="mainAnimationScript">')) {
            html = html.replace('</body>', `<script id="mainAnimationScript">${mainScriptContent.replace(/<\/script>/g, '<\\/script>')}</script>\n</body>`);
        }
        
        const animDataStr=JSON.stringify(this.animationData,null,2).replace(/<\/script>/g,'<\\/script>'); 
        if(html.match(/<script id="animationDataJson" type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/)){ 
            html=html.replace(/<script id="animationDataJson" type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/, `<script id="animationDataJson" type="application/json">${animDataStr}<\/script>`); 
        } else { 
            html=html.replace('</body>', `<script id="animationDataJson" type="application/json">${animDataStr}<\/script>\n</body>`); 
        }
        
        const stylesMarker = '/* Exported player minimal style overrides */'; 
        const stylesContent = `body.exported-body{justify-content:center;align-items:center;min-height:100vh;padding-top:10px;} h1.exported-h1{margin-bottom:10px;font-size:1.6em;} #inputContainer.hidden-exported,#exportBtn.hidden-exported{display:none!important;} #playbackControlsContainer.full-width-exported{width:auto;max-width:${this.canvas.width}px;box-shadow:none;background-color:transparent;padding:10px 0;margin-bottom:10px;}`; 
        if(!html.includes(stylesMarker)){ 
            if(html.match(/<\/style>/i)) html=html.replace(/<\/style>/i,`\n${stylesMarker}\n${stylesContent}\n<\/style>`); 
            else html=html.replace('</head>',`<style>\n${stylesMarker}\n${stylesContent}\n</style>\n</head>`); 
        }
        
        const blob=new Blob([html],{type:'text/html'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`anim_phx_v1.9.1_refactored_${Date.now()}.html`; document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href); this.ui.statusDiv.textContent="Exported HTML (Warning: Export function is not fully updated for refactoring).";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = { jsonInput: document.getElementById('jsonInput'), jsonFileUpload: document.getElementById('jsonFileUpload'), loadJsonBtn: document.getElementById('loadJsonBtn'), statusDiv: document.getElementById('status'), animationCanvas: document.getElementById('animationCanvas'), playbackControlsContainer: document.getElementById('playbackControlsContainer'), playStopBtn: document.getElementById('playStopBtn'), restartBtn: document.getElementById('restartBtn'), exportBtn: document.getElementById('exportBtn'), inputContainer: document.getElementById('inputContainer') };
    
    // Ensure all new modules are also checked here
    if (window.AnimatorData && window.AnimatorUtils && window.AnimatorCharacterPipeline && 
        window.AnimatorSceneDrawing && window.AnimatorSpeech &&
        window.AnimatorCore_DataHandler && window.AnimatorCore_CameraControls &&
        window.AnimatorCore_EventProcessor && window.AnimatorCore_StateManagement) { 
        window.animatorInstance = new Animator(ui.animationCanvas, ui);
        console.log("[ANIM_DEBUG_FLOW] Animator instance created successfully with all modules.");
    } else {
        ui.statusDiv.textContent = "ERROR: Core script components not loaded. Check console and ensure ALL Animator modules are included correctly in your HTML.";
        console.error("One or more core Animator modules (Data, Utils, CharacterPipeline, SceneDrawing, Speech, DataHandler, CameraControls, EventProcessor, StateManagement) not found. Script load order is critical.");
    }
});