// B"H
/**
 * @module MediaApi
 * @description
 * Chapter 105: Audio, images, slideshows, and waveforms become living
 * instruments. Every attachment can become a player, cue map, caption track,
 * waveform rail, iframe surface, or slideshow storm.
 */
export function createMediaApi(client) {
    const post = id => '/posts/' + encodeURIComponent(id);
    const media = id => '/media/' + encodeURIComponent(id);
    return {
        attachments: postId => client.get(post(postId) + '/attachments'),
        addAttachment: (postId, body) => client.post(post(postId) + '/attachments', body),
        removeAttachment: id => client.delete(media(id)),
        audioManifest: id => client.get(media(id) + '/audio-manifest'),
        waveform: id => client.get(media(id) + '/waveform'),
        slideshowManifest: id => client.get(media(id) + '/slideshow-manifest'),
        cue: (id, body) => client.post(media(id) + '/cues', body)
    };
}
