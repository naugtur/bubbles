import bubble from "./bubble.js";
import {
  withDefaults,
  withEntrypoint,
  without,
} from "../framework/index.js";

export default (command)=>[
  ...without(bubble, [
    "withEntrypoint"
  ]),
  withDefaults({
    name: "cli",
  }),
  withEntrypoint(command)
];
