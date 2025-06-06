/** @typedef {import('./types').BubbleComponent} BubbleComponent */
/** @typedef {import('./types').BubbleOption} BubbleOption */
/** @typedef {import('./types').BubbleConfig} BubbleConfig */

import { basename } from "node:path";

/**
 * Creates a component that sets up a mountpoint in the container
 * @param {string} [path="/mountpoint"] - Path to mount
 * @returns {BubbleComponent}
 */
export const withMountpoint = (path = "/mountpoint") => ({
  id: "withMountpoint",
  options: [],
  handler: () => {
    return {
      imageTransforms: [
        (setup = []) => [
          ...setup,
          `RUN mkdir ${path}`,
          `RUN chown -R node:node ${path}`,
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
      ? [(args) => ["--network", "none", ...args]]
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
  handler: ({ values, options }) => {
    if (values.help) {
      console.log(`Usage: ${basename(process.argv[1])} [OPTIONS]
Options:
  ${options.map((opt) => `--${opt.name}\t ${opt.description}`).join("\n ")}`);
    }
    process.exit(0);
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
    runArgsTransforms: [(args) => ["-it", ...args]],
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
      name: "packages",
      type: "string",
      description: "Comma-separated list of packages to install",
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
        `RUN apt update && apt install -y ${values.packages
          .split(",")
          .join(" ")}`,
        ...setup,
      ],
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
 * @param {string[]} runs - Commands to run
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
