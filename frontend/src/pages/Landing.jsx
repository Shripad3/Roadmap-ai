import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 lg:px-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Roadmap.ai</h1>
        </header>

        <main className="flex flex-1 items-center py-14">
          <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
            <section>
              <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                AI-powered planning
              </p>
              <h2 className="mt-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Turn big goals into clear, actionable tasks
              </h2>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Roadmap.ai helps you capture tasks, break them into subtasks with AI, and track progress from idea to done.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth?mode=signup"
                  className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/auth"
                  className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  I already have an account
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-semibold text-white">What you get</h3>
              <ul className="mt-5 space-y-4 text-sm text-slate-700">
                <li className="rounded-lg bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Smart AI breakdowns</p>
                  <p className="mt-1">Generate practical subtasks from a single task title and description.</p>
                </li>
                <li className="rounded-lg bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Organized workflow</p>
                  <p className="mt-1">Keep tasks and subtasks in one place with clean progress tracking.</p>
                </li>
                <li className="rounded-lg bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Secure account access</p>
                  <p className="mt-1">Sign in with email/password or Google.</p>
                </li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
