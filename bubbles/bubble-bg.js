import bubble from "./bubble.js";
import { withDetached, without } from "../framework/index.js";

export default [
  ...without(bubble, ["withInteractive"]),
  withDefaults({
    name: "background",
  }),
  withDetached(),
];
