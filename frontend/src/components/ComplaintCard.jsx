function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] || 'U';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
}

export default function ComplaintCard({ complaint, dotClassName, active = false, onSelect }) {
  const clickable = typeof onSelect === 'function';
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect(complaint.id) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(complaint.id);
            }
          }
          : undefined
      }
      className={`group relative rounded-xl bg-white p-4 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? 'ring-purple-300' : 'ring-gray-100'
      } ${clickable ? 'cursor-pointer outline-none focus:ring-2 focus:ring-purple-200' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
            {initials(complaint.user)}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">{complaint.title}</div>
            {complaint.category || complaint.priority ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {complaint.block || complaint.room ? (
                  <span className="rounded-lg bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                    {complaint.block ? `Block ${complaint.block}` : 'Block'}{complaint.room ? ` • ${complaint.room}` : ''}
                  </span>
                ) : null}
                {complaint.category ? (
                  <span className="rounded-lg bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                    {complaint.category}
                  </span>
                ) : null}
                {complaint.priority ? (
                  <span className="rounded-lg bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                    {complaint.priority}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="mt-1 line-clamp-2 text-sm text-gray-600">{complaint.description}</div>
          </div>
        </div>

        <span className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${dotClassName}`} aria-hidden="true" />
      </div>
    </div>
  );
}
