import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!path.every((part) => /^[a-zA-Z0-9_-]+$/.test(part))) {
    return NextResponse.json({ error: "Noto‘g‘ri manzil." }, { status: 400 });
  }
  const headers = new Headers();
  for (const key of ["content-type", "cookie", "x-admin-key", "origin"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  try {
    const upstream = await fetch(`${process.env.API_URL ?? "https://hakatton-backend.onrender.com"}/api/${path.join("/")}${request.nextUrl.search}`, {
      method: request.method, headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
    });
    const result = new NextResponse(await upstream.arrayBuffer(), { status: upstream.status });
    result.headers.set("content-type", upstream.headers.get("content-type") ?? "application/json");
    result.headers.set("cache-control", "no-store");
    for (const cookie of upstream.headers.getSetCookie()) result.headers.append("set-cookie", cookie);
    return result;
  } catch {
    return NextResponse.json({ error: "Server bilan aloqa yo‘q. Bir ozdan keyin qayta urinib ko‘ring." }, { status: 503 });
  }
}
export { proxy as GET, proxy as POST, proxy as DELETE, proxy as PUT, proxy as PATCH };
