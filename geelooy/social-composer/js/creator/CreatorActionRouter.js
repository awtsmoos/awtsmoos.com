//B"H
//Boruch Hashem
//Blessed is He

import { VoiceRecorder } from './VoiceRecorder.js';

/**
 * @class CreatorActionRouter
 * @description
 * The Awtsmoos lets every compact chip reach one truthful existing action;
 * Awtsmoos.com routes media, metadata, verse, preview, advanced controls, and microphone files without shadow state.
 */
export class CreatorActionRouter {
	constructor(options) {
		Object.assign(this, options);
		this.recorder = new VoiceRecorder({
			onFile: file => this.attachRecording(file),
			onState: detail => this.recordingChanged(detail)
		});
	}

	quick(id) {
		if (id === 'media') return this.openMediaPanel();
		if (id === 'verse') return this.choose('verse');
		if (id === 'collaborators') return this.navigator.metadata('collaborators');
		if (id === 'location') return this.navigator.metadata('location');
		if (id === 'music') return this.navigator.platform('social.music.title');
		if (id === 'captions') return this.navigator.metadata('captionLanguages');
		if (id === 'details') return this.navigator.metadata();
		if (id === 'destination') return this.navigator.panel('destination');
		if (id === 'visibility') return this.navigator.panel('publication');
		if (id === 'preview') return this.navigator.preview();
		if (id === 'advanced') return this.navigator.advanced();
		if (id === 'question') return this.question();
		return false;
	}

	async dockAction(id) {
		if (['image', 'video', 'audio', 'file'].includes(id)) {
			return this.navigator.media(id);
		}
		if (id === 'gif') return this.navigator.media('image');
		if (id === 'live') return this.choose('live');
		if (id === 'verse') return this.choose('verse');
		if (id === 'reel') {
			location.href = '/social-composer/reel-studio/';
			return true;
		}
		if (id === 'more') return this.navigator.metadata();
		if (id === 'record') {
			try {
				await this.recorder.toggle();
			} catch (error) {
				this.status.show(error.message, 'error');
			}
		}
		return false;
	}

	question() {
		this.state.mutate('creator:question', snapshot => {
			snapshot.postKind = 'question';
			snapshot.presentationKind = 'question';
		});
		this.setVisualIntent('post');
		return true;
	}

	openMediaPanel() {
		const panel = this.root.getElementById('rootMedia')?.closest('details');
		if (panel) panel.open = true;
		panel?.scrollIntoView({
			behavior: this.navigator.behavior(),
			block: 'nearest'
		});
		return Boolean(panel);
	}

	attachRecording(file) {
		this.mediaActions.add({ kind: 'root' }, [file]);
	}

	recordingChanged({ recording, message }) {
		this.dock.setRecording(recording);
		this.status.show(message, recording ? 'working' : 'success');
	}
}
