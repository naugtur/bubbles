import { spawnSync } from "child_process";
import { parseArgs } from "node:util";

export * from "./components.js";

/** @typedef {import("./components.js").BubbleConfig} BubbleConfig */
/** @typedef {import("./components.js").BubbleOption} BubbleOption */

/**
 * @param {BubbleConfig[]} configs
 */
const mergeBubbleConfigs = (configs) =>
  configs.reduce(
    /**
     * @param {Required<BubbleConfig>} acc
     * @param {BubbleConfig} conf
     * @return {Required<BubbleConfig>}
     */
    (acc, conf) => ({
      ...acc,
      ...conf,
      imageTransforms: [
        ...acc.imageTransforms,
        ...(conf.imageTransforms || []),
      ],
      runArgsTransforms: [
        ...acc.runArgsTransforms,
        ...(conf.runArgsTransforms || []),
      ],
    }),
    {
      imageTransforms: [],
      runArgsTransforms: [],
    }
  );

const composeDockerfile = (from, transformers) => {
  const setup = transformers.reduce((setup, transform) => transform(setup), []);
  return `FROM ${from || "node:lts"}\n${setup.join("\n")}\n`;
};

const buildImage = (name, from, transformers = []) => {
  const dockerfile = composeDockerfile(from, transformers);
  const result = spawnSync("docker", ["build", "-t", name, "-"], {
    input: dockerfile,
    // stdio: "pipe",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    console.error(`Error building Docker image ${name}:\n${result.stderr}`);
    process.exit(1);
  }
};

export const without = (handlers, ids) => {
  return handlers.filter((handler) => !ids.includes(handler.id));
};

/**
 * Creates and runs a containerized environment based on provided components
 * @param {import('./types').BubbleComponent[]} handlers - Array of bubble components
 * @returns {void}
 */
export const blowBubble = (handlers) => {
  /** @type {BubbleOption[]} */
  const allOptions = [
    {
      name: "rebuild",
      type: "boolean",
      description: "Rebuild the Docker image even if already exists",
    },
    {
      name: "dryRun",
      type: "boolean",
      description: "prints resulting configs, does nothing",
    },
    ...handlers.flatMap((handler) => handler.options),
  ];
  const { values, positionals } = parseArgs({
    options: Object.fromEntries(
      allOptions.map(({ name, type, description }) => [
        name,
        { type, description },
      ])
    ),
    allowPositionals: true,
    strict: false,
  });

  /** @type {BubbleConfig[]} */
  const results = handlers.map((handler) =>
    handler.handler({ values, positionals, options: allOptions })
  );
  const finalConfig = mergeBubbleConfigs(results);

  const name = `bubble-${finalConfig.name || "sandbox"}`;
  const imageName = `${name}-image`;

  const baseDockerArgs = ["--rm", "--name", name, "--entrypoint", "bash"];

  const finalDockerArgs = [
    ...finalConfig.runArgsTransforms.reduce(
      (args, transform) => transform(args),
      baseDockerArgs
    ),
    imageName,
    ...positionals,
  ];

  if (values.dryRun) {
    console.log(`Dry run mode enabled. Docker image will not be built or run.

**Image name**
${imageName}

**Run arguments**
${finalDockerArgs.join("\n")}

**Dockerfile content**
${composeDockerfile(finalConfig.from, finalConfig.imageTransforms)}`);
    process.exit(0);
  }

  const updateImage = () => {
    const allTransformers = [...finalConfig.imageTransforms];

    buildImage(imageName, finalConfig.from, allTransformers);
  };

  if (values.rebuild) {
    updateImage();
  } else {
    // Check if image exists
    const imageCheck = spawnSync("docker", ["image", "inspect", imageName], {
      stdio: "ignore",
    });

    if (imageCheck.status !== 0) {
      console.log("Image not found. Building...");
      updateImage();
    }
  }

  spawnSync("docker", ["run", ...finalDockerArgs], {
    stdio: "inherit",
  });
};
