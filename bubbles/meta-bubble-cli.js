import bubble from "./bubble.js";
import {
  withDefaults,
  withEntrypoint,
  without,
} from "../framework/index.js";

export default (command)=>[
  ...without(bubble, ["withInteractive", "withEntrypoint"]),
  withDefaults({
    name: "cli",
  }),
  // TODO get the tty info forwarded somehow so it does color
  withEntrypoint(command)
];
