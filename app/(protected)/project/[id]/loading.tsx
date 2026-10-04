"use client";

export default function ProjectLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-32 bg-linen-3 rounded mb-4" />
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-border mb-4">
        <div className="h-7 w-48 bg-linen-3 rounded" />
        <div className="h-4 w-20 bg-linen-3 rounded" />
      </div>
      <div className="flex gap-2.5 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-16 bg-linen-3 rounded-xl" />
        ))}
      </div>
      <div className="h-[5px] bg-linen-3 rounded-full mb-4" />
      <div className="h-[400px] bg-linen-3 rounded-xl" />
    </div>
  );
}