# Kipuka 

Easy, composable and transparent way to run things in a docker container.

> [kipuka](https://en.wikipedia.org/wiki/Kipuka) - island of older ecosystem preserved within volcanic lava flows. 
> Because our ecosystem gives you things to run that are better left on an island among lava...



## Transparently protect all your installs ans scripts

Want to keep using the tools you're used to but get additional security?

### Quick Start

```bash
# Install kipuka globally
npm install -g @naugtur/kipuka

# Initialize configuration
kipuka init

# Set up shell aliases for package managers
kipuka alias
## or put `kipuka alias` at the end of your .bashrc
```

Now npm, yarn, pnpm run in docker containers


```
npm install
npm install --save-dev eslint
npm run build
npx create-next-app my-app
```


Kipuka lets you run any CLI tool in a containerized environment without polluting your host system or worrying about what that sketchy package is actually doing.

### Start bash in kipuka in your current folder

```
kipuka
```

With custom options
```
kipuka -- --help
```

### Clean up when you have too many

Run `kipuka cleanup` and it'll help you clean things up one by one.



## Commands

### `kipuka --`
Run the default kipuka environment.

### `kipuka run <name>`
Run a custom kipuka defined in `~/.kipuka/<name>.js`.

### `kipuka cli <command>`
Run a CLI command in an isolated container. This is what gets aliased when you run `kipuka alias`.

### `kipuka init`
Initialize kipuka configuration directory at `~/.kipuka/` with:
- `kipuka.config.js` - Global configuration
- `example.js` - Example custom kipuka
- `package.json` - Node.js module configuration

### `kipuka alias`
Output shell aliases for package managers. Run with `eval "$(kipuka alias)"` to activate:
- `npm` → `kipuka cli npm`
- `yarn` → `kipuka cli yarn`  
- `pnpm` → `kipuka cli pnpm`
- etc.

### `kipuka cleanup`
Interactively stop and remove selected kipuka containers and images. Keeps your Docker environment tidy.

### `kipuka help`
Show usage information.

## Configuration

Edit `~/.kipuka/kipuka.config.js` to customize:

```javascript
/** @type {KipukasGlobalConfig} */
export default {
  extensions: {
    // Extensions for all kipukas
    root: [withPackages(['vim', 'curl'])],
    user: [withEnv({ EDITOR: 'vim' })],
    cli: []
  },
  // Commands to alias to kipuka
  aliases: ['npm', 'npx', 'pnpm', 'pnpx', 'yarn', 'yarnpkg']
};
```

---


## Composing Your Own Kipuka

Create custom environments by composing components in `~/.kipuka/<name>.js`:

```javascript
import { kipuka, without, withDefaults, withPackages } from '@naugtur/kipuka';

export default [
  ...without(kipuka, ["withDefaults"]),
  withDefaults({ name: "my-secure-env" }),
  withPackages(['git', 'vim', 'curl']),
  withEnv({ NODE_ENV: 'development' })
];
```

### Available Components

| Component | Description | Example |
|-----------|-------------|---------|
| `without` | Remove components from base | `without(kipuka, ['withDefaults'])` |
| `withDefaults` | Set basic kipuka configuration | `withDefaults({ name: "myapp" })` |
| `withPackages` | Install system packages | `withPackages(['git', 'vim', 'curl'])` |
| `withEnv` | Set environment variables | `withEnv({ NODE_ENV: 'dev' })` |
| `withPort` | Expose container port | `withPort('3000')` |
| `withMountpoint` | | |
| `withOfflineOption` | | |
| `withHelp` | | |
| `withInteractive` | | |
| `withDetached` | | |
| `withPackagesOption` | | |
| `withNpmPackagesOption` | | |
| `withNpmPackages` | | |
| `withRuns` | | |
| `withCMD` | | |
| `withUser` | | |
| `withEntrypoint` | | |
| `withPortsOption` | | |
| `withFile` | | |
| `withAliases` | | |
| `withArt` | | |
| `requireExtensions` | | |

## How It Works

Kipuka creates isolated Docker containers for running CLI tools and development environments. Each kipuka is composed of reusable components that modify the Docker image and runtime configuration. When you run a command through kipuka, it:

1. Builds a custom Docker image based on your component composition
2. Mounts your current directory and relevant config files
3. Runs your command in the isolated container

Your files stay on the host, but the execution environment is isolated.


---
