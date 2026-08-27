//B"H
// Animator.Core.js (v2.0 - Enhanced Features & Modularity)

class Animator {
    constructor(canvasElement, uiElements) {
        this.canvas = canvasElement; this.ctx = this.canvas.getContext('2d'); this.ui = uiElements;
        // Ensure all modules are loaded
        const modules = [
            "AnimatorData", "AnimatorUtils", "AnimatorCharacterPipeline", "AnimatorObjectPipeline",
            "AnimatorSceneDrawing", "AnimatorSpeech", "AnimatorSFX",
            "AnimatorCore_DataHandler", "AnimatorCore_CameraControls",
            "AnimatorCore_EventProcessor", "AnimatorCore_StateManagement"
        ];
        modules.forEach(m => {
            if (!window[m]) {
                const errorMsg = `FATAL ERROR: Core script component ${m} not loaded!`;
                console.error(errorMsg); if (this.ui.statusDiv) this.ui.statusDiv.textContent = errorMsg; throw new Error(errorMsg);
            }
        });

        this.DATA_RAW = window.AnimatorData; // Raw, unchanging data definitions
        this.DATA = JSON.parse(JSON.stringify(this.DATA_RAW)); // Active data, can be merged with scene specific
        this.UTILS = window.AnimatorUtils;
        this.CHAR_PIPELINE = window.AnimatorCharacterPipeline;
        this.OBJECT_PIPELINE = window.AnimatorObjectPipeline; // NEW
        this.SCENE_DRAWING = window.AnimatorSceneDrawing;
        this.SPEECH = window.AnimatorSpeech;
        this.SFX = window.AnimatorSFX; // NEW
        
        this.DATA_HANDLER = window.AnimatorCore_DataHandler;
        this.CAMERA_CONTROLS = window.AnimatorCore_CameraControls;
        this.EVENT_PROCESSOR = window.AnimatorCore_EventProcessor;
        this.STATE_MGMT = window.AnimatorCore_StateManagement;
        this.CORE = this; // Self-reference for modules that might need it and don't get animatorInstance passed

        this.DATA.SHAPE_RENDERERS = { ...this.UTILS._defaultShapeRenderers, ...this.DATA.SHAPE_RENDERERS };
        this.DATA.BEHAVIOR_HANDLERS = { ...this.UTILS._defaultBehaviorHandlers, ...this.DATA.BEHAVIOR_HANDLERS };

        this.isPlaying = false; this.animationFrameId = null; this.lastTimestamp = 0; this.currentTime = 0;
        this.eventTimeline = []; this.currentEventGroupIndex = -1; this.activeEventGroup = null; this.activeEventGroupStatus = {};
        this.charactersState = {}; this.objectsState = {};
        
        this.cameraState = {
            worldX: 0, worldY: 0, zoom: 1, targetWorldX: 0, targetWorldY: 0, targetZoom: 1,
            focusEntityIds: [], panSpeed: 0.08, zoomSpeed: 0.08, lerpThreshold: 0.01, zoomThreshold: 0.0001,
            minZoom: 0.1, maxZoom: 5.0, verticalFocusBias: 0.15
        };
        this.sceneLayers = []; this.defaultLayerName = 'main';
        
        // New state properties for advanced features
        this.globalTimeScaleFactor = 1.0;
        this.activeScreenEffect = null; // { type, intensity, endTime }
        this.globalVariables = {}; // For conditional logic
        this.timelineUIElements = []; // For UI timeline indicators

        this.SPEECH.initialize((statusMsg) => {
            if (this.ui.statusDiv && !this.animationData) this.ui.statusDiv.textContent = statusMsg + " Load JSON to begin.";
        });
        this.SFX.initialize(this.DATA.SCENE_DATA?.sfxLibrary || {});
        this._bindUIEvents();
        this.DATA_HANDLER._checkForEmbeddedData(this);
    }

    _bindUIEvents() {
        this.ui.loadJsonBtn.addEventListener('click', () => this.DATA_HANDLER.loadJsonFromTextarea(this));
        this.ui.jsonFileUpload.addEventListener('change', (e) => this.DATA_HANDLER.loadJsonFromFile(this, e));
        this.ui.playStopBtn.addEventListener('click', () => this.togglePlayStop());
        this.ui.restartBtn.addEventListener('click', () => this.restartAnimation());
        this.ui.exportBtn.addEventListener('click', () => this.exportAnimation());
    }
    
    togglePlayStop() { if (!this.animationData) return; this.isPlaying ? this.stopAnimation() : this.playAnimation(); }

    playAnimation() {
        if (!this.animationData || this.isPlaying) return;
        this.isPlaying = true; this.ui.playStopBtn.textContent = "Stop";
        if (this.currentEventGroupIndex === -1 || this.currentEventGroupIndex >= this.eventTimeline.length) {
            this.DATA_HANDLER.restartAnimationPrerequisites(this);
        }
        this.lastTimestamp = performance.now();
        if (!this.activeEventGroup && this.currentEventGroupIndex < this.eventTimeline.length -1 ) {
            this.EVENT_PROCESSOR.processNextEventGroup(this);
        }
        if (!this.animationFrameId) this.animationLoop();
    }

    stopAnimation() {
        this.isPlaying = false; this.ui.playStopBtn.textContent = "Play";
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        this.SPEECH.cancel(); this.SFX.stopAll();
        Object.values(this.charactersState).forEach(cs => { cs.isSpeakingTTS = false; cs.ttsUtterance = null; });
        if (this.animationData) this.SCENE_DRAWING.drawScene(this);
    }

    restartAnimation() {
        if (!this.animationData) return;
        const wasPlaying = this.isPlaying;
        this.stopAnimation();
        this.DATA_HANDLER.restartAnimationPrerequisites(this);
        this.SCENE_DRAWING.drawScene(this);
        if (wasPlaying) setTimeout(() => this.playAnimation(), 50);
    }

    animationLoop() {
        if (!this.animationData || (!this.isPlaying && (!this.activeEventGroup || Object.values(this.activeEventGroupStatus).every(s => s.completed)))) {
            this.animationFrameId = null;
            if(this.animationData) this.SCENE_DRAWING.drawScene(this); // Final draw if paused and all events done
            return;
        }
        const now = performance.now();
        const rawDt = (now - this.lastTimestamp) / 1000;
        this.lastTimestamp = now;
        const dt = this.UTILS.clamp(rawDt, 0, 0.1) * this.globalTimeScaleFactor || (0.016 * this.globalTimeScaleFactor); // Apply time scale

        if (this.isPlaying) this.currentTime += dt;

        this.STATE_MGMT._updateState(this, dt); // dt is now scaled
        this.SCENE_DRAWING.drawScene(this);
        this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
    }

    // --- UI Timeline Indicator Methods ---
    _buildTimelineUI() {
        const container = this.ui.timelineIndicatorContainer;
        if (!container) return;
        container.innerHTML = ''; // Clear previous indicators
        this.timelineUIElements = [];

        this.eventTimeline.forEach((group, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('timeline-group-indicator');
            indicator.textContent = `${index + 1}`;
            indicator.dataset.groupIndex = index;
            // Basic click to log, can be expanded for jump functionality later
            indicator.addEventListener('click', () => {
                console.log(`Clicked timeline group ${index + 1}. Current index: ${this.currentEventGroupIndex}. Jumping not yet implemented.`);
                // Potential: this.jumpToEventGroup(index);
            });
            container.appendChild(indicator);
            this.timelineUIElements.push(indicator);
        });
        this._updateTimelineUIFocus();
    }

    _updateTimelineUIFocus() {
        if(!this.ui.timelineIndicatorContainer) return;
        this.timelineUIElements.forEach((el, index) => {
            el.classList.remove('active', 'completed');
            if (index === this.currentEventGroupIndex) {
                el.classList.add('active');
            } else if (index < this.currentEventGroupIndex) {
                el.classList.add('completed');
            }
        });
    }

    // --- Export (Placeholder - Needs significant update for new modules) ---
    exportAnimation() {
        console.warn("Animator.Core.exportAnimation() needs a major update for new modules and will likely produce a non-functional export.");
        if (!this.animationData) { this.ui.statusDiv.textContent = "No data to export."; return; }
        
        let html = document.documentElement.outerHTML;
        // This regex needs to be EXTREMELY robust or the export will fail.
        // Listing all JS files explicitly:
        const scriptTagsToRemovePattern = /<script src="Animator\.(Data|Utils|CharacterPipeline|ObjectPipeline|SceneDrawing|Speech|SFX|DataHandler|CameraControls|EventProcessor|StateManagement|Core)\.js"><\/script>\s*/g;
        const coreClassDefinition = Animator.toString();
        
        // Stringify all modules. This is complex due to functions and internal states.
        // This is a simplified example; a real bundler would be needed for robust export.
        const modulesToBundle = {
            "AnimatorData": this.DATA_RAW, // Use original raw data for export
            "AnimatorUtils": this.UTILS,
            "AnimatorCharacterPipeline": this.CHAR_PIPELINE,
            "AnimatorObjectPipeline": this.OBJECT_PIPELINE,
            "AnimatorSceneDrawing": this.SCENE_DRAWING,
            "AnimatorSpeech": this.SPEECH,
            "AnimatorSFX": this.SFX,
            "AnimatorCore_DataHandler": this.DATA_HANDLER,
            "AnimatorCore_CameraControls": this.CAMERA_CONTROLS,
            "AnimatorCore_EventProcessor": this.EVENT_PROCESSOR,
            "AnimatorCore_StateManagement": this.STATE_MGMT,
        };

        let bundledScripts = "";
        for (const moduleName in modulesToBundle) {
            bundledScripts += `window.${moduleName} = ${this._stringifyModule(modulesToBundle[moduleName])};\n\n`;
        }
        // Special handling for Speech and SFX due to internal Maps or AudioContexts if any
        if (window.AnimatorSpeech._utterances instanceof Map) {
             bundledScripts += `if(window.AnimatorSpeech && window.AnimatorSpeech._utterances && Array.isArray(window.AnimatorSpeech._utterances)) { window.AnimatorSpeech._utterances = new Map(window.AnimatorSpeech._utterances); }\n`;
        }
         if (window.AnimatorSFX.audioContext) { // If SFX uses AudioContext directly in its state
            console.warn("SFX module AudioContext state not easily serializable for export. Exported SFX might not work.");
        }


        const mainScriptContent = `
${bundledScripts}
// --- Animator.Core.js ---
${coreClassDefinition}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => { 
    const ui = { 
        jsonInput: document.getElementById('jsonInput'), 
        jsonFileUpload: document.getElementById('jsonFileUpload'), 
        loadJsonBtn: document.getElementById('loadJsonBtn'), 
        statusDiv: document.getElementById('status'), 
        animationCanvas: document.getElementById('animationCanvas'), 
        playbackControlsContainer: document.getElementById('playbackControlsContainer'),
        timelineIndicatorContainer: document.getElementById('timelineIndicatorContainer'), // ADDED
        playStopBtn: document.getElementById('playStopBtn'), 
        restartBtn: document.getElementById('restartBtn'), 
        exportBtn: document.getElementById('exportBtn'), 
        inputContainer: document.getElementById('inputContainer') 
    };
    // Check ALL modules
    const allModules = ["AnimatorData", "AnimatorUtils", "AnimatorCharacterPipeline", "AnimatorObjectPipeline", "AnimatorSceneDrawing", "AnimatorSpeech", "AnimatorSFX", "AnimatorCore_DataHandler", "AnimatorCore_CameraControls", "AnimatorCore_EventProcessor", "AnimatorCore_StateManagement"];
    let allLoaded = true;
    allModules.forEach(m => { if(!window[m]) allLoaded = false; });

    if (allLoaded) { 
        window.animatorInstance = new Animator(ui.animationCanvas, ui); 
    } else { 
        ui.statusDiv.textContent = "ERROR: Core script components not fully loaded after export process. Check console."; 
        console.error("Export error: One or more Animator modules not found in global scope after script bundling.");
    } 
});`;

        html = html.replace(scriptTagsToRemovePattern, ''); // Remove individual script tags
        // Add the bundled script before </body>
        html = html.replace('</body>', `<script id="mainAnimationScript">${mainScriptContent.replace(/<\/script>/g, '<\\/script>')}</script>\n</body>`);
        
        const animDataStr=JSON.stringify(this.animationData,null,2).replace(/<\/script>/g,'<\\/script>'); 
        if(html.match(/<script id="animationDataJson" type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/)){ 
            html=html.replace(/<script id="animationDataJson" type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/, `<script id="animationDataJson" type="application/json">${animDataStr}<\/script>`); 
        } else { 
            html=html.replace('</body>', `<script id="animationDataJson" type="application/json">${animDataStr}<\/script>\n</body>`); 
        }
        
        const blob=new Blob([html],{type:'text/html'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`anim_phx_v2.0_${Date.now()}.html`; document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href); this.ui.statusDiv.textContent="Exported HTML (Warning: Export function is complex and may need manual review).";
    }

    _stringifyModule(moduleObj) {
        // Custom stringifier to handle functions. This is a basic version.
        // For complex stateful objects, this might not be enough.
        if (typeof moduleObj !== 'object' || moduleObj === null) return JSON.stringify(moduleObj);
        
        const parts = [];
        for (const key in moduleObj) {
            if (Object.prototype.hasOwnProperty.call(moduleObj, key)) {
                const value = moduleObj[key];
                if (typeof value === 'function') {
                    parts.push(`${JSON.stringify(key)}: ${value.toString()}`);
                } else if (value instanceof Map && (key === "_utterances" || key === "soundCache")) { // Special handling for known Maps
                     parts.push(`${JSON.stringify(key)}: ${JSON.stringify(Array.from(value.entries()))}`);
                } else {
                    parts.push(`${JSON.stringify(key)}: ${this._stringifyModule(value)}`); // Recurse for nested objects
                }
            }
        }
        return `{${parts.join(',\n')}}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = { 
        jsonInput: document.getElementById('jsonInput'), jsonFileUpload: document.getElementById('jsonFileUpload'), 
        loadJsonBtn: document.getElementById('loadJsonBtn'), statusDiv: document.getElementById('status'), 
        animationCanvas: document.getElementById('animationCanvas'), 
        playbackControlsContainer: document.getElementById('playbackControlsContainer'),
        timelineIndicatorContainer: document.getElementById('timelineIndicatorContainer'), // ADDED
        playStopBtn: document.getElementById('playStopBtn'), restartBtn: document.getElementById('restartBtn'), 
        exportBtn: document.getElementById('exportBtn'), inputContainer: document.getElementById('inputContainer') 
    };
    
    const allModules = ["AnimatorData", "AnimatorUtils", "AnimatorCharacterPipeline", "AnimatorObjectPipeline", "AnimatorSceneDrawing", "AnimatorSpeech", "AnimatorSFX", "AnimatorCore_DataHandler", "AnimatorCore_CameraControls", "AnimatorCore_EventProcessor", "AnimatorCore_StateManagement"];
    let allLoaded = true;
    allModules.forEach(m => { if(!window[m]) { console.error(`${m} not loaded!`); allLoaded = false;} });

    if (allLoaded) { 
        window.animatorInstance = new Animator(ui.animationCanvas, ui);
    } else {
        ui.statusDiv.textContent = "ERROR: Core script components not loaded. Check console and ensure ALL Animator modules are included correctly in your HTML.";
    }
});