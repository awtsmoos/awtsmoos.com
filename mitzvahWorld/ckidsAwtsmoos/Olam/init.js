
//B"H
import {DRACOLoader} from "/games/scripts/jsm/loaders/DRACOLoader.js"

export default async function(olam) {
	const dracoLoader = new DRACOLoader();
    // B"H
    // Use a newer version of Draco decoder that aligns better with modern GLTFLoader.
    // This helps resolve 'float unrepresentable in integer range' errors on some platforms.
    dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.170.0/examples/jsm/libs/draco/' );
    dracoLoader.preload()
    olam.loader.setDRACOLoader( dracoLoader );
}
