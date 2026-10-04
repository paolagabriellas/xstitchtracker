import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="font-serif text-4xl mb-3">Cross Stitch Tracker</h1>
      <p className="text-ink-3 text-sm text-center max-w-sm mb-8 leading-relaxed">
        Upload your FlossCross pattern, track your progress
        stitch by stitch, and follow a row-by-row color guide.
      </p>
      <div className="flex gap-3">
        <Link
          href="/register"
          className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium
                   hover:bg-[#7a5234]"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium
                   hover:bg-linen-2"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}