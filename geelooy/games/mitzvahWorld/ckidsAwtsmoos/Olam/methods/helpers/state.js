
// B"H
export default {
    serialize() {
        super.serialize();
        this.serialized = {
            ...this.serialized,
            nivrayim: this.nivrayim.map(q => q.serialize())
        };
        return this.serialized;
    },

    getCompiledNivrayimInfo() {
        var baseInfo = this?.baseInfo;
        var compiledData = {...baseInfo};
        var c = compiledData?.nivrayim || {};
        compiledData.nivrayim = c;
        
        for(var nivra of this?.nivrayim) {
            var type = nivra?.type;
            if(type) {
                type = type[0].toUpperCase() + type.substring(1);
            }
            if(!c[type]) {
                c[type] = {};
            }
            var nm = nivra?.name;
            c[type][nm] = nivra?.serialize();
        }
        return compiledData;
    },

    getGameState() {
        var res = {
            nivrayim: this.nivrayim.map(q => ({
                transform: this.getTransformation(q.mesh),
                name: q.name
            })),
            shaym: this.shaym
        };
        return res;
    },

    setGameState(state = {}) {
        if(typeof(state) != "object") {
            state = {};
        }
        if(!state.nivrayim) return;
        if(!state.shaym) return;
        if(!this.nivrayim.length) {
            return false;
        }
        for(var n of state.nivrayim) {
            var nivra = this.nivrayim.find(q => q.name && q.name == n.name);
            if(!nivra) continue;
            nivra.ayshPeula("change transformation", n.transform);
        }
        return true;
    }
};
