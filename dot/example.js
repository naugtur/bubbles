import { kipuka, without, withDefaults, withPackages } from '@naugtur/kipuka';

export default [
 ...without(kipuka, ["withDefaults"]), // take the base composition but remove components you donb't need
  withDefaults({
    name: "mykipuka",
    from: "node:lts",
  }),
  withPackages(['vim','ssh'])
]