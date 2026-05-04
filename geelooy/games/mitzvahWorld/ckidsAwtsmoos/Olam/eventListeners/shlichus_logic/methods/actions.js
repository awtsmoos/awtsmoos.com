// B"H
/**
 * @file actions.js
 * @module ShlichusActionMethods
 */

export async function acceptShlichus(olam, shlichusID, giver) {
    if(!olam.shlichusHandler) return null;
    var shData = olam.ayshPeula("get shlichus data", shlichusID);
    if(!shData) return null;

    var shl = await olam.shlichusHandler.createShlichus(shData, giver);
    shl.initiate();
    
    olam.ayshPeula("updateProgress", {
        ["acceptedShlichus_" + shlichusID]: {
            shlichusID,
            time: Date.now()
        }
    });

    if(!olam.startedShlichuseem.includes(shlichusID)) {
        olam.startedShlichuseem.push(shlichusID);
    }
    return shl;
}

export function completeShlichus(olam, sID) {
    var ash = olam.ayshPeula("get active shlichus", sID);
    if(!ash) return false;

    ash.isActive = false;
    
    olam.ayshPeula("updateProgress", {
        completedShlichus: {
            shlichusID: sID,
            time: Date.now()
        }
    });

    if(!olam.completedShlichuseem.includes(sID)) {
        olam.completedShlichuseem.push(sID);
    }

    ash.finish(ash);
    return true;
}

export function removeShlichus(olam, sID) {
    var ind = olam.startedShlichuseem.indexOf(sID);
    if(ind > -1) {
        olam.startedShlichuseem.splice(ind, 1);
    }
}
