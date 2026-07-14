//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class PostPreview
 * @description
 * The composed post appears as a safe social card with kind, author, rich body,
 * media, verses, and exact discussion coordinates. Awtsmoos.com lets the writer
 * behold the vessel before publication beneath the seeing light of the Awtsmoos.
 */

import { buildPostPayload } from '../model/PostPayload.js';
import { renderAttachments, renderDocument } from './RichDocumentView.js';

export class PostPreview {
	constructor(container, inspector) {
		this.container = container;
		this.inspector = inspector;
	}

	render(snapshot) {
		const payload = buildPostPayload(snapshot);
		this.container.textContent = '';
		this.container.append(this.header(payload));
		renderDocument(this.container, payload.rootDocument);
		renderAttachments(this.container, snapshot.rootAttachments);
		for (const section of payload.sections) {
			this.container.append(this.section(section, snapshot));
		}
		this.inspector.textContent = JSON.stringify(payload, null, 2);
		return payload;
	}

	header(payload) {
		const header = document.createElement('header');
		header.className = 'previewHeader';
		const badge = document.createElement('span');
		badge.className = `kindBadge kind-${payload.postKind}`;
		badge.textContent = payload.postKind;
		const title = document.createElement('h1');
		title.textContent = payload.title || 'Untitled';
		const byline = document.createElement('p');
		byline.textContent = `${payload.aliasId || 'No alias'} · ${payload.heichelId || 'No Heichel'}`;
		header.append(badge, title, byline);
		if (payload.summary) {
			const summary = document.createElement('p');
			summary.className = 'previewSummary';
			summary.textContent = payload.summary;
			header.append(summary);
		}
		if (payload.postKind === 'question') header.append(this.questionPolicy(payload));
		return header;
	}

	questionPolicy(payload) {
		const policy = document.createElement('aside');
		policy.className = 'questionPolicy';
		const options = payload.questionOptions || {};
		policy.textContent = options.answerGuidance
			? `Answers: ${options.answerPolicy}. ${options.answerGuidance}`
			: `Answers: ${options.answerPolicy || 'open'}.`;
		return policy;
	}

	section(section, snapshot) {
		const article = document.createElement('article');
		article.className = 'previewSection';
		const title = document.createElement('h2');
		title.textContent = section.title;
		article.append(title, this.coordinate('verse', section.id));
		renderDocument(article, section.document);
		const original = snapshot.sections.find(item => item.id === section.id);
		renderAttachments(article, original?.attachments || []);
		for (const subsection of section.subsections || []) {
			article.append(this.subsection(subsection, section.id));
		}
		return article;
	}

	subsection(subsection, verseId) {
		const article = document.createElement('section');
		article.className = 'previewSubsection';
		const title = document.createElement('h3');
		title.textContent = subsection.label;
		article.append(title, this.coordinate('subsection', `${verseId} / ${subsection.id}`));
		renderDocument(article, subsection.document);
		return article;
	}

	coordinate(scope, value) {
		const code = document.createElement('code');
		code.className = 'discussionCoordinate';
		code.textContent = `Discuss ${scope}: ${value}`;
		return code;
	}
}
