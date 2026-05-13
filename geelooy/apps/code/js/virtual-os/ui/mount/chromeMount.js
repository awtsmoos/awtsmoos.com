
// B"H
/**
 * @file chromeMount.js
 * @description
 * Mounts the desktop chrome and returns anchors.
 */

import { HTML } from '../../../html-generator.js';
import { chromeBlueprint } from '../blueprints/chromeBlueprint.js';
import { log } from '../../diagnostics/VirtualOSLog.js';

export function mountChrome(container) {
    const root = HTML(chromeBlueprint());
    container.replaceChildren(root);

    const title = root.querySelector('.virtual-os-wallpaper-title');
    title.replaceChildren(
        HTML({ tag: 'strong', text: 'AWTSMOOS OS' }),
        HTML({ tag: 'span', text: 'desktop vessel emulator' })
    );

    const anchors = {
        root,
        desktop: root.querySelector('.virtual-os-desktop'),
        windows: root.querySelector('.virtual-os-windows'),
        start: root.querySelector('.virtual-os-start'),
        tasks: root.querySelector('.virtual-os-tasks'),
        menu: root.querySelector('.virtual-os-start-menu')
    };

    log('Chrome anchors', Object.fromEntries(
        Object.entries(anchors).map(([key, value]) => [key, Boolean(value)])
    ));

    return anchors;
}
