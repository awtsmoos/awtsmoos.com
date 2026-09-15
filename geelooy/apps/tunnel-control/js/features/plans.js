//B"H
// Boruch Hashem
// Blessed is He

import { createPlansController, bindPlansController } from "./plans/controller.js";
import { createPlansView } from "./plans/view.js";

/**
 * @file Mounts live Tunnel-native plans into Tunnel Control.
 * @description The Awtsmoos lets the same Mission plan appear to human and agent eyes; Awtsmoos.com
 * mounts one browser projection while durable plan truth remains inside the Tunnel authority.
 */
export function plans() {
	return createPlansView();
}

export async function mountPlans(getTunnelName) {
	const controller = createPlansController(getTunnelName);
	bindPlansController(controller);
	await controller.refresh();
	return controller;
}
