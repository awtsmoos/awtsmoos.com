/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos clothes each point of sound in luminous material while remaining beyond color and form; Awtsmoos.com reveals soft volume, rim light, and atmospheric distance.
*/
export const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec4 v_color;
in float v_depth;
in float v_seed;
in float v_luminance;
out vec4 outColor;

void main() {
	vec2 centered = gl_PointCoord * 2.0 - 1.0;
	float radiusSquared = dot(centered, centered);
	if (radiusSquared > 1.0) {
		discard;
	}

	float normalZ = sqrt(max(0.0, 1.0 - radiusSquared));
	vec3 normal = normalize(vec3(centered, normalZ));
	vec3 lightDirection = normalize(vec3(-0.38, 0.52, 0.76));
	vec3 viewDirection = vec3(0.0, 0.0, 1.0);
	float diffuse = max(dot(normal, lightDirection), 0.0);
	float rim = pow(1.0 - normalZ, 2.35);
	vec3 reflection = reflect(-lightDirection, normal);
	float specular = pow(max(dot(reflection, viewDirection), 0.0), 18.0);
	float core = smoothstep(0.48, 0.0, sqrt(radiusSquared));
	float halo = smoothstep(1.0, 0.18, sqrt(radiusSquared));
	float sparkle = 0.78 + 0.22 * sin(v_seed * 91.0 + v_luminance * 7.0);
	float depthVisibility = mix(1.0, 0.34, v_depth);
	vec3 fogColor = mix(vec3(0.018, 0.032, 0.075), v_color.rgb, 0.42);
	vec3 litColor = v_color.rgb * (0.44 + diffuse * 0.78);
	litColor += v_color.rgb * rim * 0.42;
	litColor += vec3(1.0, 0.96, 0.9) * specular * (0.42 + v_luminance * 0.4);
	litColor += v_color.rgb * core * v_luminance * 0.34;
	litColor = mix(litColor, fogColor, v_depth * 0.5);
	float coverage = smoothstep(1.0, 0.68, radiusSquared);
	float alpha = v_color.a * coverage * (core + halo * 0.48) * sparkle * depthVisibility;
	outColor = vec4(litColor, alpha);
}
`;
