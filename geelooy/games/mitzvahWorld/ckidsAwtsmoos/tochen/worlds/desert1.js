
export default {
	shaym: "Midbar",
	components: {
		awduhm: "https://models-3122d.web.app/chossid.glb",
		new_awduhm: "https://models-3122d.web.app/chossid.glb"
	},
	nivrayim: {
        ProceduralTerrain: {
            ground: {
                name: "Desert Grounds", width: 300, depth: 300, segments: 40, textureType: "sand", hills:[{ x: 50, z: 50, radius: 100, height: 20 }], position: { x: 0, y: -1, z: 0 }, isSolid: true
            }
        },
		Chossid: {
			me: {
				height: 1.5, name: "player", speed: 166, interactable: true, path: "awtsmoos://awduhm", position: { x: 0, y: 30, z: 0 }
			}
		}
	}
};
