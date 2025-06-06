export interface BubbleOption {
  /** Option name */
  name: string;
  /** Option type (boolean|string) */
  type: string;
  /** Option description */
  description?: string;
}

export interface BubbleConfig {
  /** Dockerfile transformations */
  imageTransforms?: Array<(setup: string[]) => string[]>;
  /** Docker run arguments transformations */
  runArgsTransforms?: Array<(args: string[]) => string[]>;
}

export interface BubbleComponent {
  /** CLI options */
  options: BubbleOption[];
  /** Handler function */
  handler: (params: { 
    values: Record<string, any>; 
    positionals?: string[]; 
    options?: BubbleOption[] 
  }) => BubbleConfig;
}