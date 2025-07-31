import { ParseArgsOptionsConfig, ParseArgsOptionsType } from 'node:util';

export interface KipukaOption {
  name: keyof ParseArgsOptionsConfig;
  type: ParseArgsOptionsType;
  description?: string;
}

export interface KipukaConfig {
  name?: string,
  from?: string,
  /** Dockerfile transformations */
  imageTransforms?: Array<(setup: string[]) => string[]>;
  /** Docker run arguments transformations */
  runArgsTransforms?: Array<(args: string[]) => string[]>;
}

export interface KipukaComponent {
  id: string;
  options: KipukaOption[];
  handler: (params: {
    values: Record<string, any>;
    positionals?: string[];
    options?: KipukaOption[]
  }) => KipukaConfig;
}

export interface KipukasGlobalConfig {
  /**
   * Extensions to all kipukas inheriting from kipuka.
   * If you want to customize a single kipuka, create a file next to this instead.
   */
  extensions: {
    /** Extensions for root kipuka */
    root?: KipukaComponent[];
    /** Extensions for user kipuka */
    user?: KipukaComponent[];
    /** Extensions for cli kipuka */
    cli?: KipukaComponent[];
  };

  /**
   * CLI commands to run in a bubble after 'bubbles alias'
   */
  aliases: string[];
}