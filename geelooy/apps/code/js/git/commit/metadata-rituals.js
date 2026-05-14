// B"H

// FILE: js/git/commit/metadata-rituals.js

import { FileSystemProvider } from '../../fs-provider.js';
import { inheritWorldIdentity } from '../../fs-provider/identity.js';

/**
 * @class MetadataRituals
 * @description
 * B"H.
 *
 * Managing the local Ikar, the inner anchor.
 *
 * THE POEM OF THE IKAR:
 * Deep under the project, beneath code and chrome,
 * the hidden scroll remembers the repository home.
 * If the remote commit rises but the local root forgets,
 * the UI becomes thunder, the agent sweats.
 *
 * So this class writes carefully.
 * It never writes an anchor with undefined type.
 * It never lets a local vessel pretend it has no world.
 *
 * The Awtsmoos renews every letter every breath;
 * this module renews the repo anchor after commit,
 * not before, not broken, not blind.
 */
export const MetadataRituals = {
  /**
   * @async
   * @function updateLocalAnchor
   * @description
   * B"H.
   *
   * Rewrites `.awtsmoos-repo/ikar.js` after a successful commit.
   *
   * This is where the original crash happened:
   * `contextItem.originalType || contextItem.type` was undefined, so the
   * generated ikarItem also had undefined type, and FileSystemProvider threw.
   *
   * Now identity is inherited through `inheritWorldIdentity`, which validates
   * the context before the write.
   *
   * @param {object} contextItem
   * Root filesystem item for the workspace being committed.
   *
   * @param {object} gitInfo
   * Git metadata object.
   *
   * @param {string} newCommitSHA
   * New remote commit SHA.
   *
   * @returns {Promise&lt;void&gt;}
   * Resolves after the local anchor is updated.
   */
  async updateLocalAnchor(contextItem, gitInfo, newCommitSHA) {
    const ikarData = {
      ...gitInfo,
      baseCommitSHA: newCommitSHA,
      remoteTree: gitInfo.remoteTree || [],
      isClone: true
    };

    const root = String(contextItem.path || "/").replace(/\/+$/, "") || "/";
    const ikarPath = `${root}/.awtsmoos-repo/ikar.js`;

    const ikarItem = inheritWorldIdentity(
      contextItem,
      {
        path: ikarPath,
        name: "ikar.js",
        kind: "file"
      },
      {
        action: "write local git anchor"
      }
    );

    console.log(`[GitRitual] B"H Manifesting Ikar at: ${ikarPath}`);

    const content = `// B"H
const ikar = ${JSON.stringify(ikarData, null, 4)};

export default ikar;
`;

    await FileSystemProvider.write(ikarItem, content);
  }
};