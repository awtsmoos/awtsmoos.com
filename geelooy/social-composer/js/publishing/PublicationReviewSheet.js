//B"H
//Boruch Hashem
//Blessed is He

import { publicationReview } from './PublicationReviewModel.js';

/**
 * @class PublicationReviewSheet
 * @description
 * The Awtsmoos lets the creator behold the whole deed before release;
 * Awtsmoos.com turns final publication into one calm mobile sheet or desktop inspector where warnings, verification, and consent meet peace.
 */
export class PublicationReviewSheet {
	constructor({ root = document, state, workflow, planView, status }) {
		Object.assign(this, { root, state, workflow, planView, status });
	}

	initialize() {
		if (this.root.getElementById('publicationReviewDialog')) return false;
		this.dialog = this.root.createElement('dialog');
		this.dialog.id = 'publicationReviewDialog';
		this.dialog.className = 'publicationReviewDialog';
		this.dialog.innerHTML = [
			'<div class="publicationReviewHandle" aria-hidden="true"></div>',
			'<header class="publicationReviewHeader"><div><span>Final checkpoint</span><h2>Review & Publish</h2></div><button type="button" data-review-close>Close</button></header>',
			'<div class="publicationReviewIssues" data-review-issues hidden></div>',
			'<div class="publicationReviewGrid" data-review-grid></div>',
			'<footer class="publicationReviewActions"><button type="button" data-review-verify>Verify destinations</button><button type="button" class="primaryAction" data-review-publish>Publish</button></footer>'
		].join('');
		this.dialog.querySelector('[data-review-close]').addEventListener('click', () => this.close());
		this.dialog.querySelector('[data-review-verify]').addEventListener('click', () => void this.verify());
		this.dialog.querySelector('[data-review-publish]').addEventListener('click', () => void this.publish());
		this.root.body.append(this.dialog);
		return true;
	}

	open() {
		this.render();
		if (typeof this.dialog?.showModal === 'function') this.dialog.showModal();
		else this.dialog?.setAttribute('open', '');
	}

	close() {
		if (typeof this.dialog?.close === 'function') this.dialog.close();
		else this.dialog?.removeAttribute('open');
	}

	render() {
		const review = publicationReview(this.state.snapshot());
		this.renderIssues(review.issues);
		const grid = this.dialog.querySelector('[data-review-grid]');
		grid.replaceChildren(...review.cards.map(card => this.card(card)));
		const publish = this.dialog.querySelector('[data-review-publish]');
		publish.disabled = !review.ready;
		publish.textContent = review.plan.scheduledAt ? 'Schedule publication' : 'Publish now';
	}

	renderIssues(issues) {
		const region = this.dialog.querySelector('[data-review-issues]');
		region.hidden = !issues.length;
		region.replaceChildren();
		if (!issues.length) return;
		const heading = this.root.createElement('strong');
		heading.textContent = `${issues.length} item${issues.length === 1 ? '' : 's'} need attention`;
		const list = this.root.createElement('ul');
		for (const issue of issues) {
			const item = this.root.createElement('li');
			item.textContent = issue;
			list.append(item);
		}
		region.append(heading, list);
	}

	card(detail) {
		const article = this.root.createElement('article');
		article.className = 'publicationReviewCard';
		const title = this.root.createElement('span');
		title.textContent = detail.title;
		const value = this.root.createElement('strong');
		value.textContent = detail.value;
		const description = this.root.createElement('p');
		description.textContent = detail.detail;
		article.append(title, value, description);
		return article;
	}

	async verify() {
		await this.planView.preview();
		this.render();
	}

	async publish() {
		const review = publicationReview(this.state.snapshot());
		if (!review.ready) {
			this.render();
			this.status.show(review.issues.join(' '), 'error');
			return null;
		}
		const result = await this.workflow.publish();
		if (result) this.close();
		return result;
	}
}
