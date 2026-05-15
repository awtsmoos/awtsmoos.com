
<?Awtsmoos
//B"H

function logSessionLogin(step, data) {
  try {
    console.log("B\"H SESSION LOGIN DEBUG", JSON.stringify({
      step,
      time: Date.now(),
      data
    }, null, 2));
  } catch(e) {
    console.log("B\"H SESSION LOGIN DEBUG LOG_FAILED", step, e && e.message);
  }
}

function safeKeys(obj) {
  try {
    return Object.keys(obj || {});
  } catch(e) {
    return ["keys_failed"];
  }
}

async function handleLogin(request, $_POST, secret) {
  logSessionLogin("handleLogin_enter", {
    requestMethod: request && request.method,
    requestUrl: request && request.url,
    postKeys: safeKeys($_POST),
    username: $_POST && $_POST.username,
    hasPassword: !!($_POST && $_POST.password),
    passwordLength: $_POST && $_POST.password ? String($_POST.password).length : 0,
    hasSecret: !!secret,
    hasDb: typeof db != "undefined",
    hasSodos: typeof sodos != "undefined"
  });

  if(!$_POST || !$_POST.username || !$_POST.password) {
    logSessionLogin("missing_form_fields", {
      postKeys: safeKeys($_POST)
    });

    return {
      status: "neutral",
      message: "Please fill out the form to login."
    };
  }

  var username = String($_POST.username);
  var password = String($_POST.password);

  var ip =
    request.headers["x-forwarded-for"] ||
    request.socket?.remoteAddress ||
    request.connection?.remoteAddress ||
    "unknown";

  ip = String(ip).split(",")[0].trim().replace(/[.$#[\]/]/g, "_");

  logSessionLogin("resolved_ip", {
    ip
  });

  var loginPath = "/ipAddresses/" + ip + "info/logins";

  logSessionLogin("before_db_get_login_attempts", {
    loginPath
  });

  var loginAttempts = await db.get(loginPath);

  logSessionLogin("after_db_get_login_attempts", {
    isArray: Array.isArray(loginAttempts),
    type: typeof loginAttempts,
    count: Array.isArray(loginAttempts) ? loginAttempts.length : null
  });

  if(!Array.isArray(loginAttempts)) loginAttempts = [];

  var now = Date.now();
  loginAttempts = loginAttempts.filter(function(attempt) {
    return now - Number(attempt) < 60 * 60 * 1000;
  });

  if(loginAttempts.length >= 5) {
    var nextAttemptTime = new Date(Number(loginAttempts[0]) + 60 * 60 * 1000);

    logSessionLogin("rate_limited", {
      attempts: loginAttempts.length,
      nextAttemptTime: nextAttemptTime.toLocaleString()
    });

    return {
      status: "error",
      message: "Sorry, you've exceeded the limit for logins now.\nPlease try again after " + nextAttemptTime.toLocaleString(),
      nextAttemptTime
    };
  }

  loginAttempts.push(now);
  while(loginAttempts.length > 5) loginAttempts.shift();

  logSessionLogin("before_user_lookup", {
    username,
    userPath: "/users/" + username + "/account"
  });

  var user = await db.get("/users/" + username + "/account");

  logSessionLogin("after_user_lookup", {
    foundUser: !!user,
    userKeys: safeKeys(user)
  });

  if(!user) {
    await db.write(loginPath, loginAttempts);

    logSessionLogin("user_not_found", {
      username,
      wroteAttempts: loginAttempts.length
    });

    return {
      status: "error",
      message: "No user with that username found!"
    };
  }

  logSessionLogin("before_verify_password", {
    hasPasswordHash: !!user.password,
    hasSalt: !!user.salt
  });

  var passwordsMatch = sodos.verifyPassword(
    password,
    user.password,
    user.salt
  );

  logSessionLogin("after_verify_password", {
    passwordsMatch: !!passwordsMatch
  });

  if(!passwordsMatch) {
    await db.write(loginPath, loginAttempts);

    logSessionLogin("password_mismatch", {
      username,
      attempts: loginAttempts.length
    });

    return {
      status: "error",
      message: "The passwords don't match. You have " + loginAttempts.length + " more tries for today."
    };
  }

  logSessionLogin("before_create_token", {
    username
  });

  var token = sodos.createToken(username, secret);

  logSessionLogin("after_create_token", {
    tokenLength: token ? String(token).length : 0
  });

  await db.write(loginPath, loginAttempts);

  logSessionLogin("after_write_attempts_success", {
    attempts: loginAttempts.length
  });

  return {
    status: "success",
    message: "Successfully logged in!",
    token: token
  };
}

logSessionLogin("module_loaded", {
  exporting: "handleLogin"
});

module.exports.handleLogin = handleLogin;
//?>
