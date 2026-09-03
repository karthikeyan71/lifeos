import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <h1>LifeOS</h1>

      <p>Logged in as: {user?.email}</p>
    </main>
  );
}
