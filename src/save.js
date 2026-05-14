import { useBlockProps } from '@wordpress/block-editor';
import { getDisplayUrlForResolution, getRenderedDimensionsForResolution } from './utils';

/**
 * Renders the saved (static) HTML output of the Air Asset block.
 *
 * @param {Object}      props                  - Block props.
 * @param {Object}      props.attributes       - Block attributes.
 * @param {Object|null} props.attributes.asset - The saved Air asset payload.
 * @return {JSX.Element|null} The rendered figure, or null if no asset is set.
 */
export default function save({ attributes: { asset, altText, resolution, displayWidth, displayHeight } }) {
	if (!asset) {
		return null;
	}

	const displayUrl = getDisplayUrlForResolution(asset.urls, resolution);
	if (!displayUrl) {
		return null;
	}

	const resolutionDims = getRenderedDimensionsForResolution(resolution, asset.width, asset.height);
	const width = resolutionDims.width ?? displayWidth ?? asset.width;
	const height = resolutionDims.height ?? displayHeight ?? asset.height;

	const sizeStyle = {};
	if (width) {
		sizeStyle.width = `${width}px`;
	}
	if (height) {
		sizeStyle.height = `${height}px`;
	}
	if (width && height) {
		sizeStyle.maxWidth = '100%';
	}

	if (asset.type === 'video') {
		return (
			<figure {...useBlockProps.save()}>
				<video
					src={displayUrl}
					controls
					poster={asset.urls?.thumbnail}
					{...(width ? { width } : {})}
					{...(height ? { height } : {})}
					style={sizeStyle}
				/>
				{asset.caption && <figcaption>{asset.caption}</figcaption>}
			</figure>
		);
	}

	if (asset.type === 'document') {
		return (
			<figure {...useBlockProps.save()}>
				<a href={displayUrl}>{asset.title || asset.caption}</a>
			</figure>
		);
	}

	if (asset.type === 'audio') {
		return null;
	}

	if (asset.type !== 'image') {
		return null;
	}

	return (
		<figure {...useBlockProps.save()}>
			<img
				src={displayUrl}
				alt={altText || asset.alt || ''}
				loading="lazy"
				{...(width ? { width } : {})}
				{...(height ? { height } : {})}
				style={sizeStyle}
			/>
			{asset.caption && <figcaption>{asset.caption}</figcaption>}
		</figure>
	);
}
