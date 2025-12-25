
/**
 * B"H
 * Starting world for the player, containers
 * components to load and nivrayim.
 */

/**
 * resources
 */


var localPath = "http://localhost:8081/";//static server
var isLocal = !location.href.includes("awtsmoos.com")
export default {
    components: {
        world2File:
        "https://firebasestorage.googleapis.com/v0/b/ckids-assets-2.appspot.com/o/worldData%2F2%2F2.js?alt=media",

        soundTrack1: 
        "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/sound%2Fmusic%2Ftrack%201.ogg?alt=media"
        
        ,
		cast:
        "https://firebasestorage.googleapis.com/v0/b/ckids-assets-2.appspot.com/o/models%2Fworlds%2Fcastle2.glb?alt=media"

        ,
        portalGLB:
        "https://firebasestorage.googleapis.com/v0/b/ckids-assets-2.appspot.com/o/models%2Fassets%2Fportal.glb?alt=media"
        ,
		
		cutscene1Audio:
		"https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/models%2Fenvironemnts%2Fzone1%2Faudio%2Fbeginning.ogg?alt=media"
		,
        awduhm: 
        "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/models%2Fawdum_2.6.glb?alt=media",
        dingSound:
        "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/sound%2Feffects%2Fding.ogg?alt=media",
        new_awduhm:
       /// isLocal?localPath
      //  +"new_awduhm_new_blender_camera.glb":
        /**
         * @version 3 that uses blender version
         * 3.6.2 GLB exporter - works better.
         */
        "https://firebasestorage.googleapis.com/v0/b/ckids-assets-2.appspot.com/o/models%2Fnew_awduhm_new_blender_camera.glb?alt=media"
        ,

        grass: "../models/gltf/grass.glb",
        grassTexture:
            "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/textures%2Fgrass%2Fgrass1.jpg?alt=media"
        ,
        dirtTexture:
            "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/textures%2Fdirt%2Fdirt%20smaller.png?alt=media"
        ,

        terrainMaskTexture:
            "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/models%2Fenvironemnts%2Fzone1%2Fmasks%2Fmask%20grass.png?alt=media"
        ,
		
		cameraT: 
		
		"https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/models%2Fenvironemnts%2Fzone1%2FcameraTest.glb?alt=media"
		
		,
        world: 
        "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/models%2Fenvironemnts%2Fzone1%2Fzone.1.4.glb?alt=media"
    },
    
    // B"H: Load Mivtza Teffilin Module
    modules: {
        shlichuseem: {
            mivtzaTeffilin: "./ckidsAwtsmoos/tochen/shlichuseem/mivtzaTeffilin.js"
        }
    },
  
    nivrayim: {
        Domem: {
            world: {
                name: "me",
                path: "awtsmoos://cast",
                isSolid:true,
                heesHawveh: true,
                on: {
                        afterBriyah(d) {
                            d.mixTextures({
                                baseTexture:d.olam.$gc("dirtTexture"),
                                overlayTexture:d.olam.$gc("grassTexture"),
                                maskTexture:d.olam.$gc("terrainMaskTexture"),
                                repeatX:166,
                                repeatY:166,
                                childNameToSetItTo: "Landscape"
                            });
                        }
                }
            },
        },
        Chai: {},
        Chossid: {
            me: {
                height:1.5,
                name:"player",
                placeholderName: "player",
                speed:126,
                interactable: true,
                path: "awtsmoos://awduhm",
                position: { x:25 },
                on: {
                    ready(m) {
                        m.on("keypressed", k => {
                            if(k.code == "KeyY") {
                                if(m.asset.cameras[0]) m.olam.activeCamera = m.asset.cameras[0];
                            }
                        })
                    }
                }
            }
        },
        // B"H: The Mashpia for Mivtza Teffilin
        CustomNpc: {
            mashpia: {
                name: "Reb Yisroel",
                position: { x: 15, y: 0, z: 15 },
                itemData: {
                    customData: {
                        name: "Reb Yisroel",
                        quests: [
                            {
                                id: "mivtza_teffilin",
                                title: "Mivtza Teffilin",
                                type: "ACTION",
                                description: "Go out and put Teffilin on 5 people.",
                                // ... (Full logic loaded from module but referenced here) ...
                                // Since we loaded the module, ShlichusHandler can resolve it by ID if registered.
                                // We'll rely on the module export object passed to registerQuest in `customNpc.js`.
                            }
                        ]
                    }
                }
            }
        },
        Medabeir: {
            him: {
                name: "npc_1",
                placeholderName: "npc_1",
                path: "awtsmoos://new_awduhm",
                proximity:3,
                messageTree(myself) {
                     return [{
                         message: "B\"H\nWelcome to the castle.",
                         responses: [ { text: "Peace be upon you.", type: "close" } ]
                     }];
                }
            }
        }
    }
};
