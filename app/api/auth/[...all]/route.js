import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getHandlers() {
  return toNextJsHandler(getAuth());
}

export async function GET(request) {
  return getHandlers().GET(request);
}

export async function POST(request) {
  return getHandlers().POST(request);
}

export async function PUT(request) {
  const handlers = getHandlers();
  if (typeof handlers.PUT === "function") return handlers.PUT(request);
  return new Response("Method Not Allowed", { status: 405 });
}

export async function PATCH(request) {
  const handlers = getHandlers();
  if (typeof handlers.PATCH === "function") return handlers.PATCH(request);
  return new Response("Method Not Allowed", { status: 405 });
}

export async function DELETE(request) {
  const handlers = getHandlers();
  if (typeof handlers.DELETE === "function") return handlers.DELETE(request);
  return new Response("Method Not Allowed", { status: 405 });
}
