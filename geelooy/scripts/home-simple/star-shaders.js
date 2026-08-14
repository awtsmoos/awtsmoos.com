// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos bends dust and stars through depth, attention, and spectral fire, while every motion remains inside the GPU vessel.

export const STAR_VERTEX_SHADER = `
	precision highp float;
	attribute vec3 a_position;
	attribute float a_size;
	attribute float a_seed;
	attribute float a_hue;
	attribute float a_speed;
	attribute float a_alpha;
	uniform float u_time;
	uniform float u_aspect;
	uniform float u_dpr;
	uniform float u_scroll;
	uniform vec2 u_pointer;
	uniform vec2 u_pointer_velocity;
	uniform float u_pointer_strength;
	varying float v_alpha;
	varying float v_depth;
	varying float v_hue;
	varying float v_seed;

	void main() {
		float depth = mix(0.32, 1.0, a_position.z);
		float orbit = u_time * 0.014 * a_speed + a_seed * 6.2831853;
		float curl = (1.0 - depth) * 0.025 + 0.006;
		float sineOrbit = sin(orbit);
		float cosineOrbit = cos(orbit);
		vec2 point = a_position.xy;
		point += vec2(cosineOrbit, sineOrbit) * curl;
		point.y += sin(u_time * 0.026 + point.x * 8.0 + a_seed * 9.0) * 0.008 * depth;
		point.x += cos(u_time * 0.019 + point.y * 7.0 + a_seed * 5.0) * 0.005;
		point.y += (u_scroll - 0.5) * 0.045 * depth;

		vec2 pointerDelta = point - u_pointer;
		pointerDelta.x *= u_aspect;
		float pointerDistance = max(length(pointerDelta), 0.001);
		float pointerField = exp(-pointerDistance * pointerDistance * 4.2);
		vec2 pointerDirection = pointerDelta / pointerDistance;
		vec2 wake = vec2(-u_pointer_velocity.y, u_pointer_velocity.x);
		point -= pointerDirection * pointerField * u_pointer_strength * 0.035 * depth;
		point += wake * pointerField * u_pointer_strength * 0.06 * depth;

		float twinkle = 0.72 + 0.28 * sin(u_time * 1.3 * a_speed + a_seed * 18.0);
		gl_Position = vec4(point, 0.0, 1.0);
		gl_PointSize = clamp(a_size * mix(0.72, 1.65, depth) * twinkle * u_dpr, 1.0, 16.0);
		v_alpha = a_alpha * twinkle;
		v_depth = depth;
		v_hue = a_hue;
		v_seed = a_seed;
	}
`;

export const STAR_FRAGMENT_SHADER = `
	precision mediump float;
	varying float v_alpha;
	varying float v_depth;
	varying float v_hue;
	varying float v_seed;

	vec3 spectralColor(float hue) {
		vec3 cyan = vec3(0.40, 0.82, 1.0);
		vec3 violet = vec3(0.67, 0.49, 1.0);
		vec3 whiteFire = vec3(0.95, 0.97, 1.0);
		vec3 blue = mix(cyan, violet, smoothstep(0.18, 0.78, hue));
		return mix(blue, whiteFire, smoothstep(0.78, 1.0, hue));
	}

	void main() {
		float radius = distance(gl_PointCoord, vec2(0.5));
		float core = smoothstep(0.24, 0.0, radius);
		float halo = smoothstep(0.5, 0.08, radius) * 0.46;
		float ray = max(
			smoothstep(0.09, 0.0, abs(gl_PointCoord.x - 0.5)),
			smoothstep(0.09, 0.0, abs(gl_PointCoord.y - 0.5))
		) * smoothstep(0.48, 0.05, radius) * step(0.91, v_seed);
		float alpha = (core + halo + ray * 0.42) * v_alpha * mix(0.62, 1.0, v_depth);
		gl_FragColor = vec4(spectralColor(v_hue), alpha);
	}
`;
