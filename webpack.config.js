const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

const APP_ENV = process.env.APP_ENV || 'development';

// Load order matches Next.js convention — first definition of a key wins,
// so files listed earlier override later ones:
//   1. process.env (CLI-inline)
//   2. .env.<APP_ENV>.local — per-env personal overrides
//   3. .env.local            — cross-env personal overrides
//   4. .env.<APP_ENV>        — committed per-env defaults
//   5. .env                  — committed shared default (gitignored here)
const envFiles = [
	path.join(__dirname, `.env.${APP_ENV}.local`),
	path.join(__dirname, '.env.local'),
	path.join(__dirname, `.env.${APP_ENV}`),
	path.join(__dirname, '.env'),
];

for (const envPath of envFiles) {
	if (!fs.existsSync(envPath)) continue;
	for (const rawLine of fs.readFileSync(envPath, 'utf8').split('\n')) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;
		const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
		if (match && process.env[match[1]] === undefined) {
			process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
		}
	}
}

console.log(
	`[webpack] APP_ENV=${APP_ENV} AIR_PICKER_ORIGIN=${process.env.AIR_PICKER_ORIGIN || '(unset)'}`
);

const envDefinePlugin = new webpack.DefinePlugin({
	'process.env.AIR_PICKER_ORIGIN': JSON.stringify(process.env.AIR_PICKER_ORIGIN || ''),
	'process.env.APP_ENV': JSON.stringify(APP_ENV),
});

const withEnvPlugin = (config) => ({
	...config,
	plugins: [...(config.plugins || []), envDefinePlugin],
});

module.exports = Array.isArray(defaultConfig)
	? defaultConfig.map(withEnvPlugin)
	: withEnvPlugin(defaultConfig);
