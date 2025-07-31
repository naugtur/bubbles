import kipuka from "./kipuka.js";
import {
  withDefaults,
  withEntrypoint,
  without,
  requireExtensions,
} from "./index.js";

export default (command) => [
  ...without(kipuka, ["withEntrypoint", "withHelp"]),
  withDefaults({
    name: "cli",
  }),
  ...requireExtensions("cli"),
  ...requireExtensions("cli_" + command),
  withEntrypoint(command),
];
