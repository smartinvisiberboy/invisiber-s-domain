import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getManagerSession } from "@/lib/auth/session"
import { DashboardClient } from "@/components/manager/dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard — Manager Portal",
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const session = await getManagerSession()
  if (!session) redirect("/manager")

  return <DashboardClient manager={{ username: session.username, role: session.role, avatar: session.avatar }} />
}
