// B"H
// Boruch Hashem
// Blessed is He
/**
 * Each particle receives depth, phase, velocity, age, family, and source tint.
 * The Awtsmoos renews its orbit; Awtsmoos.com keeps glow soft and peripheral.
 */

export const PARTICLE_VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location = 0) in vec4 aPositionPhase;
layout(location = 1) in vec4 aMotionFamily;
layout(location = 2) in vec3 aColor;

uniform float uTime;
uniform float uScroll;
uniform vec2 uPointer;
uniform vec4 uInteraction;
uniform vec3 uInteractionColor;
uniform vec2 uFeedBounds;
uniform float uMotionScale;

out vec3 vColor;
out float vAlpha;

void main() {
	vec2 base = aPositionPhase.xy;
	float depth = aPositionPhase.z;
	float phase = aPositionPhase.w;
	vec2 velocity = aMotionFamily.xy;
	float age = aMotionFamily.z;
	float family = aMotionFamily.w;
	float time = uTime * (0.025 + depth * 0.018) * uMotionScale;
	float orbit = phase + time + family * 1.7;
	vec2 position = base + velocity * sin(time + phase) * 0.12;
	position += vec2(cos(orbit), sin(orbit)) * (0.012 + depth * 0.025);
	vec2 flow = vec2(
		sin(position.y * 5.0 + time * 18.0 + phase),
		cos(position.x * 4.0 - time * 14.0 - phase)
	);
	position += flow * (0.003 + family * 0.0018) * uMotionScale;
	position.y += fract(uScroll * 0.00008 * (0.3 + depth) + age) * 0.08 - 0.04;
	vec2 pointerDelta = position - uPointer;
	float pointerDistance = max(length(pointerDelta), 0.025);
	position += pointerDelta / pointerDistance * max(0.0, 0.18 - pointerDistance) * 0.055;
	vec2 anchor = uInteraction.xy * 2.0 - 1.0;
	vec2 anchorDelta = position - anchor;
	float anchorDistance = max(length(anchorDelta), 0.025);
	float resonance = exp(-anchorDistance * 5.0) * uInteraction.z;
	vec2 tangent = vec2(-anchorDelta.y, anchorDelta.x) / anchorDistance;
	position += tangent * resonance * 0.024 * uMotionScale;
	position += anchorDelta / anchorDistance * resonance * 0.016;
	float pulseProgress = 1.0 - uInteraction.w;
	float pulseRadius = 0.05 + pulseProgress * 0.34;
	float pulse = exp(-abs(anchorDistance - pulseRadius) * 20.0) * uInteraction.w;
	gl_Position = vec4(position, depth * 0.4, 1.0);
	gl_PointSize = (1.2 + depth * 3.2 + family) * (1.0 + resonance * 0.5 + pulse * 0.7);
	float inFeed = step(uFeedBounds.x, position.x) * step(position.x, uFeedBounds.y);
	vAlpha = mix(0.25, 0.038, inFeed) * (0.45 + depth * 0.55);
	vColor = mix(aColor, uInteractionColor, min(0.62, resonance * 0.48 + pulse * 0.42));
}
`;

export const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
out vec4 outColor;

void main() {
	vec2 point = gl_PointCoord * 2.0 - 1.0;
	float radius = dot(point, point);
	if (radius > 1.0) {
		discard;
	}
	float glow = pow(1.0 - radius, 2.4);
	outColor = vec4(vColor * glow, vAlpha * glow);
}
`;
