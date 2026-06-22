// B"H
/**
 * @module PostsModule
 * @description
 * Chapter 481: The old post manager now asks whether images or voice/audio
 * should enter with the post. It still posts to the legacy Heichel route, but
 * can send `rootAssets` so the verified media engine carries the files.
 */

import Awts from '../alerts.js';
import EntityModule from './EntityModule.js';
import { pickAndUploadAssets } from './media/assetUploader.js';

async function maybeAttachAssets({ aliasId, postId }) {
  const wants = await Awts.confirm('Attach images or audio/voice files to this post?');
  if (!wants) return [];
  try {
    return await pickAndUploadAssets({ aliasId, postId, attachKind: 'post', accept: 'image/*,audio/*,video/*' });
  } catch (error) {
    await Awts.alert('Media upload failed: ' + (error.message || error));
    return [];
  }
}

function postUrl(entity) {
  return `/heichelos/${window.heichelID}/post/${entity.id}`;
}

function makeHandler() {
  return new EntityModule({
    apiEndpoint: '/api/social/',
    containerID: 'postsList',
    entityIds: 'postIds',
    subPath: `/heichelos/${window.heichelID}`,
    entityType: 'posts',
    editableFields: ['title', 'content'],
    readonlyFields: ['id', 'author', 'rootAssets'],
    getFn: async (entity, mod) => await mod.getPost(entity),
    updateDataFn: async ({ id, entity, updatedData }) => ({
      postId: id,
      content: updatedData.content || entity.content,
      title: updatedData.title || entity.title,
      rootAssets: JSON.stringify(entity.rootAssets || entity.assets || [])
    }),
    viewURL: postUrl,
    createFn: async mod => {
      const title = await Awts.prompt('enter post title');
      const aliasId = await Awts.prompt('Enter your alias ID to match it');
      const content = await Awts.prompt('enter content');
      const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const assets = await maybeAttachAssets({ aliasId, postId });
      const result = await mod.createEntity({
        postId,
        title,
        content,
        aliasId,
        heichelId: window.heichelID,
        rootAssets: JSON.stringify(assets),
        assets: JSON.stringify(assets)
      });
      await Awts.alert('Made ' + JSON.stringify(result));
      return result;
    }
  });
}

function go() {
  try {
    if (!window.heichelID) return Awts.alert('No Heichel ID found');
    makeHandler().initialize();
  } catch (error) {
    console.error('B"H PostsModule failed', error);
  }
}

go();
