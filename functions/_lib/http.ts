export function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(body), {
    ...init,
    headers
  });
}

export function jsonError(message: string, status = 500): Response {
  return json({ error: message }, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
}
