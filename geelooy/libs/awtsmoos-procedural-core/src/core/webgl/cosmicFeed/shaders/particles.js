// B"H
// Boruch Hashem
// Blessed is He
/**
 * Dust, sparks, filaments, and flares become one responsive field. The Awtsmoos
 * renews every point while Awtsmoos.com keeps all motion inside one GPU draw call.
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
out vec2 vDirection;
out float vFlare;
void main() {
	vec2 base = aPositionPhase.xy;
	float depth = aPositionPhase.z;
	float phase = aPositionPhase.w;
	vec2 velocity = aMotionFamily.xy;
	float age = aMotionFamily.z;
	float family = aMotionFamily.w;
	float dust = 1.0 - smoothstep(0.22, 0.28, family);
	float spark = smoothstep(0.22, 0.28, family) * (1.0 - smoothstep(0.47, 0.53, family));
	float filament = smoothstep(0.47, 0.53, family) * (1.0 - smoothstep(0.72, 0.78, family));
	float flare = smoothstep(0.72, 0.78, family);
	float familyClock = dust * 0.45 + spark * 1.25 + filament * 0.82 + flare * 0.36;
	float time = uTime * (0.055 + depth * 0.04) * familyClock * uMotionScale;
	float orbit = phase + time * (4.0 + spark * 3.0 + filament * 1.5);
	float orbitRadius = dust * 0.01 + spark * 0.045 + filament * 0.022 + flare * 0.065;
	vec2 position = base + velocity * sin(time * 1.7 + phase) * (0.16 + dust * 0.12 + filament * 0.18);
	position += vec2(cos(orbit), sin(orbit)) * orbitRadius * (0.45 + depth);
	float sideSign = sign(base.x);
	float riverWave = sin(base.y * (5.0 + filament * 4.0) + time * 7.0 + phase);
	position.x += sideSign * riverWave * (dust * 0.006 + spark * 0.012 + filament * 0.036 + flare * 0.018);
	position.y += cos(base.x * 7.0 - time * 4.0 + phase) * (spark * 0.012 + filament * 0.018);
	position.y += fract(uScroll * 0.00008 * (0.4 + depth) + age) * 0.1 - 0.05;
	position.y -= uScrollVelocity * (dust * 0.015 + spark * 0.04 + filament * 0.12 + flare * 0.035) * (0.5 + depth) * uMotionScale;
	vec2 pointerDelta = position - uPointer;
	float pointerDistance = max(length(pointerDelta), 0.025);
	vec2 pointerTangent = vec2(-pointerDelta.y, pointerDelta.x) / pointerDistance;
	float pointerWake = exp(-pointerDistance * 3.1) * length(uPointerVelocity);
	float wakeStrength = dust * 0.025 + spark * 0.14 + filament * 0.2 + flare * 0.11;
	position += pointerTangent * pointerWake * wakeStrength;
	position -= uPointerVelocity * (dust * 0.012 + spark * 0.035 + filament * 0.055 + flare * 0.045) * (0.4 + depth);
	float repulsion = max(0.0, 0.2 - pointerDistance) / 0.2;
	position += pointerDelta / pointerDistance * repulsion * (0.012 + spark * 0.04 + flare * 0.03);
	vec2 anchor = uInteraction.xy * 2.0 - 1.0;
	vec2 anchorDelta = position - anchor;
	float anchorDistance = max(length(anchorDelta), 0.025);
	float resonance = exp(-anchorDistance * 4.2) * uInteraction.z;
	vec2 anchorTangent = vec2(-anchorDelta.y, anchorDelta.x) / anchorDistance;
	position += anchorTangent * resonance * (dust * 0.012 + spark * 0.06 + filament * 0.04 + flare * 0.09);
	position += anchorDelta / anchorDistance * resonance * (filament * 0.02 + flare * 0.035);
	float pulseRadius = 0.05 + (1.0 - uInteraction.w) * 0.38;
	float pulse = exp(-abs(anchorDistance - pulseRadius) * 18.0) * uInteraction.w;
	float pointSize = dust * (0.8 + depth * 1.7) + spark * (1.5 + depth * 3.8) + filament * (1.0 + depth * 2.9) + flare * (3.0 + depth * 5.8);
	gl_Position = vec4(position, depth * 0.4, 1.0);
	gl_PointSize = min(12.0, pointSize * (1.0 + resonance * 0.7 + pulse + uKineticEnergy * 0.32));
	float inFeed = step(uFeedBounds.x, position.x) * step(position.x, uFeedBounds.y);
	float sideStrength = smoothstep(0.22, 0.78, abs(position.x));
	float familyAlpha = dust * 0.22 + spark * 0.42 + filament * 0.36 + flare * 0.62;
	vAlpha = mix(familyAlpha * (0.55 + sideStrength * 0.55), 0.01 + flare * 0.015, inFeed) * (0.5 + depth * 0.55);
	vCore = spark * 0.35 + filament * 0.2 + flare + pulse * 0.5;
	vStreak = clamp(abs(uScrollVelocity) * (spark * 0.45 + filament * 1.35 + flare * 0.3) + pointerWake * (spark * 0.8 + filament * 0.65 + flare * 1.2), 0.0, 1.0);
	vec2 flow = uPointerVelocity + vec2(0.001, -uScrollVelocity * (0.5 + filament));
	vDirection = flow / max(length(flow), 0.001);
	vFlare = flare + pulse * 0.35;
	vColor = mix(aColor, uInteractionColor, min(0.78, resonance * (spark * 0.3 + filament * 0.55 + flare * 0.8) + pulse * 0.65));
}
`;

export const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
in float vCore;
in float vStreak;
in vec2 vDirection;
in float vFlare;
out vec4 outColor;
void main() {
	vec2 point = gl_PointCoord * 2.0 - 1.0;
	vec2 rotated = mat2(vDirection.x, -vDirection.y, vDirection.y, vDirection.x) * point;
	rotated.y *= mix(1.0, 3.4, vStreak);
	float radius = dot(rotated, rotated);
	if (radius > 1.0) discard;
	float halo = (1.0 - radius) * (1.0 - radius);
	float core = smoothstep(0.24, 0.0, radius) * (0.3 + vCore * 0.7);
	float horizontal = smoothstep(0.1, 0.0, abs(rotated.y));
	float vertical = smoothstep(0.1, 0.0, abs(rotated.x));
	float cross = (horizontal + vertical) * smoothstep(1.0, 0.0, radius) * vFlare;
	vec3 color = vColor * (halo * 0.9 + core * 1.5 + cross * 0.62);
	outColor = vec4(color, vAlpha * max(max(halo, core), cross * 0.4));
}
`;
