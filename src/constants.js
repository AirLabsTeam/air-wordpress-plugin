// TODO: switch to https://wordpress-plugin.air.inc once that subdomain is deployed (APP-508)
// Override locally by setting AIR_PICKER_ORIGIN in .env (see .env.example).
export const AIR_PICKER_ORIGIN = process.env.AIR_PICKER_ORIGIN;

// Passed from PHP via wp_localize_script — configured in Settings → Air Media (wp-admin).
export const AIR_WORKSPACE_ID = window.airpickerData?.workspaceId;
