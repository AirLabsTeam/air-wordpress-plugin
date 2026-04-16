// APP-479: replace with real Air URL before shipping
export const AIR_PICKER_ORIGIN = 'https://sanity-plugin.air.inc';

// Passed from PHP via wp_localize_script( 'air-inc-asset-picker-editor-script', 'airAssetPickerData', ... )
// Define AIR_INC_WORKSPACE_ID in wp-config.php for production.
export const AIR_WORKSPACE_ID = window.airAssetPickerData?.workspaceId || '2930bc8a-bad4-4268-899e-0e3578295252';
