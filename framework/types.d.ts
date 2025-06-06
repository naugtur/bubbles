import { ParseArgsOptionConfig } from 'node:util';

export interface BubbleOption {
  name: string;
  type: ParseArgsOptionConfig['type'];
  description?: string;
}

export interface BubbleConfig {
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