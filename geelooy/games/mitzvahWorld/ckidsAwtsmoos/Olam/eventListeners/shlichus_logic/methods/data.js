// B"H
/**
 * @file data.js
 * @module ShlichusDataMethods
 */

export function getShlichusData(olam, shlichusID) {
    var shl = olam?.modules?.shlichuseem;
    if(!shl || typeof(shl) !== "object") return null;
    
    var found = null;
    Object.keys(shl).forEach(w => {
        if(found) return;
        var sh = shl[w];
        if(sh.id === shlichusID) {
            found = sh;
        }
    });
    return found;
}

export function getNextShlichusData(olam, shlichusID) {
    try {
        let currentShlichusData = olam.ayshPeula("get shlichus data", shlichusID);
        if(!currentShlichusData) return null;

        var r = currentShlichusData.requires;
        if(r && r.started) {
            var st = r.started;
            var isStarted = true;
            if(Array.isArray(st)) {
                st.forEach(w => {
                    var started = olam.ayshPeula("is shlichus started", w);
                    if(!started) isStarted = false;
                });
            }
            if(!isStarted) return null;
        }

        if(currentShlichusData.type !== "chain") {
            if(olam.completedShlichuseem.includes(shlichusID)) return null;
            return currentShlichusData;
        }

        if(!currentShlichusData.nextShlichusID) return null;
        
        while (currentShlichusData.nextShlichusID) {
            const isDone = olam.ayshPeula("is shlichus completed", currentShlichusData.id);
            if (!isDone) return currentShlichusData;

            currentShlichusData = olam.ayshPeula("get shlichus data", currentShlichusData.nextShlichusID);
        }

        return currentShlichusData && currentShlichusData.type === "chain" ? currentShlichusData : null;
    } catch (error) {
        console.error("Error in getting next shlichus data: ", error);
        return null;
    }
}
