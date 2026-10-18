declare module 'mammoth' {
  export interface MammothResult {
    value: string; // The generated HTML
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface ConvertOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: any;
    path?: string;
  }

  export function convertToHtml(input: ConvertOptions, options?: any): Promise<MammothResult>;
  export function extractRawText(input: ConvertOptions): Promise<MammothResult>;
}
