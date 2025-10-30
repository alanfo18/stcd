export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Get config from window object (injected by server) or use defaults
const getConfig = () => {
  if (typeof window !== "undefined" && (window as any).__config__) {
    return (window as any).__config__;
  }
  return {};
};

const config = getConfig();

export const APP_TITLE = config.VITE_APP_TITLE || import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  config.VITE_APP_LOGO ||
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = config.VITE_OAUTH_PORTAL_URL || import.meta.env.VITE_OAUTH_PORTAL_URL || "https://api.manus.im";
  const appId = config.VITE_APP_ID || import.meta.env.VITE_APP_ID || "proj_default";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("Failed to construct login URL:", error);
    // Fallback URL
    return `${oauthPortalUrl}/app-auth?appId=${appId}&redirectUri=${encodeURIComponent(redirectUri)}&state=${state}&type=signIn`;
  }
};

