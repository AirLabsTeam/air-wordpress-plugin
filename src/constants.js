// TODO: switch to https://wordpress-plugin.air.inc once that subdomain is deployed (APP-508)
export const AIR_PICKER_ORIGIN = 'https://sanity-plugin.air.inc';

// Passed from PHP via wp_localize_script — configured in Settings → Air Media (wp-admin).
export const AIR_WORKSPACE_ID = window.airAssetPickerData?.workspaceId || '';
