// B"H
/**
 * @module SocialGovernanceRoutes
 * @description
 * Chapter 125: Heichel governance routes for settings, members, invites,
 * submissions, approvals, and publishing.
 */

const { er } = require('./helper/general.js');
const { listMembers, setRole } = require('./helper/governance/roles.js');
const { createInvite, acceptInvite, listInvites } = require('./helper/governance/invites.js');
const { submitPost, reviewSubmission, publishSubmission, listSubmissions } = require('./helper/governance/submissions.js');
const { updateHeichelSettings, readHeichelSettings } = require('./helper/governance/heichelSettings.js');

function method($i, expected) {
  return $i.request.method === expected ? null : er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}

function actor($i) {
  return $i.$_POST?.actorAlias || $i.$_POST?.aliasId || $i.$_GET?.actorAlias || $i.$_GET?.aliasId || '';
}

module.exports = ({ $i } = {}) => ({
  '/heichelos/:heichel/settings/full': async vars => {
    if ($i.request.method === 'GET') return await readHeichelSettings({ $i, heichelId: vars.heichel });
    if ($i.request.method === 'POST' || $i.request.method === 'PUT') return await updateHeichelSettings({ $i, heichelId: vars.heichel, actorAlias: actor($i) });
    return er({ code: 'BAD_METHOD', message: 'Use GET, POST, or PUT.' });
  },

  '/heichelos/:heichel/members': async vars => {
    if ($i.request.method === 'GET') return await listMembers({ $i, heichelId: vars.heichel });
    if ($i.request.method === 'POST') return await setRole({ $i, heichelId: vars.heichel, aliasId: $i.$_POST.aliasId, role: $i.$_POST.role, actorAlias: actor($i) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/heichelos/:heichel/invites': async vars => {
    if ($i.request.method === 'GET') return await listInvites({ $i, heichelId: vars.heichel });
    if ($i.request.method === 'POST') return await createInvite({ $i, heichelId: vars.heichel, actorAlias: actor($i) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/heichelos/:heichel/invites/:invite/accept': async vars => {
    const bad = method($i, 'POST');
    return bad || await acceptInvite({ $i, heichelId: vars.heichel, inviteId: vars.invite, actorAlias: actor($i) });
  },

  '/heichelos/:heichel/submissions/full': async vars => {
    if ($i.request.method === 'GET') return await listSubmissions({ $i, heichelId: vars.heichel });
    if ($i.request.method === 'POST') return await submitPost({ $i, heichelId: vars.heichel, actorAlias: actor($i) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/heichelos/:heichel/submissions/:submission/approve': async vars => {
    const bad = method($i, 'POST');
    return bad || await reviewSubmission({ $i, heichelId: vars.heichel, submissionId: vars.submission, actorAlias: actor($i), status: 'approved' });
  },

  '/heichelos/:heichel/submissions/:submission/reject': async vars => {
    const bad = method($i, 'POST');
    return bad || await reviewSubmission({ $i, heichelId: vars.heichel, submissionId: vars.submission, actorAlias: actor($i), status: 'rejected' });
  },

  '/heichelos/:heichel/submissions/:submission/publish': async vars => {
    const bad = method($i, 'POST');
    return bad || await publishSubmission({ $i, heichelId: vars.heichel, submissionId: vars.submission, actorAlias: actor($i) });
  }
});
