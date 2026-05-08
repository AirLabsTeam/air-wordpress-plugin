import { BlockControls, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	ExternalLink,
	Notice,
	PanelBody,
	SelectControl,
	TextareaControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { createPortal, useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AIR_PICKER_ORIGIN, AIR_WORKSPACE_ID } from './constants';
import { getDisplayUrlForResolution } from './utils';

const pluginUrl = (window.airAssetPickerData && window.airAssetPickerData.pluginUrl) || '';

const PlusIcon = () => (
	<svg
		aria-hidden="true"
		focusable="false"
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M8 3.333v9.334M3.333 8h9.334"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
		/>
	</svg>
);

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

const RESOLUTION_OPTIONS = [
	{ label: __('Full size'), value: 'full' },
	{ label: __('Large'), value: 'large' },
	{ label: __('Medium'), value: 'medium' },
	{ label: __('Thumbnail'), value: 'thumbnail' },
];

const SyncedIcon = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path
			d="M3.5 8.5l3 3 6-6"
			stroke="#297c3b"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const LockIcon = () => (
	<svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
		<path
			d="M5.25 8V5.25a3.75 3.75 0 117.5 0V8M4 8h10v6.5H4V8z"
			stroke="#666"
			strokeWidth="1.4"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export default function Edit({
	attributes: { asset, altText, resolution, displayWidth, displayHeight },
	setAttributes,
}) {
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

				// Picker needs a browser tab opened for OAuth / SAML.
				// Try a synthesised anchor click first — some browsers allow it from a
				// message handler. If the tab opens, visibilitychange fires and we clear
				// the Notice. If it doesn't, the Notice stays so the user can click through
				// with a trusted gesture.
				case 'air-to-host:open-url': {
					const url = payload.data?.url;
					if (!url) {
						break;
					}

					setPendingAuthUrl(url);

					const a = document.createElement('a');
					a.href = url;
					a.target = '_blank';
					a.rel = 'noopener noreferrer';
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);

					const onVisible = () => {
						if (document.visibilityState === 'hidden') {
							setPendingAuthUrl(null);
							document.removeEventListener('visibilitychange', onVisible);
						}
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

	const displayUrl = asset ? getDisplayUrlForResolution(asset.urls, resolution) : null;

	return (
		<div {...useBlockProps()}>
			{!asset && (
				<div
					style={{
						background: '#fff',
						border: '1px solid #000',
						borderRadius: 4,
						padding: '10px 16px',
						minHeight: 152,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						justifyContent: 'center',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
							width: 141,
						}}
					>
						<div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
							{pluginUrl && (
								<img
									src={`${pluginUrl}assets/icon-128x128.png`}
									alt=""
									width={24}
									height={24}
									style={{ display: 'block', borderRadius: 2 }}
								/>
							)}
							<span
								style={{
									fontFamily: 'Inter, sans-serif',
									fontWeight: 600,
									fontSize: 14,
									lineHeight: 1.43,
									color: '#000',
								}}
							>
								{__('Air')}
							</span>
						</div>
						<p
							style={{
								margin: 0,
								fontFamily: 'Inter, sans-serif',
								fontWeight: 400,
								fontSize: 12,
								lineHeight: 1.33,
								color: '#000',
							}}
						>
							{__('Pick an asset from Air')}
						</p>
						<button
							type="button"
							onClick={handleOpenModal}
							style={{
								background: '#0563e9',
								color: '#fff',
								border: 'none',
								borderRadius: 8,
								padding: '10px 12px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 6,
								width: '100%',
								fontFamily: 'Inter, sans-serif',
								fontWeight: 600,
								fontSize: 14,
								lineHeight: 1.43,
								cursor: 'pointer',
							}}
						>
							<PlusIcon />
							{__('Add assets')}
						</button>
					</div>
				</div>
			)}

			{asset && (
				<>
					<BlockControls>
						<ToolbarGroup>
							<ToolbarButton onClick={handleOpenModal}>
								{__('Replace')}
							</ToolbarButton>
						</ToolbarGroup>
					</BlockControls>

					<InspectorControls>
						<PanelBody title={__('Upload media')} initialOpen={true}>
							<div
								style={{
									display: 'flex',
									gap: 12,
									alignItems: 'flex-start',
									marginBottom: 12,
								}}
							>
								{asset.urls?.thumbnail && (
									<img
										src={asset.urls.thumbnail}
										alt=""
										style={{
											width: 31,
											height: 50,
											objectFit: 'cover',
											borderRadius: 2,
											flexShrink: 0,
										}}
									/>
								)}
								<div style={{ flex: 1, minWidth: 0 }}>
									<div
										style={{
											display: 'flex',
											gap: 6,
											alignItems: 'center',
											marginBottom: 8,
											flexWrap: 'wrap',
										}}
									>
										<span
											style={{
												fontFamily: 'Inter, sans-serif',
												fontWeight: 500,
												fontSize: 12,
												color: '#808080',
												textTransform: 'uppercase',
												letterSpacing: '0.6px',
											}}
										>
											{(asset.type || 'image').toUpperCase()}
										</span>
										<span style={{ color: '#808080' }}>·</span>
										<span
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 4,
												fontFamily: 'Inter, sans-serif',
												fontWeight: 500,
												fontSize: 12,
												color: '#297c3b',
												letterSpacing: '0.6px',
											}}
										>
											<SyncedIcon />
											{__('Synced')}
										</span>
									</div>
									<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
										{asset.urls?.selected && (
											<ExternalLink href={asset.urls.selected}>
												{__('View in Air')}
											</ExternalLink>
										)}
										<Button
											variant="secondary"
											size="small"
											onClick={handleOpenModal}
										>
											{__('Replace image')}
										</Button>
									</div>
								</div>
							</div>
							<TextareaControl
								label={__('Alt text')}
								value={altText}
								onChange={(value) => setAttributes({ altText: value })}
								help={__('Describe the purpose of the image')}
								__nextHasNoMarginBottom
							/>
						</PanelBody>

						{asset.type !== 'video' && (
							<PanelBody title={__('Image options')} initialOpen={true}>
								<SelectControl
									label={__('Resolution')}
									value={resolution}
									options={RESOLUTION_OPTIONS}
									onChange={(value) => setAttributes({ resolution: value })}
									__nextHasNoMarginBottom
								/>
								<div style={{ marginTop: 16 }}>
									<div
										style={{
											fontFamily: 'Inter, sans-serif',
											fontWeight: 700,
											fontSize: 10,
											color: '#666',
											textTransform: 'uppercase',
											letterSpacing: '0.4px',
											marginBottom: 8,
										}}
									>
										{__('Resize image')}
									</div>
									<div
										style={{
											display: 'flex',
											gap: 4,
											alignItems: 'center',
										}}
									>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 4,
												flex: 1,
											}}
										>
											<label htmlFor="air-resize-w" style={{ fontSize: 12, color: '#666' }}>
												W
											</label>
											<input
												id="air-resize-w"
												type="number"
												value={displayWidth ?? asset.width ?? ''}
												onChange={(e) => {
													const raw = e.target.value;
													if (raw === '') {
														setAttributes({ displayWidth: undefined, displayHeight: undefined });
														return;
													}
													const newW = Number(raw);
													const baseW = asset.width;
													const baseH = asset.height;
													if (baseW && baseH) {
														setAttributes({
															displayWidth: newW,
															displayHeight: Math.round((newW * baseH) / baseW),
														});
													} else {
														setAttributes({ displayWidth: newW });
													}
												}}
												style={{ width: '100%', minWidth: 0 }}
											/>
										</div>
										<LockIcon />
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 4,
												flex: 1,
											}}
										>
											<label htmlFor="air-resize-h" style={{ fontSize: 12, color: '#666' }}>
												H
											</label>
											<input
												id="air-resize-h"
												type="number"
												value={displayHeight ?? asset.height ?? ''}
												onChange={(e) => {
													const raw = e.target.value;
													if (raw === '') {
														setAttributes({ displayWidth: undefined, displayHeight: undefined });
														return;
													}
													const newH = Number(raw);
													const baseW = asset.width;
													const baseH = asset.height;
													if (baseW && baseH) {
														setAttributes({
															displayHeight: newH,
															displayWidth: Math.round((newH * baseW) / baseH),
														});
													} else {
														setAttributes({ displayHeight: newH });
													}
												}}
												style={{ width: '100%', minWidth: 0 }}
											/>
										</div>
										<span
											style={{
												fontFamily: 'Inter, sans-serif',
												fontWeight: 500,
												fontSize: 12,
												color: '#808080',
												letterSpacing: '0.6px',
												paddingLeft: 4,
											}}
										>
											8MB
										</span>
									</div>
								</div>
							</PanelBody>
						)}
					</InspectorControls>
				</>
			)}

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
									<Notice status="info" isDismissible={false}>
										<a
											href={pendingAuthUrl}
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => setPendingAuthUrl(null)}
										>
											{__('Open sign-in in a new tab →')}
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
					{(() => {
						const w = displayWidth ?? asset.width;
						const h = displayHeight ?? asset.height;
						const previewStyle = {};
						if (w) {
							previewStyle.width = `${w}px`;
						}
						if (h) {
							previewStyle.height = `${h}px`;
						}
						if (w && h) {
							previewStyle.maxWidth = '100%';
						}
						return asset.type === 'video' ? (
							<video
								src={displayUrl}
								controls
								poster={asset.urls?.thumbnail}
								style={previewStyle}
							/>
						) : (
							<img
								src={asset.urls?.thumbnail || displayUrl}
								alt={altText || asset.alt || ''}
								style={previewStyle}
							/>
						);
					})()}
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
