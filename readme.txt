=== Air for WordPress ===
Contributors: airinc
Tags: air, dam, digital asset management, media, gutenberg
Requires at least: 6.3
Tested up to: 6.9
Stable tag: 0.2.6
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Sync or upload your Air assets to your WordPress website!

== Description ==

Air Asset Picker is a Gutenberg block plugin that connects your WordPress site to your Air workspace. Content editors can browse, search, and insert brand-approved images and videos from Air without ever leaving the WordPress block editor — no downloading, no re-uploading.

**How it works:**

* Add the "Air Media" block to any page or post
* Click "Browse Air" to open the Air asset picker
* Log in to your Air account
* Browse or search your workspace and select an asset
* The asset is embedded via Air's CDN URL — no files are stored in WordPress

**Why CDN delivery?**

Assets are served directly from Air's CDN. This means no storage overhead in WordPress, and any updates made to an asset in Air are reflected on your site immediately.

**Requirements:**

* An active Air account
* Your Air workspace ID (found in your Air account settings)

== Installation ==

1. Install the plugin from the WordPress.org plugin directory, or upload the `air-asset-picker` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Go to **Settings → Air Media** and enter your Air workspace ID.
4. Edit any page or post, add the **Air Media** block, and click **Browse Air** to start inserting assets.

== Frequently Asked Questions ==

= Where do I find my workspace ID? =

Log in to your Air account, go to your workspace settings, and copy the workspace ID from the URL or settings panel.

= Do I need an Air account? =

Yes. This plugin requires an active Air account. Visit [air.inc](https://air.inc) to learn more.

= Does this upload files to WordPress? =

No. Assets are embedded via Air's CDN URL. No files are stored in your WordPress media library.

= Which editor is supported? =

The Gutenberg block editor (WordPress 6.3+). The classic TinyMCE editor is not supported.

== Screenshots ==

1. Air Asset Picker listed on the WordPress Plugins page
2. Settings → Air Media page for entering your workspace ID
3. Adding the Air Media block from the Gutenberg block inserter
4. The Air asset picker gallery — browse and search your workspace
5. Log in to your Air account from within the block editor
6. Preview an asset before inserting it
7. An Air asset embedded in a WordPress page via CDN URL

== Changelog ==

= 0.1.0 =
* Initial release
* Air Media Gutenberg block with iframe-based asset picker
* Settings page for workspace ID configuration
* Image and video asset support with Air CDN delivery
