import type { ResourcesConfig } from "aws-amplify";

const requireEnv = (name: keyof ImportMetaEnv): string => {
  const v = import.meta.env[name];
  if (!v) throw new Error(`Missing env var: ${String(name)}`);
  return v;
};

const oauthDomain = requireEnv("VITE_COGNITO_DOMAIN");
const userPoolId = requireEnv("VITE_COGNITO_USER_POOL_ID");
const userPoolClientId = requireEnv("VITE_COGNITO_CLIENT_ID");

const redirectBase =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        oauth: {
          domain: oauthDomain,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [`${redirectBase}/callback`, `${redirectBase}/`],
          redirectSignOut: [`${redirectBase}/`, redirectBase],
          responseType: "code",
        },
      },
    },
  },
};
