# Consumer API OpenID Connect Example

This project is an example of how to connect to [Banno](https://banno.com/) services using [OpenID Connect](https://openid.net/connect/) (an identity layer on top of [OAuth 2.0](https://oauth.net/2/)).

This repository includes an example that uses [Node.js](https://nodejs.org) with the [Passport](http://www.passportjs.org/) authentication middleware to handle the OpenID Connect protocol.

This example is best used when following along with the [Authentication Quickstart on JackHenry.Dev](https://jackhenry.dev/open-api-docs/consumer-api/quickstarts/Authentication/).

## Note:

If you're learning how to build a *plugin*, you should use this other example project - https://github.com/Banno/simple-plugin-example

# Prerequisites

Before you get started, you'll need these credentials:
- `client_id`
- `client_secret`

You have a few different options for getting those credentials.

## 1) Signing up for a developer account on JackHenry.Dev

Instructions on how to sign up for a developer account on JackHenry.Dev are at https://jackhenry.dev/open-api-docs/accessing-the-digital-toolkit/.

## 2) Getting the credentials from a financial institution

You'll have to get the credentials from the back office administrator at your financial institution who has access to **Banno People**.

_If the administrator does not know where to do this, they can review the [External application configuration](https://knowledge.banno.com/people/settings/external-application-configuration/) article on the Banno Knowledge site._

## CAUTION

```
It is important to keep the `client_secret` value secret and not leak it through some kind of frontend, client-accessible JavaScript call.
```

# Installation

## 1) Install software prerequisites

The example is built for [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com/).

If you don't have these installed on your system already, you may want to install a Node Version Manager such as [nvm](https://github.com/nvm-sh/nvm).

## 2) Clone the repository

The cloned repository includes everything that you need for the next step.

## 3) Install project dependencies

From the repository root folder, run this command in the terminal:

```
npm install
```

# Running the example locally

After you've completed the installation steps, run this command in the terminal from the repository root folder:

```
npm start
```

The server will now be running locally. You'll see this log statement in the terminal:

```
Environment: local
Server listening on http://localhost:8080...
```

Next, go to http://localhost:8080/login.html in a web browser.

Click on `Sign in with Banno` and sign in with your Banno Username and Password.

Once you are signed in, you'll be redirected to http://localhost:8080/me and see the [OpenID Connect claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims) for the user. It'll look similar to the following example:

```
{
  "sub": "5cad5c30-6d24-11e9-870c-0242b78f8571",
}
```

You'll also see a log statement in the terminal that shows the `access_token`,  `id_token`, and `refresh_token`:

```
TokenSet {
  access_token: '<lengthy-json-web-token-string>',
  expires_at: 1571334444,
  id_token: '<lengthy-json-web-token-string>',
  refresh_token: '<lengthy-json-web-token-string>',
  scope: 'openid address email phone profile offline_access banno',
  token_type: 'Bearer'
}
```

The `access_token` contains _authorization information about your application_ regarding which actions it is allowed to perform via the Banno API. These actions map to the scopes (e.g. `openid address email phone profile banno`).

The `id_token` contains _authentication information about the user_ (i.e. claims).

The `refresh_token` is a credential that can be used to retrieve a new access token (e.g. for when the access token has expired or otherwise been invalidated).

Both the `access_token` and `id_token` are in [JSON Web Token format](https://en.wikipedia.org/wiki/JSON_Web_Token) (see [RFC 7519](https://tools.ietf.org/html/rfc7519) for specification details).

## CAUTION

```
JWTs are credentials which can grant access to resources. It is important to keep them secret.
```


3. After polling is completed, the server makes API calls to `GET /a/consumer/api/v0/users/{userId}/accounts` and `GET /a/consumer/api/v0/users/{userId}/accounts/{accountId}/transactions`.

4. Finally, the collected data is 'pretty printed' to the page returned to the user.
