import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { url, caption } = attributes;

	if (!url) {
		return null;
	}

	return (
		<figure {...useBlockProps.save()}>
			<img src={url} alt={caption || ''} />
			{caption && <figcaption>{caption}</figcaption>}
		</figure>
	);
}
