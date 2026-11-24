//B"H
/** The Awtsmoos renders one track — effects, automation and MIDI together — into rest. */
import { createMultitrackProject, createMultitrackClip } from './multitrackProject.js';
import { renderMultitrackOffline } from './multitrackOfflineMix.js';
import { freezeTrackWithClip } from './multitrackFreeze.js';
import { createMultitrackId } from './multitrackIds.js';

/**
 * Renders exactly one track through the shared offline mix (so the frozen PCM
 * is the same signal the export would produce), registers the render as a new
 * source buffer, and returns the frozen track. The source project is untouched.
 */
export async function renderTrackFreeze(project, trackId, audioStore) {
	const track = project.tracks.find(candidate => candidate.id === trackId);
	if (!track) throw Error('Freeze: track not found.');
	if (track.frozen) throw Error('Track is already frozen.');
	const solo = { ...track, muted: false, solo: false };
	const single = createMultitrackProject({ tempo: project.tempo, tracks: [solo] });
	const buffer = await renderMultitrackOffline(single, audioStore, 44100);
	const bufferId = createMultitrackId('buffer');
	audioStore.setBuffer(bufferId, buffer, `${track.name} (frozen)`);
	const clip = createMultitrackClip({
		name: `${track.name} (frozen)`, bufferId, timelineStart: 0, duration: buffer.duration, gain: 1
	});
	return freezeTrackWithClip(track, clip);
}
