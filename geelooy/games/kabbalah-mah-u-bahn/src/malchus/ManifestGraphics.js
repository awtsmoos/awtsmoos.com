
import { StateRegister } from '../binah/StateRegister.js';
import { PixelArchitect } from '../render/PixelArchitect.js';
import { WorldAssembler } from '../data/Maps/WorldAssembler.js';
import { AnimationDirector } from '../graphics/AnimationDirector.js';

/**
 * B"H
 * ManifestGraphics: Painting the screen of physical reality.
 * 
 * Poetry: The Reflection in the Water.
 * What was above (in the data modules) is now brought below (into the canvas pixels).
 * The Hero sits at the center, and the world revolves around him,
 * for "man is a small world, and the world is a large man."
 */
export class ManifestGraphics {
    
    /** Materializes the current state frame by frame. */
    static paint(cxs) {
        const SCR_W = 460; const SCR_H = 540;
        const bg = cxs.BG; const obj = cxs.OBJ;

        // Clear the canvas layers entirely
        bg.fillStyle = '#08080a'; bg.fillRect(0, 0, SCR_W, SCR_H);
        obj.clearRect(0, 0, SCR_W, SCR_H);

        const midX = SCR_W / 2; const midY = SCR_H / 2;
        const T = StateRegister.Resolution || 64; 

        // Offsets mapping world coordinates to center view
        const cameraOffsetX = StateRegister.HeroPos.dx - midX + (T/2);
        const cameraOffsetY = StateRegister.HeroPos.dy - midY + (T/2);

        // Render Ground Tiles Lattice
        WorldAssembler.getInstance().forEach(tile => {
            const screenX = (tile.x * T) - cameraOffsetX;
            const screenY = (tile.y * T) - cameraOffsetY;
            
            // Perform frustum culling natively properly
            if (screenX > -T && screenX < SCR_W + T && screenY > -T && screenY < SCR_H + T) {
                const tileImage = PixelArchitect.get(tile.t);
                if (tileImage) bg.drawImage(tileImage, screenX, screenY, T, T);
            }
        });

        // Resolve Realistic Human Animations through Director logic
        const heroFrameKey = AnimationDirector.resolveHeroFrame(
            StateRegister.HeroPos.dir, 
            StateRegister.HeroPos.moving, 
            StateRegister.HeroPos.stepTick
        );
        
        const heroManifest = PixelArchitect.get(heroFrameKey);
        // Human Presence drawn slightly larger for realistic prominence
        if (heroManifest) {
            obj.drawImage(heroManifest, midX - 40, midY - 50, 80, 80);
        }
    }
}
