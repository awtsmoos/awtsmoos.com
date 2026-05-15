
// B"H
import { SceneParser } from '../../../scene/sceneParser.js';         
import { processSceneObject } from './objectProcessor.js';

export function loadSceneRenderer(renderer, sceneData, orbitControls) {
    console.log('B"H - SceneLoader: Starting load process...');
    
    renderer.orbitControls = orbitControls;
    renderer.sceneParser = new SceneParser();
    renderer.rootAnimatedObjects = []; 

    const parsedData = renderer.sceneParser.parseScene(sceneData);
    
    Object.keys(parsedData.tracks).forEach(trackName => {
        renderer.animationManager.registerTrack(trackName, parsedData.tracks[trackName]);
    });

    if (parsedData.camera && renderer.camera) {
        console.log("B\"H - SceneLoader: Applying scene-specific camera.");
        const target = parsedData.camera.target || [0,0,0];
        const pos = parsedData.camera.initialPosition || [0, 10, 20];
        renderer.camera.lookAt(pos, target);
        
        renderer.cameraAnimation = parsedData.camera.animations || [];
        if (renderer.cameraAnimation.length > 0) {
            renderer.animationManager.registerObject("__camera__", renderer.cameraAnimation);
        }
    } else if (renderer.camera) {
        renderer.camera.reset();
    }

    renderer.rootAnimatedObjects = parsedData.objects.map(obj => processSceneObject(renderer, obj)).filter(Boolean);
    
    // B"H - Programs are already compiled by the ProgramManager during renderer init.
    // The renderer now holds all necessary programInfo objects in renderer.programManager.
    
    console.log('B"H - SceneLoader: Scene loaded successfully.');
}
