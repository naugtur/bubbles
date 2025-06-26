# Agent Configuration for Bubbles

## Commands
- Build: `npm run build` (generates CLI from framework)
- Test: No tests configured (returns error)
- Type check: `npx tsc --noEmit`
- Run CLI: `node cli/bubble.js`, `node cli/bubble-bg.js`, `node cli/bubble-amp.js`

## Code Style
- ES modules with `import`/`export`
- JSDoc for type annotations (`/** @typedef */`, `@param`, `@returns`)
- TypeScript checking via JSDoc in JS files
- Destructuring in function parameters `({ values, positionals })`
- Arrow functions for callbacks and transforms
- Use `snake_case` for variables, `camelCase` for functions
- Export named functions, default exports for component arrays

## Architecture
- Framework in `/framework/` with components system
- Bubble configs in `/bubbles/` as component compositions  
- CLI wrappers in `/cli/` that import and run bubbles
- Each bubble is an array of reusable components

## Error Handling
- Use `process.exit(1)` for fatal errors
- Check Docker command exit codes with `spawnSync`
- Throw errors for invalid configurations
