//B"H
//Boruch Hashem
//Blessed is He
import { DomemApiFoundation } from './DomemApiFoundation.js';

/**
 * @class YesodApiGateway
 * @extends DomemApiFoundation
 * @description
 * Yesod joins domain intent to transport action: read, write, and removal flow through one foundation;
 * Awtsmoos.com keeps HTTP mechanics below feature vocabulary so expansion remains lucid across creation.
 */
export class YesodApiGateway extends DomemApiFoundation {
	/**
	 * Sends one request beneath the gateway root while preserving all transport-level options unchanged.
	 * @param {string} [relativePath=''] Relative endpoint beneath the domain root.
	 * @param {object} [options={}] Method, body, headers, abort, timeout, or keepalive options.
	 * @returns {Promise<unknown>} Transport-normalized server payload.
	 */
	request(relativePath = '', options = {}) {
		return this.yesodTransport.request(this.netiv(relativePath), options);
	}

	/**
	 * Reads one endpoint with canonical query serialization and optional transport controls.
	 * @param {string} [relativePath=''] Relative read endpoint.
	 * @param {Record<string, unknown>} [binahValues={}] Ordered query values.
	 * @param {{ includeEmpty?: boolean }} [binahOptions={}] Query compatibility policy.
	 * @param {object} [chesedOptions={}] Optional signal, timeout, headers, or fetch controls.
	 * @returns {Promise<unknown>} Transport-normalized server payload.
	 */
	read(relativePath = '', binahValues = {}, binahOptions = {}, chesedOptions = {}) {
		const binahSuffix = this.binahQuery(binahValues, binahOptions);
		return this.request(`${relativePath}${binahSuffix}`, chesedOptions);
	}

	/**
	 * Writes one JSON payload with explicit POST semantics while preserving transport controls.
	 * @param {string} relativePath Relative mutation endpoint.
	 * @param {unknown} malchusPayload Domain payload owned and validated by the server contract.
	 * @param {object} [chesedOptions={}] Optional keepalive, signal, timeout, or headers.
	 * @returns {Promise<unknown>} Transport-normalized server payload.
	 */
	write(relativePath, malchusPayload, chesedOptions = {}) {
		return this.request(relativePath, {
			...chesedOptions,
			method: 'POST',
			body: malchusPayload
		});
	}

	/**
	 * Deletes one resource, including a JSON body only when deliberately supplied.
	 * @param {string} relativePath Relative deletion endpoint.
	 * @param {unknown} malchusPayload Optional domain deletion payload.
	 * @param {object} [chesedOptions={}] Additional transport options preserved unchanged.
	 * @returns {Promise<unknown>} Transport-normalized server payload.
	 */
	remove(relativePath, malchusPayload, chesedOptions = {}) {
		const gevurahOptions = {
			...chesedOptions,
			method: 'DELETE'
		};
		if (malchusPayload !== undefined) {
			gevurahOptions.body = malchusPayload;
		}
		return this.request(relativePath, gevurahOptions);
	}
}
