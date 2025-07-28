import bubble from "../framework/bubble.js";
import { withDetached, withDefaults, without } from "../framework/index.js";

export default [
  ...without(bubble, ["withInteractive"]),
  withDefaults({
    name: "background",
  }),
  withDetached(),
];
