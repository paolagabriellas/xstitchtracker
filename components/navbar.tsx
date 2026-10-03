export function NavBar() {
  return (
    <nav className="border-b border-border px-4 py-3 flex items-center gap-4">
      <a href="/dashboard" className="font-serif text-lg">
        Cross Stitch Tracker
      </a>
      <div className="flex-1" />
      <form action="/auth/signout" method="post">
        <button type="submit" className="text-sm text-ink-3 hover:text-ink">
          Sign out
        </button>
      </form>
    </nav>
  );
}