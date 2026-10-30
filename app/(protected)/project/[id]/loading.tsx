export default function ProjectLoading() {
  return (
    <>
      <nav className="border-b border-border px-4 py-2 flex items-center gap-3 shrink-0">
        <span className="font-serif text-base text-ink">XStitchTracker</span>
        <div className="flex-1" />
      </nav>
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 animate-pulse">
        <div className="flex gap-2 mb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-12 bg-linen-3 rounded-lg" />
          ))}
        </div>
        <div className="h-1 bg-linen-3 rounded-full mb-2" />
        <div className="h-8 w-48 bg-linen-3 rounded mb-3" />
        <div className="flex-1 h-[60vh] bg-linen-3 rounded-xl" />
      </div>
    </>
  );
}