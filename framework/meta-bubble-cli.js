import bubble from "./bubble.js";
import {
  withDefaults,
  withEntrypoint,
  without,
  requireExtensions,
} from "./index.js";

export default (command) => [
  ...without(bubble, ["withEntrypoint", "withHelp"]),
  withDefaults({
    name: "cli",
  }),
  ...requireExtensions("cli"),
  ...requireExtensions("cli_" + command),
  withEntrypoint(command),
];
