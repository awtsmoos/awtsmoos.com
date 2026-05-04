// B"H
/**
 * @file state.js
 * @module ShlichusStateMethods
 */

export function isShlichusAvailable(olam, shlichusID) {
    if(Array.isArray(shlichusID)) {
        for(var k of shlichusID) {
            var isItAvailable = olam.ayshPeula("is shlichus available", k);
            if(isItAvailable) return isItAvailable;
        }
    }
    let shlichusData = olam.ayshPeula("get shlichus data", shlichusID);
    if(!shlichusData) return null;
    
    var r = shlichusData.requires;
    if(!r || !r.started) return shlichusData;

    var st = r.started;
    if(Array.isArray(st)) {
        for(var n of st) {
            var started = olam.ayshPeula("is shlichus started", n);
            if(!started) return false;
        }
    }
    return shlichusData;
}

export function isShlichusStarted(olam, sID) {
    return olam.startedShlichuseem.includes(sID);
}

export function isShlichusCompleted(olam, sID) {
    return olam.completedShlichuseem.includes(sID);
}
