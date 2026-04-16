import { useBlockProps } from '@wordpress/block-editor';
import { getDisplayUrl } from './utils';

/**
 * Renders the saved (static) HTML output of the Air Asset block.
 *
 * @param {Object}      props                  - Block props.
 * @param {Object}      props.attributes       - Block attributes.
 * @param {Object|null} props.attributes.asset - The saved Air asset payload.
 * @return {JSX.Element|null} The rendered figure, or null if no asset is set.
 */
export default function save({ attributes: { asset } }) {
	if (!asset) {
		return null;
	}

	const displayUrl = getDisplayUrl(asset.urls);
	if (!displayUrl) {
		return null;
	}

	if (asset.type === 'video') {
		return (
			<figure {...useBlockProps.save()}>
				<video src={displayUrl} controls poster={asset.urls?.thumbnail} style={{ maxWidth: '100%' }} />
				{asset.caption && <figcaption>{asset.caption}</figcaption>}
			</figure>
		);
	}

	return (
		<figure {...useBlockProps.save()}>
			<img
				src={displayUrl}
				alt={asset.alt || ''}
				loading="lazy"
				{...(asset.width ? { width: asset.width } : {})}
				{...(asset.height ? { height: asset.height } : {})}
			/>
			{asset.caption && <figcaption>{asset.caption}</figcaption>}
		</figure>
	);
}
