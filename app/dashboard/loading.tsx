/**
 * Shown while a dashboard route's server data resolves. Every dashboard page
 * reads the authenticated user (cookies), so the routes are dynamic and a
 * navigation would otherwise block on the full server render with no feedback.
 * This boundary also lets <Link> prefetch the shell of each dashboard route.
 *
 * The pages share one shell — greeting header, a row of summary cards, a
 * toolbar, then a list — so a single neutral skeleton stands in for all of them.
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-8" aria-busy="true">
      <span className="sr-only">Loading…</span>

      <div className="flex animate-pulse flex-col gap-2">
        <div className="h-5 w-64 rounded bg-[#e7e5e4]" />
        <div className="h-3 w-80 rounded bg-[#e7e5e4]/70" />
      </div>

      <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-[#c2c8c4]/40 bg-white p-5"
          >
            <div className="h-3 w-24 rounded bg-[#e7e5e4]" />
            <div className="mt-4 h-5 w-32 rounded bg-[#e7e5e4]/70" />
          </div>
        ))}
      </div>

      <div className="h-16 animate-pulse rounded-xl border border-[#c2c8c4]/40 bg-white" />

      <div className="flex animate-pulse flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-[#c2c8c4]/40 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
