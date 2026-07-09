
// B"H
import Utils from '../../../utils.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export default function processChild(child, nivra, olam, collections) {
    const { 
        placeholders, 
        thingsToRemove, 
        materials, 
        boneChildren, 
        garments, 
        bodyParts 
    } = collections;

    if(child.type == "Bone") boneChildren[child.name] = child;
    if(child?.userData?.garment) garments[child.userData.garment] = child;
    if(child?.userData?.["body-part"]) bodyParts[child.userData["body-part"]] = child;
    
    child.nivraAwtsmoos = nivra;
    
    if(child.userData && child.userData.water) {
        child.isWater = true;
        olam.ayshPeula("start water", child);
    }

    if(child.userData.meen == "land") {
        if(!nivra.lands) nivra.lands = [];
        nivra.lands.push(child);
    }

    if(child.userData && child.userData.action) {
        var ac = olam.actions[child.userData.action];
        if(ac) {
            if(!nivra.childrenWithActions) nivra.childrenWithActions = [];
            nivra.childrenWithActions.push(ac);
            child.awtsmoosAction = (player, nivra) => ac(player, nivra, olam);
        }
    }

    if(typeof(child.userData.placeholder) == "string") {
        var { position, rotation, scale } = olam.getTransformation(child);
        if(!placeholders[child.userData.placeholder]) placeholders[child.userData.placeholder] = [];
        var shlichus = child.userData.shlichus;
        placeholders[child.userData.placeholder].push({
            position, rotation, scale, mesh: child, addedTo: false,
            ...(shlichus ? { shlichus } : {})
        });
        thingsToRemove.push(child);
    }

    if(typeof(child.userData.entity) == "string") {
        olam.saveEntityInNivra(child.userData.entity, nivra, child);
        if(nivra.isSolid) child.isSolid = true;
        child.isMesh = true;
    }

    if (child.isMesh && !child.isAwduhm && !child.isWater) {
        olam.objectsInScene.push(child);
    } else if(child.isWater) {
        olam.water = child;
        if(!olam.waters) olam.waters = [];
        olam.waters.push(child);
    }

    if(child.material) {
        Utils.replaceMaterialWithLambert(child);
        materials.push(child.material);
        if(child.userData.invisible) child.material.visible = false;
    }
}
