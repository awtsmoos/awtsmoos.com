
/**
 * B"H
 * UI Response Methods for Worker
 */
export default function(me) {
    var off = "official";
    return {
        htmlCreated(info) {
            if(!me.olam) return;
            me.olam.ayshPeula("htmlCreated", info);
            var promiseInfo = me.promiseMap.get(info.id);
            if (promiseInfo) {
                if(info.id) delete info.id;
                info[off] = true;
                promiseInfo.resolve(info);
                me.promiseMap.delete(info.id);
            }
        },
        htmlDeleted(info) {
            if(!me.olam) return;
            me.olam.ayshPeula("htmlDeleted", info);
            var promiseInfo = me.promiseMap.get(info.id);
            if (promiseInfo) {
                info[off] = true;
                if(info.id) delete info.id;
                promiseInfo.resolve(info);
                me.promiseMap.delete(info.id);
            }
        },
        htmlGot(info) {
            if(!me.olam) return;
            me.olam.ayshPeula("htmlGot", info);
            var promiseInfo = me.promiseMap.get(info.id);
            if (promiseInfo) {
                info[off] = true;
                if(info.id) delete info.id;
                promiseInfo.resolve(info);
                me.promiseMap.delete(info.id);
            }
        },
        uiEvented(info) {
            if(!me.olam) return;
            var id = info?.id;
            if(!id) return;
            var pi = me.promiseMap.get(id);
            if(pi) {
                if(info.id) delete info.id;
                pi?.resolve(info);
                me.promiseMap?.delete?.(id);
            }
        },
        htmlActioned(info) {
            if(!me.olam) return;
            me.olam.ayshPeula("htmlActioned", info);
            var promiseInfo = me.promiseMap.get(info.id);
            if (promiseInfo) {
                info[off] = true;
                if(info.id) delete info.id;
                promiseInfo.resolve(info);
                me.promiseMap.delete(info.id);
            }
        },
        sized({id, size}) {
            var promiseInfo = me.promiseMap.get(id);
            if (promiseInfo) {
                promiseInfo.resolve(size);
                me.promiseMap.delete(id);
            }
        },
        async htmlPeula(obj={}) {
            for(var k in obj) {
                me.olam.ayshPeula("htmlPeula " + k, obj[k]);
            }
        },
        async htmlSet(shaym) {
            if(!me.olam) return;
            me.olam.ayshPeula("htmlSet", shaym);
        },
        gotMapCanvas(info) {},
        scrolledMap(info) {
            var promiseInfo = me.promiseMap.get(info.id);
            if (promiseInfo) {
                info[off] = true;
                if(info.id) delete info.id;
                promiseInfo.resolve(info);
                me.promiseMap.delete(info.id);
            }
        },
        async captureMinimapScene(info) {
            if(!me.olam) return;
            return await me.olam.ayshPeula("captureMinimapScene", info);
        }
    };
}
