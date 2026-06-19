// B"H
/**
 * Chapter 67: The profile tree is tested branch by branch.
 * Posts and comments must gather under heichel and series, and the profile
 * view must reveal the same tree to the user.
 */
import { strict as assert } from 'node:assert';
import {
    buildProfileActivity,
    groupPostsByHeichelAndSeries,
    groupCommentsByHeichelSeriesTree
} from '../data/profileActivity.js';
import { ProfileView } from '../views/ProfileView.js';

const posts = [
    { id: 'p1', title: 'Aleph Post', heichel: 'h-main', seriesId: 's-a', body: 'A' },
    { id: 'p2', title: 'Beis Post', heichel: 'h-main', seriesId: 's-b', body: 'B' },
    { id: 'p3', title: 'Loose Post', heichel: 'h-side', body: 'C' }
];
const comments = [
    { id: 'c1', postId: 'p1', text: 'Aleph comment', heichel: 'h-main', seriesId: 's-a' },
    { id: 'c2', postId: 'p3', text: 'Loose comment', heichel: 'h-side' }
];

const postTree = groupPostsByHeichelAndSeries(posts);
assert.equal(postTree.length, 2);
assert.equal(postTree[0].heichelId, 'h-main');
assert.equal(postTree[0].series.length, 2);
assert.equal(postTree[0].series[0].seriesId, 's-a');
assert.equal(postTree[0].series[0].items[0].title, 'Aleph Post');
assert.equal(postTree[1].series[0].seriesId, 'loose-series');

const commentTree = groupCommentsByHeichelSeriesTree(comments);
assert.equal(commentTree.length, 2);
assert.equal(commentTree[0].series[0].items[0].text, 'Aleph comment');
assert.equal(commentTree[1].series[0].seriesId, 'loose-series');

const activity = buildProfileActivity({ posts, comments });
assert.equal(activity.totals.posts, 3);
assert.equal(activity.totals.comments, 2);

const view = ProfileView({ profile: { name: 'Tree Alias' }, posts, comments });
assert.ok(containsText(view, 'Tree Alias'));
assert.ok(containsText(view, 'Posts by Heichel and Series'));
assert.ok(containsText(view, 'Comments by Heichel and Series'));
assert.ok(containsText(view, 'Heichel: h-main'));
assert.ok(containsText(view, 'Series: s-a'));
assert.ok(containsText(view, 'Aleph Post'));
assert.ok(containsText(view, 'Aleph comment'));

console.log('B"H social profile activity passed');

function containsText(node, text) {
    if (typeof node === 'string') return node.includes(text);
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(child => containsText(child, text));
    return Object.values(node).some(value => containsText(value, text));
}
