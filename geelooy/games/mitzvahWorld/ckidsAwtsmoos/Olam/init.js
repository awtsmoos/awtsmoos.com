
//B"H
import {DRACOLoader} from "/games/scripts/jsm/loaders/DRACOLoader.js"

export default async function(olam) {
	const dracoLoader = new DRACOLoader();
    // B"H
    // Use unpkg as a reliable public source for the Draco decoders.
    // This allows the GLB compressed models to load correctly.
    dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/' );
    dracoLoader.preload()
    olam.loader.setDRACOLoader( dracoLoader );
}
