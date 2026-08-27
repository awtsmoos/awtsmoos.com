// B"H
// Boruch Hashem
// Blessed is He

/**
 * Lighting remembers where the character stands and what the world is doing.
 * The Awtsmoos renews every photon-like sign while Awtsmoos.com derives key,
 * fill, rim, exposure, wind, and flash from time, weather, and location.
 */
export class CinematicLightingResolver {
	static resolve(sequence, shot, timeMs) {
		const base = this.location(sequence.environment);
		const weather = this.weather(sequence.weather, timeMs);
		const focus = Number(shot.camera?.focus ?? 0.5);
		return {
			...base,
			...weather,
			exposure: base.exposure * weather.exposure,
			keyStrength: Math.min(0.62, base.keyStrength + focus * 0.08),
			fillStrength: base.fillStrength,
			rimStrength: Math.min(0.78, base.rimStrength + weather.rimBoost),
			wind: weather.wind
		};
	}

	static location(environment) {
		return {
			scienceExhibition: this.state('#ffd7a3', '#7396c8', '#7fe7ff', 1.06, 0.28, 0.16, 0.18, -1),
			schoolCorridor: this.state('#fff0c7', '#7383a6', '#55d9ff', 0.94, 0.24, 0.18, 0.24, 1),
			subwayTunnel: this.state('#ff9b62', '#385078', '#50e7ff', 0.72, 0.36, 0.12, 0.4, -1),
			floodedStreet: this.state('#d8e9ff', '#5b719a', '#ffffff', 0.86, 0.2, 0.26, 0.34, 1),
			marketCanopy: this.state('#ffc46b', '#5f6f94', '#f3538b', 1.04, 0.32, 0.2, 0.26, -1),
			libraryArchive: this.state('#f1c27d', '#303d64', '#70b9ff', 0.74, 0.3, 0.1, 0.36, 1),
			glassGreenhouse: this.state('#ffd99c', '#74a8a0', '#d7ffcf', 1.12, 0.34, 0.24, 0.34, -1),
			riverBridge: this.state('#ff9a78', '#4a5f86', '#aee8ff', 0.9, 0.25, 0.2, 0.42, 1),
			towerStairwell: this.state('#ffb35c', '#2f3e60', '#f45d8b', 0.69, 0.4, 0.08, 0.46, -1),
			rooftopGardens: this.state('#8db8ff', '#252f59', '#7dffdd', 0.66, 0.22, 0.14, 0.52, 1),
			powerStation: this.state('#75e7ff', '#2a3558', '#ffffff', 0.8, 0.42, 0.1, 0.58, -1),
			dawnPlaza: this.state('#ffd08b', '#8298b2', '#fff0d6', 1.08, 0.3, 0.22, 0.3, 1)
		}[environment] || this.state('#ffd7aa', '#6d82aa', '#a9d8ff', 1, 0.24, 0.18, 0.2, -1);
	}

	static weather(weather, timeMs) {
		const lightning = ['storm', 'electricalWind', 'overload'].includes(weather)
			&& Math.floor(timeMs / 680) % 11 === 0;
		const wind = ['gale', 'storm', 'electricalWind'].includes(weather) ? 1.4 : 0.25;
		return {
			exposure: lightning ? 1.52 : 1,
			rimBoost: lightning ? 0.34 : 0,
			wind,
			flash: lightning ? 1 : 0
		};
	}

	static state(keyColor, fillColor, rimColor, exposure, keyStrength, fillStrength, rimStrength, keyDirection) {
		return { keyColor, fillColor, rimColor, exposure, keyStrength, fillStrength, rimStrength, keyDirection };
	}
}
