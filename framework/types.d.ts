import { ParseArgsOptionsConfig, ParseArgsOptionsType } from 'node:util';

export interface BubbleOption {
  name: keyof ParseArgsOptionsConfig;
  type: ParseArgsOptionsType;
  description?: string;
}

export interface BubbleConfig {
  name?: string,
  from?: string,
  /** Dockerfile transformations */
  imageTransforms?: Array<(setup: string[]) => string[]>;
  /** Docker run arguments transformations */
  runArgsTransforms?: Array<(args: string[]) => string[]>;
}

export interface BubbleComponent {
  id: string;
  options: BubbleOption[];
  handler: (params: {
    values: Record<string, any>;
    positionals?: string[];
    options?: BubbleOption[]
  }) => BubbleConfig;
}

export interface BubblesGlobalConfig {
  /**
   * Extensions to all bubbles inheriting from bubble.
   * If you want to customize a single bubble, create a file next to this instead.
   */
  extensions: {
    /** Extensions for root bubble */
    root?: BubbleComponent[];
    /** Extensions for user bubble */
    user?: BubbleComponent[];
    /** Extensions for cli bubble */
    cli?: BubbleComponent[];
  };

  /**
   * CLI commands to run in a bubble after 'bubbles alias'
   */
  aliases: string[];
}