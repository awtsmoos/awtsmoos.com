// B"H
import { renderBlueprint } from '../components/render.js';
import { FeedView } from '../views/FeedView.js';
export function bootSocialRevamp(target = document.body, data = {}) {
    const root = renderBlueprint(FeedView(data), target.ownerDocument || document);
    target.innerHTML = '';
    target.appendChild(root);
    return root;
}
