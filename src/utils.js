/**
 * Returns the best available display URL from an Air asset's URL map,
 * using the same priority chain as the Sanity integration:
 * selected → dynamic → static → thumbnail
 *
 * @param {Object|null} urls - The `urls` object from an Air asset payload.
 * @return {string|null} The highest-priority URL, or null if none exist.
 */
export function getDisplayUrl(urls) {
	if (!urls) {
		return null;
	}
	return urls.selected || urls.dynamic || urls.static || urls.thumbnail || null;
}

/**
 * Imgix params per resolution. The picker now sends a raw imgix base URL
 * (`urls.imgixBase`) without size params, so the host derives the variant.
 */
const RESOLUTION_PARAMS = {
	thumbnail: { w: '150', h: '150', fit: 'crop' },
	medium: { w: '300' },
	large: { w: '1024' },
	full: {},
};

/**
 * Builds an imgix URL for the given resolution from the raw imgix base.
 * Uses the URL API so existing query params (eg. an imgix `ixid`) are
 * preserved instead of being clobbered by naive string concatenation.
 *
 * @param {string} imgixBase - Raw imgix src.
 * @param {string} resolution - One of: 'full', 'large', 'medium', 'thumbnail'.
 * @return {string}
 */
function buildImgixUrl(imgixBase, resolution) {
	const params = RESOLUTION_PARAMS[resolution] ?? RESOLUTION_PARAMS.full;
	try {
		const url = new URL(imgixBase);
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.set(key, value);
		});
		return url.href;
	} catch {
		return imgixBase;
	}
}

/**
 * Picks a URL based on the user-selected resolution.
 *
 * Prefers `urls.imgixBase` + per-resolution imgix params (the new payload shape).
 * Falls back to the legacy priority chain when `imgixBase` is absent — needed
 * for assets stored before the picker was updated to send `imgixBase`.
 *
 * @param {Object|null} urls       - The `urls` object from an Air asset payload.
 * @param {string}      resolution - One of: 'full', 'large', 'medium', 'thumbnail'.
 * @return {string|null}
 */
export function getDisplayUrlForResolution(urls, resolution) {
	if (!urls) {
		return null;
	}
	if (urls.imgixBase) {
		return buildImgixUrl(urls.imgixBase, resolution);
	}
	switch (resolution) {
		case 'thumbnail':
			return urls.thumbnail || getDisplayUrl(urls);
		case 'medium':
			return urls.dynamic || urls.thumbnail || urls.static || urls.selected || null;
		case 'large':
			return urls.dynamic || urls.static || urls.selected || urls.thumbnail || null;
		case 'full':
		default:
			return urls.selected || urls.static || urls.dynamic || urls.thumbnail || null;
	}
}
