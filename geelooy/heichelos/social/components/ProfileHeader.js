// B"H
import { h } from './render.js';
export function ProfileHeader(profile = {}) {
    return h('section', { class: 'awt-panel awt-profile-hero' }, [h('div', { class: 'awt-profile-row' }, [h('div', { class: 'awt-avatar' }, [(profile.name || 'A')[0]]), h('div', {}, [h('h2', {}, [profile.name || 'Alias']), h('p', {}, [profile.bio || 'Living in the unfolding story.'])])]), h('div', { class: 'awt-stat-row' }, [stat('Posts', profile.posts), stat('Comments', profile.comments), stat('Heichelos', profile.heichelos)])]);
}
function stat(label, value = 0) { return h('span', { class: 'awt-chip' }, [label + ': ' + value]); }
