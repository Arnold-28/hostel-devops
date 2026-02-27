import { useNavigate } from 'react-router-dom';
import { clearAuth, getStoredUser } from '../auth';

export default function Header({
  title = 'Maintenance System',
  subtitle = 'Report issues and track maintenance complaints',
  tabs,
  activeTab,
  onTabChange,
  primaryActionLabel = 'New Complaint',
  onPrimaryAction,
}) {
  const user = getStoredUser();
  const navigate = useNavigate();

  const onLogout = () => {
    clearAuth();
    navigate(user?.role === 'admin' ? '/admin/login' : '/student/login');
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-700"
            aria-hidden="true"
          >
            <path
              d="M8 6h12M8 10h12M8 14h8M4 6h.01M4 10h.01M4 14h.01M4 18h.01M8 18h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>

          {Array.isArray(tabs) && tabs.length > 0 ? (
            <div className="mt-3 inline-flex rounded-xl bg-gray-50 p-1 ring-1 ring-gray-100">
              {tabs.map((t) => {
                const isActive = t.key === activeTab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onTabChange?.(t.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="hidden items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 ring-1 ring-gray-100 sm:flex">
            <span className="font-semibold">{user.name || 'User'}</span>
            <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
              {user.role}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
        >
          Logout
        </button>

        {typeof onPrimaryAction === 'function' ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <span className="text-base leading-none">+</span>
            {primaryActionLabel}
          </button>
        ) : null}
      </div>
    </header>
  );
}
