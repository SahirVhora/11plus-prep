export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  setHeader(name: string, value: string | string[]): void;
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
  end(): void;
}
