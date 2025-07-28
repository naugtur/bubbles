import bubble from "../framework/bubble.js";
import {
  withCMD,
  withDefaults,
  withEntrypoint,
  withFile,
  without,
} from "../framework/index.js";

export default [
  ...without(bubble, ["withInteractive", "withEntrypoint"]),
  withDefaults({
    name: "npm",
  }),
  withEntrypoint("npm")
];
