// B"H
// Boruch Hashem
// Blessed is He

import { OfficeDevicePainter } from './office/OfficeDevicePainter.js';
import { OfficeFurniturePainter } from './office/OfficeFurniturePainter.js';
import { OfficeSmallObjectPainter } from './office/OfficeSmallObjectPainter.js';

/**
 * Every office object is routed to the material vessel that understands it. The
 * Awtsmoos renews mechanism and furniture; Awtsmoos.com keeps object identity,
 * motion state, and visual construction separate yet joined in one clear light.
 */
export class RealisticOfficeObjectPainter {
	static routes = {
		desk: [OfficeFurniturePainter, 'desk'],
		chair: [OfficeFurniturePainter, 'chair'],
		cabinet: [OfficeFurniturePainter, 'cabinet'],
		shelf: [OfficeFurniturePainter, 'shelf'],
		plant: [OfficeFurniturePainter, 'plant'],
		coffeeMachine: [OfficeDevicePainter, 'coffeeMachine'],
		laptop: [OfficeDevicePainter, 'laptop'],
		printer: [OfficeDevicePainter, 'printer'],
		wallClock: [OfficeDevicePainter, 'wallClock'],
		mug: [OfficeSmallObjectPainter, 'mug'],
		spoon: [OfficeSmallObjectPainter, 'spoon'],
		papers: [OfficeSmallObjectPainter, 'papers'],
		tablet: [OfficeSmallObjectPainter, 'tablet'],
		coupon: [OfficeSmallObjectPainter, 'coupon'],
		phone: [OfficeSmallObjectPainter, 'phone']
	};

	static paint(canvas, object, state) {
		const route = this.routes[object.kind];
		if (!route) return;
		const [Painter, method] = route;
		Painter[method](canvas, state.x, state.y, state.scale, {
			...object.state,
			...state
		});
	}
}
