// B"H
// Boruch Hashem
// Blessed is He
/**
 * Depth becomes visible motion. The Awtsmoos renews every spark while
 * Awtsmoos.com turns pointer velocity and scroll wake into bounded luminous parallax.
 */

export const PARTICLE_VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location = 0) in vec4 aPositionPhase;
layout(location = 1) in vec4 aMotionFamily;
layout(location = 2) in vec3 aColor;
uniform float uTime;
uniform float uScroll;
uniform float uScrollVelocity;
uniform float uKineticEnergy;
uniform vec2 uPointer;
uniform vec2 uPointerVelocity;
uniform vec4 uInteraction;
uniform vec3 uInteractionColor;
uniform vec2 uFeedBounds;
uniform float uMotionScale;
out vec3 vColor;
out float vAlpha;
out float vCore;
out float vStreak;

void main() {
	vec2 base = aPositionPhase.xy;
	float depth = aPositionPhase.z;
	float phase = aPositionPhase.w;
	vec2 velocity = aMotionFamily.xy;
	float age = aMotionFamily.z;
	float family = aMotionFamily.w;
	float time = uTime * (0.028 + depth * 0.022) * uMotionScale;
	float orbit = phase + time + family * 2.2;
	vec2 position = base + velocity * sin(time * 1.4 + phase) * 0.18;
	position += vec2(cos(orbit), sin(orbit)) * (0.018 + depth * 0.045);
	vec2 flow = vec2(
		sin(position.y * 6.0 + time * 16.0 + phase),
		cos(position.x * 5.0 - time * 13.0 - phase)
	);
	position += flow * (0.004 + family * 0.003) * uMotionScale;
	position.y += fract(uScroll * 0.0001 * (0.35 + depth) + age) * 0.12 - 0.06;
	position.y -= uScrollVelocity * (0.025 + depth * 0.055) * uMotionScale;
	vec2 pointerDelta = position - uPointer;
	float pointerDistance = max(length(pointerDelta), 0.025);
	vec2 pointerTangent = vec2(-pointerDelta.y, pointerDelta.x) / pointerDistance;
	float pointerWake = exp(-pointerDistance * 3.8) * length(uPointerVelocity);
	position += pointerTangent * pointerWake * (0.09 + depth * 0.07);
	position -= uPointerVelocity * depth * 0.035;
	position += pointerDelta / pointerDistance * max(0.0, 0.22 - pointerDistance) * 0.07;
	vec2 anchor = uInteraction.xy * 2.0 - 1.0;
	vec2 anchorDelta = position - anchor;
	float anchorDistance = max(length(anchorDelta), 0.025);
	float resonance = exp(-anchorDistance * 4.5) * uInteraction.z;
	vec2 tangent = vec2(-anchorDelta.y, anchorDelta.x) / anchorDistance;
	position += tangent * resonance * 0.04 * uMotionScale;
	position += anchorDelta / anchorDistance * resonance * 0.022;
	float pulseRadius = 0.05 + (1.0 - uInteraction.w) * 0.38;
	float pulse = exp(-abs(anchorDistance - pulseRadius) * 18.0) * uInteraction.w;
	gl_Position = vec4(position, depth * 0.4, 1.0);
	gl_PointSize = (1.6 + depth * 4.7 + family * 1.8) *
		(1.0 + resonance * 0.72 + pulse + uKineticEnergy * 0.34);
	float inFeed = step(uFeedBounds.x, position.x) * step(position.x, uFeedBounds.y);
	float sideStrength = smoothstep(0.22, 0.78, abs(position.x));
	vAlpha = mix(0.34 + sideStrength * 0.2, 0.018, inFeed) * (0.48 + depth * 0.62);
	vCore = smoothstep(0.68, 1.0, depth) + pulse * 0.5;
	vStreak = clamp(abs(uScrollVelocity) * 0.62 + pointerWake * 1.4, 0.0, 1.0);
	vColor = mix(aColor, uInteractionColor, min(0.72, resonance * 0.62 + pulse * 0.52));
}
`;

export const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
in float vCore;
in float vStreak;
out vec4 outColor;

void main() {
	vec2 point = gl_PointCoord * 2.0 - 1.0;
	point.y *= mix(1.0, 0.42, vStreak);
	float radius = dot(point, point);
	if (radius > 1.0) {
		discard;
	}
	float halo = pow(1.0 - radius, 2.0);
	float core = smoothstep(0.24, 0.0, radius) * (0.35 + vCore * 0.65);
	vec3 color = vColor * (halo * 0.92 + core * 1.45);
	outColor = vec4(color, vAlpha * max(halo, core));
}
`;
