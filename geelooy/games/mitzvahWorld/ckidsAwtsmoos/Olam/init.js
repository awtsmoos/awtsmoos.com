
//B"H
import {DRACOLoader} from "/games/scripts/jsm/loaders/DRACOLoader.js"

export default async function(olam) {
	const dracoLoader = new DRACOLoader();
    // B"H
    // Use a reliable CDN for Draco decoder WASM files
    dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/' );
    dracoLoader.preload()
    olam.loader.setDRACOLoader( dracoLoader );
}
