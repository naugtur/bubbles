/** @typedef {import('./types').BubbleComponent} BubbleComponent */
/** @typedef {import('./types').BubbleOption} BubbleOption */
/** @typedef {import('./types').BubbleConfig} BubbleConfig */

import { basename, join } from "node:path";
import { readGlobalConfig } from "./internal.js";

/**
 * @param {string} [path="/mountpoint"] - Path to mount
 * @param {string} [user="node"] - User to own the mountpoint
 * @returns {BubbleComponent}
 */
export const withMountpoint = (path = "/mountpoint", user) => ({
  id: "withMountpoint",
  options: [],
  handler: () => {
    return {
      imageTransforms: [
        (setup = []) => [
          ...setup,
          `RUN mkdir ${path}`,
          `RUN chown -R ${user}:${user} ${path}`,
          `WORKDIR ${path}`,
        ],
      ],
      runArgsTransforms: [
        (args) => ["-v", `${process.cwd()}:${path}`, ...args],
      ],
    };
  },
});

/**
 * Creates a component that adds offline mode option
 * @returns {BubbleComponent}
 */
export const withOfflineOption = () => ({
  id: "withOfflineOption",
  options: [
    {
      name: "offline",
      type: "boolean",
      description: "Run container with network access disabled",
    },
  ],
  handler: ({ values }) => ({
    runArgsTransforms: values.offline
      ? [(args) => [...args, "--network", "none"]]
      : [],
  }),
});

/**
 * Creates a component that provides default values
 * @param {Object} [defaults={}] - Default values
 * @returns {BubbleComponent}
 */
export const withDefaults = (defaults = {}) => ({
  id: "withDefaults",
  options: [],
  handler: () => defaults,
});
/**
 * Creates a component that adds help option
 * @returns {BubbleComponent}
 */
export const withHelp = () => ({
  id: "withHelp",
  options: [
    {
      name: "help",
      type: "boolean",
      description: "Show help information",
    },
  ],
  handler: ({ values, options = [] }) => {
    if (values.help) {
      console.log(`Usage: ${basename(process.argv[1])} [OPTIONS]
Options:
  ${options.map((opt) => `--${opt.name}\t ${opt.description}`).join("\n  ")}`);
      process.exit(0);
    }
    return {};
  },
});

/**
 * Creates a component that enables interactive mode
 * @returns {BubbleComponent}
 */
export const withInteractive = () => ({
  id: "withInteractive",
  options: [],
  handler: () => ({
    runArgsTransforms: [
      (args) => ["-it", "-e", `TERM=${process.env.TERM}`, ...args],
    ],
  }),
});
/**
 * Creates a component that enables detached mode
 * @returns {BubbleComponent}
 */
export const withDetached = () => ({
  id: "withDetached",
  options: [],
  handler: () => ({
    runArgsTransforms: [(args) => ["-d", ...args]],
  }),
});

/**
 * Creates a component that adds package installation option
 * @returns {BubbleComponent}
 */
export const withPackagesOption = () => ({
  id: "withPackagesOption",
  options: [
    {
      name: "apt",
      type: "string",
      description: "Comma-separated list of packages to install with apt",
    },
  ],
  handler: ({ values }) => ({
    imageTransforms: values.packages
      ? [
          (setup) => [
            `RUN apt update && apt install -y ${values.packages
              .split(",")
              .join(" ")}`,
            ...setup,
          ],
        ]
      : [],
  }),
});
/**
 * Creates a component that adds package installation option
 * @returns {BubbleComponent}
 */
export const withNpmPackagesOption = () => ({
  id: "withNpmPackagesOption",
  options: [
    {
      name: "npm",
      type: "string",
      description: "Comma-separated list of packages to install with npm -g",
    },
  ],
  handler: ({ values }) => ({
    imageTransforms: values.packages
      ? [
          (setup) => [
            `RUN npm install -g ${values.packages.split(",").join(" ")}`,
            ...setup,
          ],
        ]
      : [],
  }),
});

/**
 * Creates a component that installs specified packages
 * @param {string[]} packages - Packages to install
 * @returns {BubbleComponent}
 */
export const withPackages = (packages) => ({
  id: "withPackages",
  options: [],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) => [
        `RUN apt update && apt install -y ${values.packages.join(" ")}`,
        ...setup,
      ],
    ],
  }),
});
/**
 * Creates a component that installs specified packages
 * @param {string[]} packages - Packages to install
 * @returns {BubbleComponent}
 */
export const withNpmPackages = (packages) => ({
  id: "withNpmPackages",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [`RUN npm install -g ${packages.join(" ")}`, ...setup],
    ],
  }),
});

/**
 * Creates a component that adds RUN commands
 * @param {string[]} runs - Commands to run
 * @returns {BubbleComponent}
 */
export const withRuns = (runs) => ({
  id: "withRuns",
  options: [],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) => [...runs.map((run) => `RUN ${run}`), ...setup],
    ],
  }),
});
/**
 * Creates a component that adds RUN commands
 * @param {string} cmd - Commands to run
 * @returns {BubbleComponent}
 */
export const withCMD = (cmd) => ({
  id: "withCMD",
  options: [],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) => {
        if (setup[setup.length - 1]?.startsWith("CMD ")) {
          throw new Error("CMD command already set, cannot add another one");
        }
        return [...setup, `CMD ${cmd}`];
      },
    ],
  }),
});
/**
 * Creates a component that adds RUN commands
 * @param {string} user - Commands to run
 * @returns {BubbleComponent}
 */
export const withUser = (user) => ({
  id: "withUser",
  options: [
    {
      name: "history",
      type: "boolean",
      description: "Mount local bash history into container",
    },
  ],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) => {
        if (setup[setup.length - 1]?.startsWith("USER ")) {
          throw new Error("USER command already set, cannot add another one");
        }
        return [...setup, `USER ${user}`];
      },
    ],
    runArgsTransforms: values.history
      ? [
          (args) => [
            ...args,
            "-v",
            `${process.env.HOME}/.bash_history:/home/${user}/.bash_history`,
          ],
        ]
      : [],
  }),
});
/**
 * Creates a component that exposes a specific port
 * @param {number} port - Port number to expose
 * @returns {BubbleComponent}
 */
export const withPort = (port) => ({
  id: "withPort",
  options: [],
  handler: () => ({
    runArgsTransforms: [(args) => [...args, "-p", `${port}:${port}`]],
  }),
});
/**
 * selects an entrypoint
 * @param {string} entrypoint - Port number to expose
 * @returns {BubbleComponent}
 */
export const withEntrypoint = (entrypoint) => ({
  id: "withEntrypoint",
  options: [],
  handler: () => ({
    runArgsTransforms: [(args) => [...args, "--entrypoint", entrypoint]],
  }),
});

/**
 * Creates a component that adds a port exposure option
 * @returns {BubbleComponent}
 */
export const withPortsOption = () => ({
  id: "withPortOption",
  options: [
    {
      name: "portforward",
      type: "string",
      description: "Port number to expose from the container",
    },
  ],
  handler: ({ values }) => ({
    runArgsTransforms: values.portforward ? [(args) => [...args, "-P"]] : [],
  }),
});

/**
 * Creates a component that adds a file to the container
 * @param {string} path - Path where to create the file in container
 * @param {string} content - Content of the file
 * @returns {BubbleComponent}
 */
export const withFile = (path, content) => ({
  id: "withFile",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [...setup, `RUN cat <<'EOF' > ${path}\n${content}\nEOF`],
    ],
  }),
});

/**
 * Creates a component that adds command aliases to the container
 * @param {Object.<string, string>} aliases - Object mapping alias names to commands
 * @returns {BubbleComponent}
 */
export const withAliases = (aliases) => ({
  id: "withAliases",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [
        ...setup,
        ...Object.entries(aliases).map(
          ([alias, command]) =>
            `RUN echo 'alias ${alias}="${command.replace(
              /"/g,
              '\\"'
            )}"' >> ~/.bashrc`
        ),
      ],
    ],
  }),
});

/**
 * Creates a component that sets environment variables in the container
 * @param {Object.<string, string>} env - Object mapping environment variable names to values
 * @returns {BubbleComponent}
 */
export const withEnv = (env) => ({
  id: "withEnv",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [
        ...setup,
        ...Object.entries(env).map(([key, value]) => `ENV ${key}=${value}`),
      ],
    ],
  }),
});

/**
 * Creates a component that prints an ASCII art of a bubble
 * @returns {BubbleComponent}
 */
export const withArt = () => ({
  id: "withArt",
  options: [],
  handler: () => {
    console.log(` . ∘  ◯ ◦ (running in a bubble) ○◦ *  •`);
    return {};
  },
});

/**
 * Creates a component that loads extensions from ~/.bubbles.js
 * @param {string} name - Name of the extension to load
 * @returns {BubbleComponent[]}
 */
export const requireExtensions = (name) => {
  let config;
  try {
    config = readGlobalConfig()
  } catch (e) {
  }
  if (config) {
    const extensions = config.extensions || {};

    if (extensions[name] && Array.isArray(extensions[name])) {
      return extensions[name];
    }
  }
  return [];
};
