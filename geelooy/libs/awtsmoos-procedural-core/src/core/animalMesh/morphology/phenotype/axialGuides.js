// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos unfolds one continuous axis before limbs or fins appear. This
 * Awtsmoos.com module creates renderer-neutral guide data only; the established
 * animal compiler remains the sole geometry executor.
 */

function section(t, width, height, rotation = 0) {
	return { t, half_width: width, half_height: height, rotation };
}

function guide(centerline, widths, heights, segments = 16) {
	return {
		type: "elliptical_loft",
		centerline,
		sections: [
			section(0, widths[0], heights[0]),
			section(0.5, widths[1], heights[1]),
			section(1, widths[2], heights[2])
		],
		radial_segments: Math.max(8, segments),
		longitudinal_segments: Math.max(8, centerline.length * 4)
	};
}

function horizontalBody(archetypeId, traits) {
	const elongation = archetypeId === "serpentine" ? traits.elongation : 1;
	const length = 1.8 * traits.body_length * elongation;
	const elevation = archetypeId === "fish" ? 0.8 : archetypeId === "serpentine" ? 0.34 : 1.05;
	const width = 0.34 * traits.body_width * traits.muscle_mass;
	const depth = 0.38 * traits.body_depth * traits.muscle_mass;
	const pointCount = archetypeId === "serpentine" ? 11 : 5;
	const centerline = Array.from({ length: pointCount }, (_, index) => {
		const t = index / Math.max(1, pointCount - 1);
		const y = length * (0.5 - t);
		const wave = archetypeId === "serpentine"
			? Math.sin(t * Math.PI * 3) * traits.wave_amplitude * width
			: Math.sin(t * Math.PI) * traits.spine_bend * width;
		return [wave, y, elevation + Math.sin(t * Math.PI) * depth * 0.08];
	});
	return {
		guide: guide(centerline, [width * 0.72, width, width * 0.68], [depth * 0.75, depth, depth * 0.65], 18),
		front: centerline[0],
		rear: centerline.at(-1),
		width,
		depth,
		elevation
	};
}

function uprightBody(traits) {
	const height = 1.45 * traits.body_height * traits.torso_upright;
	const width = 0.3 * traits.body_width * traits.muscle_mass;
	const depth = 0.26 * traits.body_depth * traits.muscle_mass;
	const centerline = [[0, 0, 0.45], [0, 0, 0.45 + height * 0.52], [0, 0, 0.45 + height]];
	return {
		guide: guide(centerline, [width * 0.7, width, width * 0.78], [depth * 0.75, depth, depth * 0.9], 18),
		front: centerline.at(-1),
		rear: centerline[0],
		width,
		depth,
		elevation: centerline[1][2]
	};
}

function headGuide(archetypeId, body, traits) {
	const scale = traits.head_scale;
	if (archetypeId === "biped") {
		const start = body.front;
		const end = [0, 0, start[2] + 0.48 * scale];
		return guide([start, end], [body.width * 0.62, body.width * 0.72, body.width * 0.5], [body.depth * 0.65, body.depth * 0.78, body.depth * 0.55], 14);
	}
	const start = body.front;
	const neckEnd = [start[0], start[1] + 0.32 * scale, start[2] + body.depth * 0.18];
	const headEnd = [neckEnd[0], neckEnd[1] + 0.48 * scale, neckEnd[2]];
	return guide([start, neckEnd, headEnd], [body.width * 0.42, body.width * 0.6 * scale, body.width * 0.36], [body.depth * 0.4, body.depth * 0.64 * scale, body.depth * 0.4], 14);
}

function tailGuide(archetypeId, body, traits) {
	if (archetypeId === "biped" || archetypeId === "arthropod") return null;
	const length = (archetypeId === "fish" ? 1.1 : 0.9) * traits.tail_length;
	const start = body.rear;
	const middle = [start[0], start[1] - length * 0.52, start[2] + traits.spine_bend * body.depth];
	const end = [start[0], start[1] - length, start[2] - body.depth * 0.18];
	const width = archetypeId === "fish" ? body.width * 0.46 : body.width * 0.38;
	return guide([start, middle, end], [width, width * 0.58, width * 0.08], [body.depth * 0.5, body.depth * 0.3, body.depth * 0.08], 12);
}

export function createAxialPhenotypeGuides(profile) {
	const archetypeId = profile.archetype_id;
	const traits = profile.genome.traits;
	const body = archetypeId === "biped" ? uprightBody(traits) : horizontalBody(archetypeId, traits);
	const guides = { body: body.guide, head: headGuide(archetypeId, body, traits) };
	const tail = tailGuide(archetypeId, body, traits);
	if (tail) guides.tail = tail;
	return { guides, anchors: body };
}
