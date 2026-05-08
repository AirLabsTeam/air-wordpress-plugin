# Air WordPress Plugin

## WordPress Playground (browser-only QA)

Designers / PM can boot a disposable WordPress in the browser with the plugin
preinstalled — no Docker, no local install. Each link below pulls the matching
zip from the latest GitHub Release.

| Env  | Open in Playground |
|------|--------------------|
| dev  | https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/AirLabsTeam/air-wordpress-plugin/main/blueprints/dev.json |
| qa   | https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/AirLabsTeam/air-wordpress-plugin/main/blueprints/qa.json |
| prod | https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/AirLabsTeam/air-wordpress-plugin/main/blueprints/prod.json |

Login: `admin` / `password`. Lands on a new post; insert the **Air Asset
Picker** block to test. State is ephemeral — refresh wipes the site.

The blueprints bake a default `air_workspace_id` via `setSiteOptions`.
Default workspace targets:

| Env       | Workspace                                              |
|-----------|--------------------------------------------------------|
| dev / qa  | `QA Air Workspace` (`254754d4-15f8-4547-89f8-f27e64d40ffd`) on `api-qa.air.inc` |
| prod      | `Air Workspace` (`77b00fde-3652-4bc3-8b7b-32a4f14617eb`) on `api.air.inc`       |

To target a different workspace, edit the `air_workspace_id` value in the
matching `blueprints/{dev,qa,prod}.json` file.

### Cutting a release

Tag a commit `v*` (e.g. `git tag v0.1.1 && git push --tags`). The
`Release Plugin Builds` workflow builds three zips
(`air-picker-development.zip`, `air-picker-qa.zip`, `air-picker-production.zip`)
and attaches them to a GitHub Release. The Playground links above always
resolve to the latest release.

### Picker iframe / CORS notes

- Each Air picker origin (`localhost:3007`, `qa.wordpress-plugin.air.inc`,
  `wordpress-plugin.air.inc`) must allow being framed by
  `https://playground.wordpress.net` (CSP `frame-ancestors`, no
  `X-Frame-Options: DENY`).
- API calls from the picker need CORS allow for the Playground origin.
- `localhost:3007` will not work in Playground (browser cannot reach the
  designer's localhost). Use the qa or prod link for Playground QA.

## Local development

### Prerequisites

- Docker Desktop
- Node.js 22+ (via nvm)

### Setup

1. Create a standalone yarn lockfile (required since this plugin is excluded from the monorepo workspaces):

```bash
touch yarn.lock
```

2. Install dependencies:

```bash
yarn install
```

## Environments

The Air picker iframe URL is selected at build time. Three committed env files
drive the defaults:

| File              | Picker target                              | Use for                          |
|-------------------|--------------------------------------------|----------------------------------|
| `.env.development` | `http://localhost:3007`                   | local Next picker (`next dev`)   |
| `.env.qa`          | `https://qa.wordpress-plugin.air.inc`     | qa Vercel deployment             |
| `.env.production`  | `https://wordpress-plugin.air.inc`        | prod Vercel deployment           |

Personal overrides (gitignored, optional):

- `.env.local` — applies to every environment
- `.env.<APP_ENV>.local` — applies to one environment
- `.env` — lowest-priority fallback

Resolution order (first wins, matches Next.js):

```
process.env CLI > .env.<APP_ENV>.local > .env.local > .env.<APP_ENV> > .env
```

The webpack config logs the resolved value at every build:

```
[webpack] APP_ENV=qa AIR_PICKER_ORIGIN=https://qa.wordpress-plugin.air.inc
```

### Build scripts

```bash
npm run build:dev     # bundle against http://localhost:3007
npm run build:qa      # bundle against qa.wordpress-plugin.air.inc
npm run build:prod    # bundle against wordpress-plugin.air.inc
```

### Watch scripts (rebuild on file change)

```bash
npm run start:dev
npm run start:qa
npm run start:prod
```

### One-shot full-stack scripts (build + wp-env)

```bash
npm run wp:dev        # build dev bundle, then `wp-env start`
npm run wp:qa
npm run wp:prod
```

`npm run build` / `npm run start` (no suffix) honour whatever `APP_ENV` is in
the shell, defaulting to `development` if unset.

### Running WordPress locally

#### Option A — wp-env (recommended)

```bash
yarn dlx @wordpress/env start
```

WordPress at `http://localhost:8888` — username: `admin`, password: `v1I&ir9jRTvechcJ&9jxOZin`.

#### Option B — docker-compose

```bash
export NEXT_WP_PLUGIN_DIR=~/path/to/next/plugins/wordpress
docker-compose up
```

WordPress at `http://localhost:4080`.

> ⚠️ **Local dev only:** `docker-compose.yml` uses hardcoded credentials:
> `MARIADB_ROOT_PASSWORD=root` and `MARIADB_PASSWORD=wordpress`.
> Never use these in a shared or staging environment.

### Settings → Air Media

After the plugin is active, configure the Air workspace ID under
**Settings → Air Media** in wp-admin. The block reads the workspace ID from
`window.airAssetPickerData.workspaceId`, which is localised by PHP from the
saved option.

### Running the Air picker locally (legacy)

The `air-picker/` folder contains a static dev stand-in for the Air gallery
picker. It is no longer the default — the build now points at the deployed
Next picker app. Keep it around if you want to test the iframe handshake
without depending on the Next dev server:

```bash
python3 -m http.server 8000 --directory air-picker
```

Then create a `.env.local` with `AIR_PICKER_ORIGIN=http://localhost:8000` and
run `npm run build:dev`.
