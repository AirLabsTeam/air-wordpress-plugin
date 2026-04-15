import { useBlockProps } from '@wordpress/block-editor';
import { Button, Modal } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AIR_PICKER_ORIGIN } from './constants';

export default function Edit(props) {
	const {
		attributes: { url, caption },
		setAttributes,
	} = props;

	const airFrame = useRef(null);

	const [isOpen, setOpen] = useState(false);
	const handleOpenModal = () => setOpen(true);
	const handleCloseModal = useCallback(() => setOpen(false), []);

	useEffect(() => {
		const handleMessage = (message) => {
			if (
				!airFrame.current ||
				message.source !== airFrame.current.contentWindow
			) {
				return;
			}

			// Validate origin before trusting the payload
			if (message.origin !== AIR_PICKER_ORIGIN) {
				console.warn('Untrusted postMessage origin:', message.origin);
				return;
			}

			try {
				const payload = JSON.parse(message.data);
				if (payload?.url) {
					setAttributes({
						url: payload.url,
						caption: payload.caption ?? '',
					});
					handleCloseModal();
				}
			} catch (e) {
				console.error('Invalid postMessage payload', e);
			}
		};

		window.addEventListener('message', handleMessage);
		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, [setAttributes, handleCloseModal]);

	return (
		<div {...useBlockProps()}>
			<Button variant="secondary" onClick={handleOpenModal}>
				{url ? __('Replace Air asset') : __('Browse Air')}
			</Button>
			{isOpen && (
				<Modal title="Air" size="large" onRequestClose={handleCloseModal}>
					<iframe
						title="Air asset picker"
						src={AIR_PICKER_ORIGIN}
						ref={airFrame}
						style={{
							width: '100%',
							height: '70vh',
							border: 'none',
							display: 'block',
						}}
					/>
				</Modal>
			)}
			{url && (
				<figure>
					<img src={url} alt={caption || ''} />
					{caption && <figcaption>{caption}</figcaption>}
				</figure>
			)}
		</div>
	);
}
