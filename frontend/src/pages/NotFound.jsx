export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">This route doesn’t exist.</p>

        <a
          href="/student/login"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
