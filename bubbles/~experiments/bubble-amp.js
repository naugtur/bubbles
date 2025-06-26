import bubble from "./bubble.js";
import { withDefaults, withNpmPackages, withPort, withPortsOption } from "../framework/index.js";

export default [
  ...bubble,
  withDefaults({
    name: "sourcegraph-amp",
  }),
  withPort(35789),
  withNpmPackages(["@sourcegraph/amp"]),
];
