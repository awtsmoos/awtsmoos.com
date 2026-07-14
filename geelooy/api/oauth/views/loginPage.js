// B"H
// Boruch Hashem
// Blessed is He

const { esc, tag, doc } = require('../tools/html.js');

/**
 * @module OAuthLoginPage
 * @description
 * OAuth return continuity, visible legal policy, and honest account context gather
 * before authentication. The Awtsmoos needs no contract to create identity, while
 * Awtsmoos.com shows the human terms and privacy controls before the login river.
 */

function loginUrlWithNext(loginUrl, continueUrl) {
	const joiner = String(loginUrl).includes('?') ? '&' : '?';
	return loginUrl + joiner + 'next=' + encodeURIComponent(continueUrl);
}

function legalNotice() {
	return tag('div', { class: 'legalNotice' }, [
		tag('p', {}, [
			'By continuing, review the ',
			tag('a', { href: '/legal/terms/', target: '_blank', rel: 'noopener' }, 'Terms of Use'),
			' and ',
			tag('a', { href: '/legal/privacy/', target: '_blank', rel: 'noopener' }, 'Privacy Policy'),
			'.'
		].join('')),
		tag('p', { class: 'small' }, [
			'Activity memory is private by default. You can pause, export, delete, or selectively share it in the ',
			tag('a', { href: '/social-hub/#privacy' }, 'Social Hub privacy controls'),
			'.'
		].join(''))
	].join(''));
}

function connectionDetails(loginNextUrl, continueUrl) {
	return tag('details', { class: 'small technicalDetails' }, [
		tag('summary', {}, 'Technical connection details'),
		tag('p', {}, [
			'Login URL:',
			tag('br', {}, ''),
			tag('code', {}, esc(loginNextUrl)),
			tag('br', {}, ''),
			tag('br', {}, ''),
			'Continue URL:',
			tag('br', {}, ''),
			tag('code', {}, esc(continueUrl))
		].join(''))
	].join(''));
}

function loginPage(opts) {
	const loginNextUrl = loginUrlWithNext(opts.loginUrl, opts.continueUrl);
	const body = tag('div', { class: 'box oauthLoginBox' }, [
		tag('p', { class: 'eyebrow' }, 'Awtsmoos.com secure connection'),
		tag('h1', {}, 'B"H Login Required'),
		tag('p', {}, `${esc(opts.clientName)} wants to connect to your Awtsmoos account.`),
		tag('p', {}, 'First log in through the normal Awtsmoos screen. Your public alias is not your private account credential.'),
		tag('p', { class: 'oauthActions' }, [
			tag('a', { class: 'button', href: loginNextUrl }, 'Open Awtsmoos Login'),
			' ',
			tag('a', { class: 'button', href: opts.continueUrl }, 'I logged in, continue OAuth')
		].join('')),
		legalNotice(),
		connectionDetails(loginNextUrl, opts.continueUrl)
	].join(''));
	return doc({
		title: 'Awtsmoos Login Required',
		body
	});
}

module.exports = {
	loginPage,
	loginUrlWithNext,
	legalNotice,
	connectionDetails
};
