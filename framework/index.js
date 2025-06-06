import { spawn, spawnSync } from "child_process";
import { parseArgs } from "node:util";

export * from "./components.js";

const deepMerge = (target, source) => {
  for (const key in source) {
    if (Array.isArray(source[key])) {
      target[key] = [...(target[key] || []), ...source[key]];
    } else if (typeof source[key] === "object") {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

const composeDockerfile = (transformers) => {
  const setup = transformers.reduce((setup, transform) => transform(setup), []);
  return setup.join("\n");
};

const buildImage = (name, from, transformers = []) => {
  const dockerfile = [
    `FROM ${from || "node:lts"}`,
    ...composeDockerfile(transformers),
  ];
  const result = spawnSync("docker", ["build", "-t", name, "-"], {
    input: dockerfile,
    stdio: ["pipe", process.stdout, process.stderr],
    encoding: "utf8",
  });

  if (result.status !== 0) {
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
  const allOptions = [
    {
      name: "rebuild",
      type: "boolean",
      description: "Rebuild the Docker image even if already exists",
    },
    ...handlers.flatMap((handler) => handler.options),
  ];
  const { values, positionals } = parseArgs({
    options: Object.fromEntries(
      allOptions
        .map(({ name, ...rest }) => [name, rest])
    ),
    allowPositionals: true,
    strict: false,
  });

  // Run all handlers in order and merge their results
  /** @type {Array<import('./types').BubbleConfig>} */
  const results = handlers.map((handler) =>
    handler.handler({ values, positionals, options: allOptions })
  );
  const finalConfig = results.reduce((acc, result) => deepMerge(acc, result), {
    imageTransforms: [],
    runArgsTransforms: [],
  });

  const name = `bubble-${values.name || "sandbox"}`;
  const imageName = `${name}-image`;

  const updateImage = () => {
    const allTransformers = [...finalConfig.imageTransforms];

    buildImage(imageName, values.from, allTransformers);
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

  const baseDockerArgs = [
    "--rm",
    "--name",
    name,
    "--entrypoint",
    "bash",
    imageName,
    ...positionals,
  ];

  const finalDockerArgs = finalConfig.runArgsTransforms.reduce(
    (args, transform) => transform(args, values),
    baseDockerArgs
  );

  const docker = spawn("docker", ["run", ...finalDockerArgs], {
    stdio: "inherit",
  });

  docker.on("close", (code) => {
    process.exit(code);
  });
};