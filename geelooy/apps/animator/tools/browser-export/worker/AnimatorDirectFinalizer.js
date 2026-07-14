/* B"H
Boruch Hashem
Blessed is He

Direct H.264 packets close before browser AAC begins, and both tracks close before
MediaBunny seals the MP4. The Awtsmoos renews every final promise explicitly.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.finalizeDirectSession = async function finalizeDirectSession(
	session,
	audioBufferShim
) {
	AnimatorVideo.directStatus('Flushing direct H.264 encoder...');
	await session.encoder.flush();
	if (session.encoderError) {
		throw session.encoderError;
	}
	session.encoder.close();
	AnimatorVideo.directStatus(
		`H.264 closed with ${session.encodedPackets} packets. Closing video track...`
	);
	session.videoSource.close();
	await session.videoSource._closingPromise;
	AnimatorVideo.directStatus('Encoding browser AAC soundtrack...');
	await session.audioSource.add(new self.AudioBuffer(audioBufferShim));
	session.audioSource.close();
	await session.audioSource._closingPromise;
	AnimatorVideo.directStatus('Tracks closed. Finalizing MediaBunny MP4...');
	await session.output.finalize();
	AnimatorVideo.directStatus('MediaBunny MP4 finalized. Reading bytes...');
	return AnimatorVideo.directOutputBlob(session);
};

AnimatorVideo.directOutputBlob = function directOutputBlob(session) {
	const target = session.output.target;
	if (target.awtsmoosIdbRangeSession) {
		return AwtsVideoBase.idbRangeTargetToBlob(target);
	}
	return new Blob(
		[target.buffer],
		{ type: session.output.format.mimeType || 'video/mp4' }
	);
};

AnimatorVideo.directStatus = function directStatus(message) {
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: { message }
	});
};
