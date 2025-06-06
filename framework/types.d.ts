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