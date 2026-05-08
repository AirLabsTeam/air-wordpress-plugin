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
 * Picks a URL based on the user-selected resolution. Falls back to the default
 * priority chain when the requested variant is unavailable.
 *
 * @param {Object|null} urls       - The `urls` object from an Air asset payload.
 * @param {string}      resolution - One of: 'full', 'large', 'medium', 'thumbnail'.
 * @return {string|null}
 */
export function getDisplayUrlForResolution(urls, resolution) {
	if (!urls) {
		return null;
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
