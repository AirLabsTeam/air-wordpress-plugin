# Air WordPress Plugin

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

3. Start the build watcher:

```bash
yarn start
```

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

### Running the Air picker locally

The `air-picker/` folder contains a local dev stand-in for the Air gallery picker.
Serve it on port 8000 so the WordPress block can load it in its iframe:

```bash
# From the project root:
python3 -m http.server 8000 --directory air-picker

# Or from inside the air-picker/ folder:
cd air-picker && python3 -m http.server 8000
```

The picker renders a searchable, filterable asset grid. Clicking **Insert** sends the
selected asset back to the WordPress block via `postMessage`.

> When integrating with the real Air app, update `AIR_PICKER_ORIGIN` in
> `src/constants.js` to the production URL and remove the `air-picker/` folder.
