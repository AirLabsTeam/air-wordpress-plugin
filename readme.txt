=== Air Asset Picker ===
Contributors: airinc
Tags: digital asset management, dam, brand assets, media library, block editor
Requires at least: 6.3
Tested up to: 6.9
Stable tag: 0.2.11
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed brand-approved images and videos from your Air workspace directly in the WordPress block editor.

== Description ==

Air Asset Picker is a Gutenberg block that connects your WordPress site to your Air workspace. Content editors can browse, search, and insert brand-approved images and videos from Air without ever leaving the WordPress block editor — no downloading, no re-uploading.

**How it works:**

* Add the **Air** block to any page or post
* Click **Add asset** to open the Air asset picker
* Log in to your Air account
* Browse or search your workspace and select an asset
* The asset is embedded via Air's CDN URL — no files are stored in WordPress

**Why CDN delivery?**

Assets are served directly from Air's CDN. This means no storage overhead in WordPress, and any updates made to an asset in Air are reflected on your site immediately.

**Requirements:**

* An active Air account on an Enterprise plan
* Your Air workspace ID (found in your Air account settings)

== Installation ==

1. Install the plugin from the WordPress.org plugin directory, or upload the `air-asset-picker` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Go to **Settings → Air Media** and enter your Air workspace ID.
4. Edit any page or post, add the **Air** block, and click **Add asset** to start inserting assets.

== Frequently Asked Questions ==

= Where do I find my workspace ID? =

Log in to your Air account, go to your workspace settings, and copy the workspace ID from the URL or settings panel.

= Do I need an Air account? =

Yes. This plugin requires an active Air account on an Enterprise plan. Visit [air.inc](https://air.inc) to learn more.

= Does this upload files to WordPress? =

No. Assets are embedded via Air's CDN URL. No files are stored in your WordPress media library.

= Which editor is supported? =

The Gutenberg block editor (WordPress 6.3+). The classic TinyMCE editor is not supported.

== Screenshots ==

1. Air Asset Picker listed on the WordPress Plugins page
2. Settings → Air Media page for entering your workspace ID
3. Adding the Air block from the Gutenberg block inserter
4. The Air asset picker gallery — browse and search your workspace
5. Log in to your Air account from within the block editor
6. Preview an asset before inserting it
7. An Air asset embedded in a WordPress page via CDN URL
8. Asset details panel with metadata, tags, and insert options
9. Inserted Air asset shown in the post editor with Replace toolbar

== External Services ==

This plugin connects to Air (https://air.inc) to enable asset selection and embedding. Air is a digital asset management service operated by Air Labs, Inc.

**When is data sent?**

* When a user opens the asset picker inside the WordPress block editor, the plugin loads the Air picker UI from `https://wordpress-plugin.air.inc` in an iframe. This is required to authenticate the user and display the asset gallery.
* When an asset is selected, only the asset's CDN URL and metadata (filename, dimensions, alt text, caption) are sent back to WordPress and stored as block attributes. No binary file data is transferred to WordPress.
* When a published page is viewed, the browser loads the embedded image or video directly from Air's CDN.

**What data is sent?**

* Your Air workspace ID (entered in Settings → Air Media)
* Authentication credentials you enter into the Air picker (handled entirely by Air, never seen by the plugin)
* No personal data from WordPress is transmitted to Air

**Terms and privacy:**

* Air Terms of Service: [https://air.inc/terms](https://air.inc/terms)
* Air Privacy Policy: [https://air.inc/privacy](https://air.inc/privacy)

== Changelog ==

= 0.2.11 =
* Removed the wp-admin plugin-directory filters (`plugins_api` / `plugins_api_result`) that previously replaced the WordPress.org search and details responses with a local payload. WordPress.org is now the sole source of plugin metadata, ratings, and updates.

= 0.2.10 =
* Removed canonical slug `air-asset-picker` from the internal legacy-listing replacement filter so the plugin will not override its own WordPress.org plugin-info payload (auto-updates, ratings, and stats from WordPress.org are now authoritative once the plugin is listed there).

= 0.2.9 =
* Renamed plugin to "Air Asset Picker" to comply with WordPress.org trademark restrictions on the term "WordPress" in plugin names.
* Added canonical submission build (`air-asset-picker.zip`) so the installed folder matches the plugin's text domain — resolves Plugin Check text-domain-mismatch errors.

= 0.2.8 =
* Readme prepared for WordPress.org submission: accurate short description, External Services disclosure, current changelog, updated screenshots and CTA references.

= 0.2.7 =
* Inspector buttons (Replace image, View in Air) resized to match Figma spec
* Preview thumbnail pinned to 47×76 with center-crop for tall images
* Empty-state and picker CTAs unified as "Add asset" (single upload)
* Enterprise paywall copy updated: "Upgrade to Enterprise" / "Explore plans"

= 0.2.6 =
* Internal version bump

= 0.2.5 =
* Restored "View in Air" copy (was briefly "View in AIR")

= 0.2.4 =
* QA fixes for inspector layout and button heights

= 0.2.3 =
* Pinned Replace button to deterministic 32px height across WordPress versions

= 0.2.2 =
* Fallback to `urls.selected` for "View in Air" when `urls.airDetail` is absent

= 0.2.1 =
* Inspector polish and accessibility improvements

= 0.2.0 =
* Asset detail panel improvements
* Inspector controls for resolution and resize

= 0.1.0 =
* Initial release
* Air Gutenberg block with iframe-based asset picker
* Settings page for workspace ID configuration
* Image and video asset support with Air CDN delivery

== Upgrade Notice ==

= 0.2.11 =
Removed legacy plugin-directory filters ahead of WordPress.org submission.

= 0.2.10 =
Submission-blocker fix: plugin no longer overrides its own WordPress.org listing.

= 0.2.9 =
Plugin renamed to "Air Asset Picker" for WordPress.org compliance.

= 0.2.8 =
Readme cleanup ahead of WordPress.org submission.

= 0.2.7 =
Design QA pass — updated button sizes, thumbnail dimensions, CTA copy, and Enterprise paywall to match Figma.
