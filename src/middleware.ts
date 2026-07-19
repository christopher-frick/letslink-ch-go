import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { detectLang } from "@/lib/i18n";

export function middleware(request: NextRequest) {
  const lang = detectLang(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${lang}`, request.url));
}

export const config = {
  matcher: "/",
};
