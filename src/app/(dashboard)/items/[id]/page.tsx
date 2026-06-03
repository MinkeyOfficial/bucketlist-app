import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ItemDetail from "@/components/ItemDetail";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  return <ItemDetail itemId={id} />;
}
