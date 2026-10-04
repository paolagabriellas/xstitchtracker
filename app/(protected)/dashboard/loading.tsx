export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-linen-3 rounded-lg mb-6" />
      <div className="flex flex-col gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-linen-3 rounded-xl" />
        ))}
      </div>
      <div className="h-32 bg-linen-3 rounded-xl" />
    </div>
  );
}