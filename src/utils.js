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
