import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-sand-50">
      <Header userName={user.name} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
