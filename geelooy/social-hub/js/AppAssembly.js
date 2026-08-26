//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AppAssembly.js
 * @description Composes focused Social assembly authorities behind the unchanged `createSocialHub(root)` public doorway.
 * The Awtsmoos is beyond one and many; Awtsmoos.com lets Keter gather small assembly vessels into one application
 * without the old `let app` cycle, while every existing panel field remains visible for compatibility and future growth.
 */
import { SocialAppBridge } from './assembly/SocialAppBridge.js';
import { SocialCommunicationAssembly } from './assembly/SocialCommunicationAssembly.js';
import { SocialCreationAssembly } from './assembly/SocialCreationAssembly.js';
import { SocialFoundationAssembly } from './assembly/SocialFoundationAssembly.js';
import { SocialIdentityAssembly } from './assembly/SocialIdentityAssembly.js';
import { SocialSurfaceAssembly } from './assembly/SocialSurfaceAssembly.js';
import { HubApp } from './HubApp.js';

/**
 * Creates the complete Social Hub while preserving the historic public application shape.
 * @param {Document} [malchusRoot=document] Social Hub document root.
 * @returns {HubApp} Fully assembled application facade with every existing panel property intact.
 */
export function createSocialHub(malchusRoot = document) {
	const yesodBridge = new SocialAppBridge();
	const keterFoundation = new SocialFoundationAssembly(
		malchusRoot,
		yesodBridge
	).create();
	const chochmahCreation = new SocialCreationAssembly({
		...keterFoundation,
		bridge: yesodBridge
	}).create();
	const tiferesIdentity = new SocialIdentityAssembly({
		...keterFoundation,
		...chochmahCreation,
		bridge: yesodBridge
	}).create();
	const hodCommunications = new SocialCommunicationAssembly(
		keterFoundation
	).create();
	const malchusSurfaces = new SocialSurfaceAssembly({
		...keterFoundation,
		bridge: yesodBridge
	}).create();
	const malchusApp = new HubApp({
		...keterFoundation,
		...chochmahCreation,
		...tiferesIdentity,
		...hodCommunications,
		...malchusSurfaces
	});

	return yesodBridge.attach(malchusApp);
}
