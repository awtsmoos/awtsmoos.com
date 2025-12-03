
/**
 * B"H
 * @file audio.js
 * Playback of holy sounds.
 */

export default {
    playSound(path, {
        layerName = "audio base layer",
        loop = false,
        volume = 1,
        onended=()=>{}
    } = {}) {
        
        var music = this.olam.getComponent(path);
        
        if(!music) return false;
        this.olam.ayshPeula("setHtml",({
            shaym: layerName,
            info: {
                options: {
                    loop, 
                    music,
                    volume,
                    shaym:this.shaym,
                    layerName
                },
                ready: function(me, $f, ui) {
                    var newShaym = me.options.shaym + " " + me.options.layerName;
                    var nv = $f(newShaym);
                    
                    if(!nv) {
                        ui.html({
                            shaym: newShaym,
                            parent: me,
                            tag: "audio",
                            src: me.options.music,
                            volume:me.options.volume,
                            autoplay: true,
                            loop:me.options.loop
                        });
                    } else {
                        ui.setHtml(nv, {
                            tag: "audio",
                            src: me.options.music,
                            volume:me.options.volume,
                            autoplay: true,
                            loop:me.options.loop
                        })
                    }
                }
            }
        }));
        
        return {
            layerName,
            nivra:this
        }
    },
    
    stopSound(layerName = "audio base layer") {
        var newShaym = this.shaym + " " + layerName;
        this.olam.ayshPeula("htmlAction", {
            shaym: newShaym,
            methods: {
                pause: true
            },
            properties: {
                currentTime: 0
            }
        })
    },
    
    stopCutscene() {
        this.stopSound();
        this.olam.activeCamera = null;
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
            done() {
                try {
                    this.olam.activeCamera=null;
                } catch(e) {}
            }
        });
        var cam = this.mesh.children.find(q=>q.name==cameraName);
        if(cam) {
            cam = cam.children[0];
            this.olam.activeCamera=cam;
        }
    }
};
