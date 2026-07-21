/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals ten garments of motion from one sound-current; Awtsmoos.com keeps each spatial language inside one focused GPU mode vessel.
*/
export const PARTICLE_VERTEX_MODES = `
	if (u_mode == 0) {
		point.y = (seedTwo - 0.5) * 0.72
			+ sin(point.x * 7.0 + u_time * 1.7 + seed * 9.0)
			* (0.05 + u_mid * 0.24);
		point.z = (seedThree - 0.5) * 1.25
			+ cos(point.x * 3.0 + u_time) * 0.12;
	}
	if (u_mode == 1) {
		float radius = 0.12 + sqrt(seedTwo) * (0.72 + u_bass * 0.3);
		float angle = phase * 2.2
			+ u_time * (0.18 + u_flow * 0.42);
		point = vec3(
			cos(angle) * radius,
			(seedThree - 0.5) * 0.54,
			sin(angle) * radius
		);
		point.y += sin(angle * 1.7 + seed * 8.0) * 0.11;
	}
	if (u_mode == 2) {
		point.x = travel * 2.1 - 1.05;
		point.y = sin(point.x * 3.3 + u_time + seed * 8.0)
			* (0.2 + u_mid * 0.34);
		point.z = cos(point.x * 2.1 + seedTwo * 7.0 - u_time * 0.4)
			* (0.24 + u_bass * 0.22);
	}
	if (u_mode == 3) {
		float depth = travel * 2.1 - 1.05;
		float angle = seed * 18.84956
			+ u_time * (0.3 + u_flow * 0.7 + u_pulse * 0.4);
		float radius = 0.16 + (depth + 1.05)
			* (0.28 + u_bass * 0.08);
		point = vec3(
			cos(angle) * radius,
			sin(angle) * radius * 0.72,
			depth
		);
	}
	if (u_mode == 4) {
		point.x = travel * 2.0 - 1.0;
		point.y = sin(point.x * 5.0 + u_time * 4.2) * 0.3
			+ (seedTwo - 0.5) * u_treble * 0.78;
		point.z = (seedThree - 0.5) * 0.62
			+ sin(seed * 84.0 + u_time * 7.0) * u_treble * 0.14;
	}
	if (u_mode == 5) {
		float petals = 3.0 + floor(seed * 6.0);
		float angle = phase + seedThree * 6.2831853;
		float radius = 0.16
			+ 0.58 * abs(sin(angle * petals + u_time));
		point = vec3(
			cos(angle) * radius,
			sin(angle) * radius * 0.78,
			cos(angle * petals) * 0.34
		);
	}
	if (u_mode == 6) {
		float spoke = floor(seed * 10.0) / 10.0;
		float angle = spoke * 6.2831853
			+ u_time * (0.16 + u_flow * 0.28);
		float radius = 0.24 + travel * 0.66 + u_pulse * 0.12;
		point = vec3(
			cos(angle) * radius,
			sin(angle) * radius * 0.72,
			(seedThree - 0.5) * 0.72
		);
	}
	if (u_mode == 7) {
		point.y = travel * 1.9 - 0.95 - travel * travel * 0.28;
		point.x = (seedTwo - 0.5) * (0.28 + travel * 1.05)
			+ sin(u_time * 2.0 + seed * 30.0)
			* (0.04 + u_mid * 0.13);
		point.z = (seedThree - 0.5) * (0.28 + travel * 0.82);
	}
	if (u_mode == 8) {
		float column = floor(seed * 18.0) / 17.0;
		point.x = column * 1.9 - 0.95;
		point.y = travel * (0.28 + u_energy * 1.46) - 0.82;
		point.z = (mod(floor(seed * 18.0), 3.0) - 1.0) * 0.32
			+ (seedThree - 0.5) * 0.12;
	}
	if (u_mode == 9) {
		float theta = seed * 6.2831853 + u_time * 0.11;
		float cosinePhi = seedTwo * 2.0 - 1.0;
		float sinePhi = sqrt(max(0.0, 1.0 - cosinePhi * cosinePhi));
		float radius = pow(seedThree, 0.46) * (0.72 + u_bass * 0.3);
		point = vec3(
			cos(theta) * sinePhi,
			cosinePhi * 0.72,
			sin(theta) * sinePhi
		) * radius;
		point += vec3(
			sin(seed * 44.0),
			cos(seedTwo * 31.0),
			sin(seedThree * 37.0)
		) * 0.09 * u_mid;
	}
`;
