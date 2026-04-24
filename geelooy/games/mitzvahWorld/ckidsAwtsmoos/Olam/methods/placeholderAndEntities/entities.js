
// B"H
export default {
    async doEntityNameCheck(nivra) {
        var entityName = nivra.entityName;
        if(!entityName) return;
        var entity = this.getEntity(entityName);
        if(!entity) return;
        
        entity.addedTo = true;
        nivra.moveMeshToSceneRetainPosition(entity);
        nivra.ayshPeula("change transformation", {
            position: entity.position,
            rotation: entity.rotation
        });
        nivra.av = entity;
    },

    async doEntityDataCheck(nivra) {
        if(!nivra.entityData) return;
        var ks = Object.keys(nivra.entityData);
        for(var k of ks) {
            var en = nivra.entityData[k];
            var type = typeof(en.type) == "string" ? en.type : "Domem";
            var av = this.getEntity(k, nivra);
            
            if(!av) return; 
            
            var ent = await this.loadNivrayim({ [type]: [en] });
            av.hasDialogue = true;
            this.meshesToInteractWith.push(av);
            
            if(ent) {
                ent.forEach(w=>{
                    w.ayshPeula("change transformation", { position: av.position, rotation: av.rotation });
                    w.av = av;
                    av.nivraAwtsmoos = w;
                })
            }
            av.entityNivrayim = ent;
        }
    }
};
