//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserMediaFixture
 * @description
 * Browser smoke tests receive self-contained image, audio, and video-like data
 * references. Awtsmoos.com can therefore prove every preview vessel exists
 * without network 404 noise or borrowed media outside the Awtsmoos-given test.
 */

export const BROWSER_MEDIA_FIXTURE = Object.freeze({
	image: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22160%22%20height=%2290%22%3E%3Crect%20width=%22160%22%20height=%2290%22%20fill=%22%23243c72%22/%3E%3Ccircle%20cx=%2280%22%20cy=%2245%22%20r=%2224%22%20fill=%22%23ffd978%22/%3E%3C/svg%3E',
	audio: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
	video: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDE='
});
