module.exports = {
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
	globals: {
		window: true,
	},
	rules: {
		// Biome handles formatting — no overlap with prettier.
		'prettier/prettier': 'off',
		// console.warn / console.error are intentional defensive checks.
		'no-console': ['error', { allow: ['warn', 'error'] }],
	},
};
