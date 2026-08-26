// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** ChochmahQaApi models questions and answers as first-class social content relationships. */
export class ChochmahQaApi extends YesodEndpointService {
	/** @param {string} yesodQuestionId @returns {string} Encoded question path. */
	questionPath(yesodQuestionId) {
		return `/questions/${this.identity(yesodQuestionId)}`;
	}

	/** @param {object} malchusBody @returns {Promise<object>} Created question. */
	ask(malchusBody) {
		return this.yesodClient.post('/questions', malchusBody);
	}

	/** @param {string} yesodQuestionId @returns {Promise<object>} Question envelope. */
	get(yesodQuestionId) {
		return this.yesodClient.get(this.questionPath(yesodQuestionId));
	}

	/** @param {string} yesodQuestionId @param {object} malchusBody @returns {Promise<object>} Created answer. */
	answer(yesodQuestionId, malchusBody) {
		return this.yesodClient.post(`${this.questionPath(yesodQuestionId)}/answers`, malchusBody);
	}

	/** @param {string} yesodQuestionId @returns {Promise<object>} Answer list. */
	answersForQuestion(yesodQuestionId) {
		return this.yesodClient.get(`${this.questionPath(yesodQuestionId)}/answers`);
	}

	/** @param {string} yesodQuestionId @param {object} malchusBody @returns {Promise<object>} Accepted-answer mutation. */
	acceptedAnswer(yesodQuestionId, malchusBody) {
		return this.yesodClient.post(`${this.questionPath(yesodQuestionId)}/accepted-answer`, malchusBody);
	}

	/** @param {string} yesodAnswerId @returns {Promise<object>} Answer comments. */
	answerComments(yesodAnswerId) {
		return this.yesodClient.get(`/answers/${this.identity(yesodAnswerId)}/comments`);
	}
}

/** @param {object} yesodClient @returns {ChochmahQaApi} Q&A service. */
export function createQaApi(yesodClient) {
	return new ChochmahQaApi(yesodClient);
}
