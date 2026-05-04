/**
 * B"H
 * 
 * methods for placeholder and entity logic
 */

export default class {
    async doPlaceholderAndEntityLogic(nivra) {
        /**
         * check for shlichus data
         */

        var d = nivra?.dialogue?.shlichuseem;
        if(nivra.dialogue) {
           
            if(!this.nivrayimWithDialogue) {
                this.nivrayimWithDialogue = []
            }
            this.nivrayimWithDialogue.push(nivra)
        } else { // B"H: silent
            nivra.hasShlichuseem = d;
            var isAvailable = this.ayshPeula("is shlichus available", d);
            nivra.iconPath = "indicators/exclamation.svg"
      
            nivra.shlichusAvailable = isAvailable;
        }

        //placeholder logic
        var nm = nivra.placeholderName;
        if(typeof(nm) == "string") {
            this.nivrayimWithPlaceholders.forEach(w=> {
                var pl = w.placeholders;
                if(pl) {
                    pl.forEach(av => {
                        if(av.name === nm && !av.addedTo) {
                            av.addedTo = nivra;
                            nivra.addedToPlaceholder = av;
                            var m = nivra.modelMesh || nivra.mesh;
                            if(m) {
                                this.meshesToInteractWith.push(m);
                            }
                        }
                    });
                }
            });
        }
    }

    async doEntityNameCheck(nivra) {
        var entityName = nivra.entityName;
        if(!entityName) return; 

        var entity = this.getEntity(entityName)
        if(!entity) return; 

        entity.addedTo = true;
        nivra.moveMeshToSceneRetainPosition(entity)
        nivra.ayshPeula("change transformation", {
            position: entity.position,
            rotation: entity.rotation
        });
        
        nivra.av = entity;
    }

    async doEntityDataCheck(nivra) {
        var ks = Object.keys(nivra.entityData);
        for(var k of ks) {
            var en = nivra.entityData[k];
            var type = en.type || "Domem";
            if(typeof(type) != "string") {
                type = "Domem"
            }
            var av = this.getEntity(k, nivra);
            if(!av) return;
            
            var ent = await this.loadNivrayim({
                [type]: [ en ]
            });

            av.hasDialogue = true;
            this.meshesToInteractWith.push(av)
            if(ent) {
                ent.forEach(w=>{
                    w.ayshPeula("change transformation", {
                        position: av.position,
                        rotation: av.rotation
                    });
                    w.av = av;
                    av.nivraAwtsmoos = w;
                })
            }
            av.entityNivrayim = ent;
        }
    }
}