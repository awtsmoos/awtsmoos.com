// B"H
/**
 * @module GeelooyShellRoutes
 * @description Compatibility doorway for older modules that still import the
 * shell route map. One source now guides every visible navigation surface.
 */
export {
	accountRoutes,
	appRoutes as shellRoutes,
	currentAppRoute as currentRoute,
	discoveryRoutes,
	isMainAppRoute,
	primaryRoutes,
	searchAppRoutes
} from './appRoutes.js';
