import bubble from "../framework/bubble.js";
import {
  withDefaults,
  withEntrypoint,
  without,
  requireExtensions,
} from "../framework/index.js";

export default (command) => [
  ...without(bubble, ["withEntrypoint"]),
  withDefaults({
    name: "cli",
  }),
  ...requireExtensions("cli"),
  ...requireExtensions("cli_" + command),
  withEntrypoint(command),
];
