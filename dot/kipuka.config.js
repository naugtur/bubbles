/** @type {import('@naugtur/kipuka').KipukasGlobalConfig} */
export default {
  extensions: {
    // extensions to all kipukas inheriting from kipuka
    // if you want a single custom kipuka, create a file next to this instead. see: example.js
    // root: [withPackages(['vim','ssh'])]
    // user: 
  },
  // clis to generate aliases for
  aliases: ['npm','npx','pnpm','pnpx','yarn','yarnpkg']
};