
/**
 * B"H
 * @file audio.js
 * Playback of holy sounds. Now utilizes the purely mathematical AudioEngine.
 */
import AudioEngine from "../../../systems/audio/AudioEngine.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
    playSound(path, {
        layerName = "audio base layer",
        loop = false,
        volume = 1,
        onended=()=>{}
    } = {}) {
        
        // Extract the key if it's an awtsmoos:// path
        let soundKey = path;
        if (path && path.startsWith("awtsmoos://")) {
            soundKey = path.split("awtsmoos://")[1];
        }

        // Mapping old string names to new JSON keys
        const map = {
            "dingSound": "ding",
            "jumpSound": "jump",
            "groundHit": "hit_floor",
            "walking": "step"
        };

        const finalKey = map[soundKey] || soundKey;

        // Play procedurally!
        // NOTE: In an actual Worker context, AudioContext isn't available. 
        // This is a bridge. We either trigger it via the UI layer or assume Main Thread context.
        // If we are in worker, we dispatch a UI event to the main thread to play it!
        
        if (typeof window !== 'undefined' && window.AudioContext) {
             AudioEngine.play(finalKey, { volume });
        } else if (this.olam) {
             // Send signal to Main Thread to play the procedural sound
             this.olam.ayshPeula("ui event", "effectsOverlay", { 
                 playProceduralSound: { key: finalKey, options: { volume } } 
             });
        }
        
        return {
            layerName,
            nivra: this
        }
    },
    
    stopSound(layerName = "audio base layer") {
        // Procedural sounds are fire-and-forget for now, or handled by short duration.
        // We can ignore stopSound for footsteps or implement an oscillator registry later.
    },
    
    stopCutscene() {
        this.stopSound();
        if(this.olam) this.olam.activeCamera = null;
    },
    
    playCutscene({
        audioName, 
        animationName,
        cameraName = "Camera",
    } = {}) {
        this.playSound(audioName,{
            loop:false
        });
        
        this.playChaweeyoos(animationName, {
            loop:false,
            done: () => {
                try {
                    if(this.olam) this.olam.activeCamera=null;
                } catch(e) {}
            }
        });
        if(this.mesh && this.mesh.children) {
            var cam = this.mesh.children.find(q=>q.name==cameraName);
            if(cam && cam.children[0]) {
                if(this.olam) this.olam.activeCamera = cam.children[0];
            }
        }
    }
};
