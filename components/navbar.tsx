interface NavBarProps {
  projectTitle?: string;
  onBack?: string;
}
export function NavBar({ projectTitle, onBack }: NavBarProps) {
  return (
    <nav className="border-b border-border px-4 py-2 flex items-center gap-3 shrink-0">

      {onBack ? (
        <>
          <a href={onBack} className="text-sm text-ink-3 hover:text-ink">← Back</a>
          <span className="font-serif text-base truncate">{projectTitle}</span>
        </>
      ) : (
        <a href="/dashboard" className="font-serif text-base">
          XStitchTracker
        </a>
      )}
      <div className="flex-1" />
      <form action="/auth/signout" method="post">
        <button type="submit" className="text-sm text-ink-3 hover:text-ink">
          Sign out
        </button>
      </form>
    </nav>

  );
}