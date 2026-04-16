import { useBlockProps } from '@wordpress/block-editor';
import { Button, Notice } from '@wordpress/components';
import { createPortal, useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AIR_PICKER_ORIGIN, AIR_WORKSPACE_ID } from './constants';
import { getDisplayUrl } from './utils';

/**
 * Sends a typed postMessage to the Air picker iframe.
 *
 * @param {Window} iframeWindow - The contentWindow of the picker iframe.
 * @param {string} type         - The message type (e.g. 'host-to-air:init').
 * @param {Object} data         - Optional payload to include with the message.
 */
function sendToIframe(iframeWindow, type, data = {}) {
	iframeWindow.postMessage(JSON.stringify({ type, data }), AIR_PICKER_ORIGIN);
}

export default function Edit({ attributes: { asset }, setAttributes }) {
	const airFrame = useRef(null);
	const [isOpen, setOpen] = useState(false);
	const [pendingAuthUrl, setPendingAuthUrl] = useState(null);
	const handleOpenModal = useCallback( () => setOpen(true), [] );
	const handleCloseModal = useCallback(() => {
		setOpen(false);
		setPendingAuthUrl(null);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				handleCloseModal();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, handleCloseModal]);

	useEffect(() => {
		const handleMessage = (message) => {
			if (!airFrame.current || message.source !== airFrame.current.contentWindow) {
				return;
			}

			if (message.origin !== AIR_PICKER_ORIGIN) {
				console.warn('[Air] Untrusted postMessage origin:', message.origin);
				return;
			}

			const payload = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;

			switch (payload?.type) {
				// Picker is ready — send Init with workspaceId so auth polling works
				case 'air-to-host:ready':
					sendToIframe(airFrame.current.contentWindow, 'host-to-air:init', {
						workspaceId: AIR_WORKSPACE_ID,
						hostOrigin: window.location.origin,
						protocolVersion: 1,
					});
					break;

				// Picker needs a browser tab opened for OAuth / SAML
				case 'air-to-host:open-url': {
					const url = payload.data?.url;
					if (!url) {
						break;
					}

					// window.open() from a message handler is not a trusted user gesture,
					// so most browsers block it as a popup. Synthesising a link click is
					// treated more leniently by Chrome/Firefox.
					const a = document.createElement('a');
					a.href = url;
					a.target = '_blank';
					a.rel = 'noopener noreferrer';
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);

					// Fall back to the manual-link notice if the tab still didn't open.
					// We use a short delay so the click has time to fire first.
					const timer = setTimeout(() => {
						setPendingAuthUrl(url);
					}, 500);

					// Clear the fallback if the page visibilitychange fires (tab opened OK).
					const onVisible = () => {
						clearTimeout(timer);
						document.removeEventListener('visibilitychange', onVisible);
					};
					document.addEventListener('visibilitychange', onVisible);
					break;
				}

				// Asset selected — store full structured payload
				case 'air-to-host:asset-selected':
					if (payload.data) {
						setAttributes({ asset: payload.data });
						handleCloseModal();
					}
					break;

				// Picker asked to close
				case 'air-to-host:close':
					handleCloseModal();
					break;

				default:
					// Backward-compat: handle flat payloads from older picker versions without a `type` field.
					if (payload?.urls) {
						setAttributes({ asset: payload });
						handleCloseModal();
					} else if (payload?.url) {
						setAttributes({
							asset: {
								assetId: payload.assetId ?? null,
								type: payload.other_metadata?.type ?? 'image',
								alt: payload.caption ?? '',
								caption: payload.caption ?? '',
								urls: {
									thumbnail: payload.url,
									static: payload.url,
									dynamic: null,
									selected: payload.url,
								},
								width: null,
								height: null,
							},
						});
						handleCloseModal();
					}
			}
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [setAttributes, handleCloseModal]);

	const displayUrl = asset ? getDisplayUrl(asset.urls) : null;

	return (
		<div {...useBlockProps()}>
			<Button variant="secondary" onClick={handleOpenModal}>
				{asset ? __('Replace Air asset') : __('Browse Air')}
			</Button>

			{isOpen &&
				createPortal(
					/* Portalled to document.body to escape the editor stacking context */
					<>
						{/* Backdrop — a button so click-outside is keyboard-accessible */}
						<button
							type="button"
							aria-label={__('Close Air asset picker')}
							onClick={handleCloseModal}
							style={{
								position: 'fixed',
								inset: 0,
								zIndex: 100000,
								width: '100%',
								height: '100%',
								background: 'rgba(0, 0, 0, 0.5)',
								border: 'none',
								cursor: 'default',
								padding: 0,
							}}
						/>
						{/* Dialog — sits above the backdrop */}
						<div
							role="dialog"
							aria-modal="true"
							aria-label={__('Air asset picker')}
							style={{
								position: 'fixed',
								inset: 0,
								zIndex: 100001,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								pointerEvents: 'none',
							}}
						>
							{pendingAuthUrl && (
								<div
									style={{
										position: 'absolute',
										top: 16,
										left: '50%',
										transform: 'translateX(-50%)',
										zIndex: 1,
										pointerEvents: 'auto',
									}}
								>
									<Notice status="warning" isDismissible={false}>
										{__('A pop-up was blocked.')}{' '}
										<a
											href={pendingAuthUrl}
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => setPendingAuthUrl(null)}
										>
											{__('Click here to open the sign-in window.')}
										</a>
									</Notice>
								</div>
							)}
							<iframe
								title="Air asset picker"
								src={AIR_PICKER_ORIGIN}
								ref={airFrame}
								sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
								style={{
									width: '90vw',
									maxWidth: '1200px',
									height: '85vh',
									border: 'none',
									display: 'block',
									borderRadius: '16px',
									background: '#EFEFEF',
									boxShadow:
										'0 8px 11px 0 rgba(0,0,0,0.00), 0 0 8px 0 rgba(0,0,0,0.20), 0 0 16px 0 rgba(0,0,0,0.30)',
									pointerEvents: 'auto',
								}}
							/>
						</div>
					</>,
					document.body
				)}

			{asset && displayUrl && (
				<figure style={{ margin: '16px 0' }}>
					{asset.type === 'video' ? (
						<video src={displayUrl} controls poster={asset.urls?.thumbnail} style={{ maxWidth: '100%' }} />
					) : (
						<img
							src={asset.urls?.thumbnail || displayUrl}
							alt={asset.alt || ''}
							style={{ maxWidth: '100%' }}
						/>
					)}
					{asset.caption && (
						<figcaption
							style={{
								fontSize: '13px',
								color: '#666',
								marginTop: '8px',
							}}
						>
							{asset.caption}
						</figcaption>
					)}
				</figure>
			)}
		</div>
	);
}
