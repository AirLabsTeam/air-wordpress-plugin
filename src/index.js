import { registerBlockType } from '@wordpress/blocks';
import { createElement } from '@wordpress/element';
import metadata from './block.json';
import Edit from './edit';
import save from './save';

const pluginUrl = (window.airAssetPickerData && window.airAssetPickerData.pluginUrl) || '';

const icon = pluginUrl
	? createElement('img', {
			src: `${pluginUrl}assets/icon-128x128.png`,
			width: 24,
			height: 24,
			alt: '',
			style: { borderRadius: 2, display: 'block' },
		})
	: undefined;

registerBlockType(metadata.name, { edit: Edit, save, icon });
