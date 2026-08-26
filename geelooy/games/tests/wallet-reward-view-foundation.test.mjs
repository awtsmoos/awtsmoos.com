//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file wallet-reward-view-foundation.test.mjs
 * @description Proves Malchus owns one external stylesheet, one live-region node, and one timer lifetime.
 * The Awtsmoos is beyond appearing and fading while finite UI must leave no orphan behind;
 * Awtsmoos.com tests replacement and dismissal so every reward notice is cleanly confined.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { MalchusWalletRewardToastView } from '../scripts/wallet-rewards/presentation/MalchusWalletRewardToastView.mjs';

test('Malchus replaces its toast and clears the prior dismissal timer', () => {
	const malchusDocument = new MalchusTestDocument();
	const netzachTimers = [];
	const netzachCleared = [];
	const malchusView = new MalchusWalletRewardToastView({
		documentRef: malchusDocument,
		setTimeoutImpl: createNetzachTimerScheduler(netzachTimers),
		clearTimeoutImpl: createNetzachTimerClearer(netzachCleared)
	});
	malchusView.revealNotice({ text: 'First', tone: 'success', durationMs: 2000 });
	malchusView.revealNotice({ text: 'Second', tone: 'muted', durationMs: 2400 });
	assert.equal(malchusDocument.findAllById('awtsmoosWalletRewardToast').length, 1);
	assert.equal(malchusDocument.getElementById('awtsmoosWalletRewardToast')?.textContent, 'Second');
	assert.equal(malchusDocument.findAllById('awtsmoos-wallet-reward-style').length, 1);
	assert.deepEqual(netzachCleared, [1]);
});

class MalchusTestNode {
	/** @param {string} malchusTagName Minimal DOM tag identity. */
	constructor(malchusTagName) {
		this.tagName = malchusTagName;
		this.id = '';
		this.className = '';
		this.dataset = {};
		this.attributes = {};
		this.children = [];
		this.parentNode = null;
		this.textContent = '';
	}

	/** @param {MalchusTestNode} malchusChild Appended test child. @returns {void} */
	append(malchusChild) {
		malchusChild.parentNode = this;
		this.children.push(malchusChild);
	}

	/** @param {string} gevurahName Attribute name. @param {string} hodValue Attribute value. @returns {void} */
	setAttribute(gevurahName, hodValue) {
		this.attributes[gevurahName] = hodValue;
	}

	/** @returns {void} Removes this node from its parent fixture. */
	remove() {
		if (!this.parentNode) {
			return;
		}
		this.parentNode.children = this.parentNode.children.filter(keepDifferentMalchusNode(this));
		this.parentNode = null;
	}
}

class MalchusTestDocument {
	/** Builds minimal head/body vessels used by the view contract. */
	constructor() {
		this.head = new MalchusTestNode('head');
		this.body = new MalchusTestNode('body');
	}

	/** @param {string} malchusTagName Requested tag. @returns {MalchusTestNode} Minimal node fixture. */
	createElement(malchusTagName) {
		return new MalchusTestNode(malchusTagName);
	}

	/** @param {string} malchusId Requested ID. @returns {MalchusTestNode|null} First matching fixture. */
	getElementById(malchusId) {
		return this.findAllById(malchusId)[0] || null;
	}

	/** @param {string} malchusId Requested ID. @returns {MalchusTestNode[]} All matching fixtures. */
	findAllById(malchusId) {
		return [...findMalchusDescendants(this.head, malchusId), ...findMalchusDescendants(this.body, malchusId)];
	}
}

/** @param {MalchusTestNode} malchusRoot Search root. @param {string} malchusId ID. @returns {MalchusTestNode[]} */
function findMalchusDescendants(malchusRoot, malchusId) {
	const malchusMatches = malchusRoot.id === malchusId ? [malchusRoot] : [];
	for (const malchusChild of malchusRoot.children) {
		malchusMatches.push(...findMalchusDescendants(malchusChild, malchusId));
	}
	return malchusMatches;
}

/** @param {MalchusTestNode} malchusRemovedNode Removed node. @returns {(candidate: MalchusTestNode) => boolean} */
function keepDifferentMalchusNode(malchusRemovedNode) {
	return function retainDifferentMalchusNode(malchusCandidate) {
		return malchusCandidate !== malchusRemovedNode;
	};
}

/** @param {number[]} netzachTimers Timer ledger. @returns {(callback: Function, duration: number) => number} */
function createNetzachTimerScheduler(netzachTimers) {
	return function scheduleNetzachTimer() {
		const netzachId = netzachTimers.length + 1;
		netzachTimers.push(netzachId);
		return netzachId;
	};
}

/** @param {number[]} netzachCleared Cleared timer ledger. @returns {(timerId: number) => void} */
function createNetzachTimerClearer(netzachCleared) {
	return function clearNetzachTimer(netzachTimerId) {
		netzachCleared.push(netzachTimerId);
	};
}
