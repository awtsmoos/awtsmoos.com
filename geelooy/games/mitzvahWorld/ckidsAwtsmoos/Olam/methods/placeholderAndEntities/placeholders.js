
// B"H
export default {
    async process(nivra) {
        var nm = nivra.placeholderName;
        if(typeof(nm) == "string") {
            this.nivrayimWithPlaceholders.forEach(w=> {
                var pl = w.placeholders;
                if(pl[nm]) {
                    var av = pl[nm]
                    .filter(q => (q.shlichus ? nivra.shlichus == q.shlichus : true))
                    .find(q=> (!q.addedTo));

                    if(av) {
						if(nivra.mesh) {
                            nivra.ayshPeula("change transformation", { position: av.position, rotation: av.rotation });
                            av.addedTo = nivra;
                            nivra.addedToPlaceholder = av;

                            var m = nivra.modelMesh || nivra.mesh;
                            if(m && !m.userData?.isLiving && !m.userData?.skipOctree) this.meshesToInteractWith.push(m);
                        }
                    }
                }
            })
        }
    }
};
