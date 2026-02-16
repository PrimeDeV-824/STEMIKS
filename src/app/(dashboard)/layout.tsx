import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#070d1a] flex">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-5 md:p-8 overflow-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
