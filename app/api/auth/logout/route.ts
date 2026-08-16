import { NextResponse } from "next/server"
import { SESSION_COOKIE } from "@/lib/auth/config"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  const response = NextResponse.redirect(`${origin}/manager`, { status: 303 })
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 })
  return response
}
