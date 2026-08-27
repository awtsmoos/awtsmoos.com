// B"H
/** Shows the currently rooted workspace as a living manifest projection. */
export const ExternalManifest = {
  injectUI(mount, tab, root) {
    if (!mount) return null;
    const name = root?.name || root?.path || tab?.name || 'Awtsmoos Workspace';
    mount.textContent = '';

    const card = document.createElement('div');
    card.className = 'vibe-manifest-card';

    const title = document.createElement('strong');
    title.textContent = name;

    const body = document.createElement('p');
    body.textContent = 'Manifest root is connected. Systems may project files, timelines, and intentions here.';

    card.append(title, body);
    mount.appendChild(card);
    return mount;
  }
};
