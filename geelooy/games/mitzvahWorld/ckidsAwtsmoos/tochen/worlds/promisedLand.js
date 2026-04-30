
export default {
	shaym: "Promised Land",
	components: {
		awduhm: "https://models-3122d.web.app/chossid.glb",
		new_awduhm: "https://models-3122d.web.app/chossid.glb"
	},
	nivrayim: {
        ProceduralTerrain: {
            ground: {
                name: "Holy Land", width: 400, depth: 400, segments: 40, textureType: "grass", hills: [{ x: 0, z: 50, radius: 150, height: 30 }], position: { x: 0, y: -1, z: 0 }, isSolid: true
            }
        },
		Chossid: {
			me: {
				height: 1.5, name: "player", speed: 166, interactable: true, path: "awtsmoos://awduhm", position: { x: 0, y: 40, z: 0 }
			}
		}
	}
};
