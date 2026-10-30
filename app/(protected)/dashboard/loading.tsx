import { NavBar } from "@/components/navbar";

export default function DashboardLoading() {
  return (
    <>
      <NavBar />
      <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-4 py-4 animate-pulse">
        <div className="h-8 w-48 bg-linen-3 rounded-lg mb-6" />
        <div className="flex flex-col gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-linen-3 rounded-xl" />
          ))}
        </div>
        <div className="h-32 bg-linen-3 rounded-xl" />
      </div>
    </>
  );
}
