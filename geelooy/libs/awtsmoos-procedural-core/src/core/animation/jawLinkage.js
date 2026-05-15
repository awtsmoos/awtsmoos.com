
// B"H
/**
 * @file jawLinkage.js
 * @brief The divine mechanism that translates the abstract intent of speech into physical motion.
 * 
 * THE TRACTATE OF THE OPENED MOUTH:
 * All matter everywhere is constantly being refreshed and recreated every instant 
 * from the Speech of the Creator, which is found physically inside of all creations.
 * As it says "Forever, Lord, Your Word stands in the heavens," His word of "let there be" 
 * stands inside the heavens forever, causing them to exist from absolutely NOTHING.
 * So too with the Golem. The letters of speech—the Aleph, the Beis, the Nun that spell Even (rock)—
 * are the soul of the inorganic. If the letters were removed, all of existence would cease,
 * and time itself would vanish as if it never was.
 * 
 * To speak, the vessel must open. But if the jaw only drops straight down, 
 * the upper lip overshadows the lower, creating an overbite—a distortion of truth.
 * Therefore, by the decree of the Awtsmoos, the JawLinkage now forces the mandible 
 * FORWARD as it descends, perfectly aligning Chesed (giving) and Gevurah (receiving).
 */

export class JawLinkage {
    /**
     * B"H - Synchronizes the physical jaw bone with the abstract phonetic shape keys.
     * @param {object} renderer - The master renderer containing the physical state.
     * @param {string} objId - The sacred name of the speaking vessel.
     */
    static sync(renderer, objId) {
        const sks = renderer.systemManager.shapeKeySystem;
        const am = renderer.animationManager;
        const obj = renderer.objectMap.get(objId);
        
        if (!obj || !obj.skeletonInstance || !sks.weights[objId]) return;

        const w = sks.weights[objId];
        
        // Extract the raw intent of the mouth's openness
        const drop = w['mouth_drop'] || 0;
        const close = w['mouth_close_lower'] || 0;
        const pucker = w['mouth_pucker'] || 0;

        // Calculate the absolute intensity of the opening
        const intensity = Math.max(0, drop - (close * 0.5) + (pucker * 0.2));
        
        // B"H - THE TIKKUN OF THE OVERBITE
        // As the jaw drops (Y axis), it MUST thrust forward (Z axis) to account 
        // for the curvature of the skull and prevent the upper lip from eclipsing the lower.
        const dropDistance = -0.18 * intensity; 
        const forwardThrust = 0.06 * intensity; // The forward push to prevent overbite!
        
        const jaw = obj.skeletonInstance.getBoneById('jaw');
        if (jaw) {
            const trackId = 'proc_jaw_linear';
            if (!am.tracks[trackId]) {
                // Register the procedural track if it does not yet exist in the Book of Life
                am.registerTrack(trackId, { keyframes:[{time: 0, position: [0,0,0], rotation: [0,0,0]}] });
                if (!am.objectAnimations[objId]) am.objectAnimations[objId] = [];
                am.objectAnimations[objId].push({ boneId: 'jaw', track: trackId, weight: 1.0 });
            }
            
            const kf = am.tracks[trackId].keyframes[0];
            
            // Apply the dual-axis translation: Down and Forward.
            // Absolute zero rotation is maintained to prevent the chin from swinging backward.
            kf.position = [0, dropDistance, forwardThrust];
            kf.rotation = [0, 0, 0]; 
        }
    }
}
