import { NextResponse } from "next/server";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function fail(status: number, message: string): never {
  throw new ApiError(status, message);
}
export function errorResponse(error: unknown) {
  if (error instanceof ApiError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof Error && error.message.includes("UNIQUE constraint"))
    return NextResponse.json(
      { error: "That email or username is already registered." },
      { status: 409 },
    );
  console.error(
    "Explorium request failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  return NextResponse.json(
    { error: "The request could not be completed. Please try again." },
    { status: 500 },
  );
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expectedHost = process.env.EXPLORIUM_APP_URL
    ? new URL(process.env.EXPLORIUM_APP_URL).host
    : request.headers.get("host") || new URL(request.url).host;
  if (request.headers.get("sec-fetch-site") === "cross-site")
    fail(403, "This request must come from the academy website.");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      fail(403, "Invalid request origin.");
    }
    if (originHost !== expectedHost)
      fail(403, "This request must come from the academy website.");
  }
}
export async function body(request: Request): Promise<Record<string, unknown>> {
  assertSameOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json"))
    fail(415, "Please send JSON form data.");
  const raw = await request.text();
  if (raw.length > 65536) fail(413, "This request is too large.");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    fail(400, "Please send valid form data.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    fail(400, "Please send valid form data.");
  return data as Record<string, unknown>;
}
export function stringField(
  data: Record<string, unknown>,
  key: string,
  required = false,
  max = 1000,
): string {
  const value = data[key];
  if (value === undefined || value === null) {
    if (required) fail(400, `${key} is required.`);
    return "";
  }
  if (typeof value !== "string") fail(400, `${key} must be text.`);
  const text = value.trim();
  if (required && !text) fail(400, `${key} is required.`);
  if (text.length > max) fail(400, `${key} is too long.`);
  return text;
}
export function idArray(value: unknown, field: string): string[] {
  if (value === undefined) return [];
  if (
    !Array.isArray(value) ||
    value.length > 1000 ||
    value.some((x) => typeof x !== "string" || x.length > 100)
  )
    fail(400, `${field} must be a list of IDs.`);
  return [...new Set(value)] as string[];
}
