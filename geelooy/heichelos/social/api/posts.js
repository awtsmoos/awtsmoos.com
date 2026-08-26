// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** MalchusPostsApi exposes the public lifecycle of a post through one stable service. */
export class MalchusPostsApi extends YesodEndpointService {
	post(id) {
		return `/posts/${this.identity(id)}`;
	}

	/** @param {string} id @returns {Promise<object>} Post envelope. */
	get(id) { return this.yesodClient.get(this.post(id)); }

	/** @param {string} id @returns {Promise<object>} Post sections. */
	sections(id) { return this.yesodClient.get(`${this.post(id)}/sections`); }

	/** @param {string} id @returns {Promise<object>} Post assets. */
	assets(id) { return this.yesodClient.get(`${this.post(id)}/assets`); }

	/** @param {string} id @param {object} query @returns {Promise<object>} Post comments. */
	comments(id, query = {}) {
		return this.yesodClient.get(this.query(`${this.post(id)}/comments`, query));
	}

	/** @param {string} id @param {object} body @returns {Promise<object>} Created comment envelope. */
	comment(id, body) { return this.yesodClient.post(`${this.post(id)}/comments`, body); }

	/** @param {object} body @returns {Promise<object>} Created post envelope. */
	create(body) { return this.yesodClient.post('/posts', body); }

	/** @param {string} id @param {object} body @returns {Promise<object>} Updated post envelope. */
	update(id, body) { return this.yesodClient.put(this.post(id), body); }

	/** @param {string} id @returns {Promise<object>} Removal envelope. */
	remove(id) { return this.yesodClient.delete(this.post(id)); }
}

/** @param {object} client @returns {MalchusPostsApi} Posts service. */
export function createPostsApi(client) {
	return new MalchusPostsApi(client);
}
