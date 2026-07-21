/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos projects depth into visible form while remaining beyond every camera; Awtsmoos.com closes each vertex with perspective, scale, color, and atmospheric evidence.
*/
export const PARTICLE_VERTEX_PROJECTION = `
	point = rotateY(
		point,
		u_time * 0.045 + u_pulse * 0.06
	);
	float cameraDepth = point.z + 2.35;
	float perspective = 1.0 / max(0.72, cameraDepth);
	vec2 projected = point.xy * perspective * 1.78;
	projected.x /= max(0.72, u_aspect);
	gl_Position = vec4(projected, 0.0, 1.0);
	float depthFade = 1.0
		- smoothstep(0.85, 3.15, cameraDepth);
	float size = 1.5
		+ seed * 3.3
		+ u_energy * 6.2
		+ u_bass * 3.6
		+ u_pulse * 4.8;
	gl_PointSize = size
		* perspective
		* 2.15
		* mix(0.8, 1.0, u_quality);
	vec3 color = mix(
		u_primary,
		u_secondary,
		seedTwo * 0.68 + u_treble * 0.32
	);
	float alpha = 0.2
		+ seed * 0.42
		+ u_energy * 0.38;
	v_color = vec4(
		color,
		alpha * mix(0.38, 1.0, depthFade)
	);
	v_depth = clamp(
		(cameraDepth - 0.85) / 2.3,
		0.0,
		1.0
	);
	v_seed = seed;
	v_luminance = clamp(
		0.35
			+ u_energy * 0.45
			+ u_pulse * 0.35
			+ seedThree * 0.2,
		0.0,
		1.35
	);
}
`;
