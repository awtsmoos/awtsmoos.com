
// B"H
/**
 * @file projections.js
 * @brief Unified interface for mat4 projection and view logic.
 */

import { mat4_view } from './view.js';
import { mat4_projection } from './projection.js';

export const mat4_projections = {
    perspective: (fov, aspect, near, far) => mat4_projection.perspective(fov, aspect, near, far),
    ortho: (left, right, bottom, top, near, far) => mat4_projection.ortho(left, right, bottom, top, near, far),
    lookAt: (out, eye, center, up) => mat4_view.lookAt(out, eye, center, up)
};
