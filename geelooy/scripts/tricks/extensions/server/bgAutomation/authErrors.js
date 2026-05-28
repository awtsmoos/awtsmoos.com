//B"H
(function(){
  /**
   * Chapter 106: The Seal Spoke Without Showing Its Face.
   *
   * The Awtsmoos keeps the breath of life inside every request, but the bearer
   * token is not a song for the street. These helpers turn auth collapse into
   * compact public truth: status, error, safeHint, and small facts only.
   *
   * @param {string} status Machine-readable status.
   * @param {string} error Machine-readable error.
   * @param {string} safeHint Human-safe recovery hint.
   * @param {Record<string, unknown>} facts Non-secret facts.
   * @returns {Error & {awtsmoosSafeAuth:true,status:string,error:string,safeHint:string,facts:Record<string, unknown>}}
   */
  function authError(status, error, safeHint, facts = {}) {
    const e = new Error(`${status}: ${safeHint}`);
    e.name = "AwtsmoosBackgroundAuthError";
    e.awtsmoosSafeAuth = true;
    e.status = status;
    e.error = error;
    e.safeHint = safeHint;
    e.facts = facts;
    return e;
  }

  /**
   * @param {unknown} error Any thrown value from automation.
   * @returns {{status:string,error:string,safeHint:string,facts:Record<string, unknown>}}
   */
  function publicError(error) {
    if (error?.awtsmoosSafeAuth) return {
      status:error.status,
      error:error.error,
      safeHint:error.safeHint,
      facts:error.facts || {}
    };
    return {
      status:"automation_error",
      error:"automation_error",
      safeHint:"Background automation failed before a verified turn was committed.",
      facts:{ message:String(error?.message || error || "unknown failure").slice(0, 500) }
    };
  }

  /** @param {number} status HTTP response status. */
  function classifyHttp(status) {
    if (status === 401 || status === 403) return authError("not_logged_in", "auth_required", "ChatGPT login cookies are missing or expired. Open ChatGPT, sign in, then retry.", { httpStatus:status });
    if (status === 429) return authError("rate_limited", "rate_limited", "ChatGPT is rate limiting automation. Pause and retry.", { httpStatus:status });
    return authError("upstream_failed", "chatgpt_send_failed", "ChatGPT rejected the automation request before a verified turn committed.", { httpStatus:status });
  }

  globalThis.AwtsmoosBgAuthErrors = { authError, publicError, classifyHttp };
})();
