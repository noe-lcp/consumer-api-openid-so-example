"use strict";

const { Issuer, custom, generators } = require("openid-client");
const express = require("express");
const session = require("express-session");
const config = require("./config");

console.log(
  "Note: This is a local development server, it is meant as a demonstration of how to use the Banno OpenID Connect API. It is not meant to be used in production."
);
console.log("API_ENVIRONMENT: " + config.consumerApi.environment);

(async () => {
  // Configure the OpenID Connect client based on the issuer.
  const issuer = await Issuer.discover(config.issuer["garden"]);
  const client = new issuer.Client({
    ...config.client["garden"],
  });
  client[custom.clock_tolerance] = 300; // to allow a 5 minute clock skew for verification

  // This example project doesn't include any storage mechanism(e.g. a database) for access tokens.
  // Therefore, we use this as our 'storage' for the purposes of this example.
  // This method is NOT recommended for use in production systems.
  let accessToken;

  const claims = {
    given_name: null,
    family_name: null,
    name: null,
    address: null,
    phone: null,
    email: null,
    "https://api.banno.com/consumer/claim/institution_id": null,
  };

  const port = process.env.PORT || 8080;

  const app = express();
  app.use(
    session({
      secret: "foo",
      resave: false,
      saveUninitialized: true,
    })
  );

  // If you click on the URL in the log, "Server listening on http://localhost:8080", that will open the URL in your web browser.
  // In this case, we'll redirect you from the '/' route to the '/hello' route.
  app.get("/", (req, res, next) => {
    res.redirect("/hello");
  });

  // This routing path handles the start of an authentication request.
  // This is the path used in '/login.html' when you click the 'Sign in with Banno' button.
  app.get("/auth", (req, res, next) => {
    const codeVerifier = generators.codeVerifier();
    const state = JSON.stringify({ cv: codeVerifier });
    const authorizationUrl = client.authorizationUrl({
      code_challenge: generators.codeChallenge(codeVerifier),
      code_challenge_method: "S256",
      scope: `openid`,
      redirect_uri: "http://localhost:8080/auth/cb",
      state: state,
    });

    req.session.oAuthState = req.session.oAuthState || {};
    req.session.oAuthState[state] = {};
    // If we have a deep link path query parameter, save it in a state parameter
    // so that we can redirect to the correct page when the OAuth flow completes
    // See https://auth0.com/docs/protocols/oauth2/redirect-users
    if (req.query.returnPath && req.query.returnPath[0] === "/") {
      req.session.oAuthState[state].returnPath = req.query.returnPath;
    }

    return res.redirect(authorizationUrl);
  });

  // This routing path handles the authentication callback.
  // This path (including the host information) must be configured in Banno SSO settings.
  app.get("/auth/cb", async (req, res, next) => {
    try {
      const params = client.callbackParams(req.url);
      const state = params.state;
      console.log("req.url :>> ", req.url);
      console.log("params :>> ", params);

      const tokenSet = await client.callback(
        "http://localhost:8080/auth/cb",
        params,
        {
          code_verifier: JSON.parse(params.state)?.cv,
          state,
        }
      );

      const userInfo = await client.userinfo(tokenSet);

      console.log("tokenSet :>> ", tokenSet);
      console.log("userInfo :>> ", userInfo);

      let nextPath = "/me";
      // If a state parameter is present and has a matching local state, lookup the value
      if (req.query.state) {
        if (req.session.oAuthState && req.session.oAuthState[req.query.state]) {
          if (req.session.oAuthState[req.query.state].returnPath) {
            nextPath = req.session.oAuthState[req.query.state].returnPath;
          }

          delete req.session.oAuthState[req.query.state];
        } else {
          console.error("State parameter not found in store");
          return res.redirect("/login.html");
        }
      }

      req.session.user = userInfo;
      return res.redirect(nextPath);
    } catch (err) {
      console.error(err);
    }
  });

  // This routing path shows the OpenID Connect claims for the authenticated user.
  // This path is where you'll be redirected once you sign in.
  app.get("/me", (req, res) => {
    if (!req.session.user) {
      res.redirect("/login.html?returnPath=/me");
      return;
    }
    res
      .set("Content-Type", "application/json")
      .send(JSON.stringify(req.session.user, undefined, 2));
  });

  // This routing path shows a text string with "Hello (user.name)".
  app.get("/hello", (req, res) => {
    if (!req.session.user) {
      res.redirect("/login.html?returnPath=/hello");
      return;
    }
    res.set("Content-Type", "text/plain").send(`Hello ${req.session.user.sub}`);
  });

  app.get("/logout", (req, res) => {
    // Destroy passport session
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/");
      }
      // Destroy express session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        session({ unset: true });
        res.redirect("/login.html");
      });
    });
  });

  app.use(express.static("public"));

  // Previous versions of this demo used provided certs to run a secure server,
  // this is no longer neccesary for localhost
  app.listen(port, () =>
    console.log(`Server listening on http://localhost:${port}`)
  );
})();
