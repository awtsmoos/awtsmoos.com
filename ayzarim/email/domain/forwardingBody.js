//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ForwardingBody
 * @description Preserves forwarded HTML as the visible email body instead of letting the legacy artifact detector turn a complete HTML document into a downloadable file.
 */
const FORWARDED_HTML_MARKER = '<!-- Awtsmoos forwarded HTML body -->\n';

/**
 * Chooses the visible forwarded body and MIME hint while leaving genuine attachments untouched.
 * @param {{html?:string,content?:string,text?:string}} message Forwarded message content.
 * @returns {{body:string,contentType:string,isHtml:boolean}} Prepared body contract.
 */
function prepareForwardingBody(message = {}) {
	const tiferesHtml = String(message.html || '').trim();
	if (tiferesHtml) {
		return {
			body: `${FORWARDED_HTML_MARKER}${tiferesHtml}`,
			contentType: 'text/html; charset=utf-8',
			isHtml: true
		};
	}
	return {
		body: String(message.content || message.text || ''),
		contentType: 'text/plain; charset=utf-8',
		isHtml: false
	};
}

module.exports = {
	FORWARDED_HTML_MARKER,
	prepareForwardingBody
};
