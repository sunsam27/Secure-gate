import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user is verified
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, name: true, email: true, createdAt: true },
  });

  if (!user?.emailVerified) {
    redirect("/login?error=unverified");
  }

  return (
    <DashboardClient
      name={user.name}
      email={user.email}
      createdAt={user.createdAt.toISOString()}
    />
  );
}
