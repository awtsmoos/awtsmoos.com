// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyMediaCapture
 * @description
 * The Awtsmoos acquires local media, records supported bytes, downloads one
 * truthful file, and closes every track without a server or hidden upload.
 */

const mimeCandidates = [
	"video/webm;codecs=vp9,opus",
	"video/webm;codecs=vp8,opus",
	"video/webm",
	"video/mp4"
];

export async function acquireCameraStream() {
	if (!navigator.mediaDevices?.getUserMedia) {
		throw new Error("Camera recording is not supported by this browser.");
	}
	return navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true
	});
}

export async function acquireDesktopStream() {
	if (!navigator.mediaDevices?.getDisplayMedia) {
		throw new Error("Desktop recording is not supported by this browser.");
	}
	return navigator.mediaDevices.getDisplayMedia({
		video: {
			frameRate: {
				ideal: 30,
				max: 60
			}
		},
		audio: true
	});
}

export function beginRecording(stream, kind, onComplete, onError) {
	if (!("MediaRecorder" in window)) {
		throw new Error("MediaRecorder is not supported by this browser.");
	}
	const mimeType = selectMimeType();
	const recorder = mimeType
		? new MediaRecorder(stream, { mimeType })
		: new MediaRecorder(stream);
	const chunks = [];
	const session = {
		kind,
		stream,
		recorder,
		chunks,
		mimeType: recorder.mimeType || mimeType || "video/webm"
	};
	recorder.addEventListener("dataavailable", event => {
		if (event.data?.size) {
			chunks.push(event.data);
		}
	});
	recorder.addEventListener("error", event => {
		onError(event.error || new Error("Recording failed."));
	});
	recorder.addEventListener("stop", () => {
		const blob = new Blob(chunks, {
			type: session.mimeType
		});
		stopStream(stream);
		if (!blob.size) {
			onError(new Error("The recording was empty."));
			return;
		}
		downloadRecording(blob, kind);
		onComplete(blob);
	});
	stream.getTracks().forEach(track => {
		track.addEventListener("ended", () => {
			if (recorder.state === "recording") {
				recorder.stop();
			}
		}, { once: true });
	});
	recorder.start(500);
	return session;
}

export function stopRecording(session) {
	if (!session) {
		return;
	}
	if (session.recorder.state === "recording") {
		session.recorder.stop();
		return;
	}
	stopStream(session.stream);
}

export function stopStream(stream) {
	stream?.getTracks().forEach(track => track.stop());
}

function selectMimeType() {
	return mimeCandidates.find(candidate => {
		return MediaRecorder.isTypeSupported(candidate);
	}) || "";
}

function downloadRecording(blob, kind) {
	const extension = blob.type.includes("mp4") ? "mp4" : "webm";
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `BH_${kind}_${Date.now()}.${extension}`;
	anchor.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
