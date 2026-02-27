import { useEffect, useMemo, useState } from 'react';

const CATEGORIES = ['Electricity', 'Plumbing', 'Internet', 'Cleanliness', 'Security', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

export default function CreateComplaintModal({ open, onClose, onCreate, mode = 'maintenance' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [block, setBlock] = useState('B');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('2026-02-27');
  const [area, setArea] = useState('');
  const [meal, setMeal] = useState(MEALS[1]);
  const [rating, setRating] = useState('3');

  const canSubmit = useMemo(() => {
    if (!title.trim() || !description.trim()) return false;
    if (mode === 'clean') return Boolean(date.trim() && area.trim());
    if (mode === 'food') return Boolean(date.trim() && meal.trim());
    return true;
  }, [title, description, date, area, meal, mode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setPriority(PRIORITIES[1]);
    setBlock('B');
    setRoom('');
    setDate('2026-02-27');
    setArea('');
    setMeal(MEALS[1]);
    setRating('3');
  }, [open]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Dummy-only UI: no backend calls.
    if (typeof onCreate === 'function') {
      if (mode === 'clean') {
        onCreate({
          title: title.trim(),
          description: description.trim(),
          date: date.trim(),
          area: area.trim(),
          rating,
          block: block.trim(),
          room: room.trim(),
        });
      } else if (mode === 'food') {
        onCreate({
          title: title.trim(),
          description: description.trim(),
          date: date.trim(),
          meal,
          rating,
        });
      } else {
        onCreate({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          block: block.trim(),
          room: room.trim(),
        });
      }
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Create a new Complaint"
    >
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-gradient-to-b from-purple-50 to-pink-50 shadow-xl ring-1 ring-purple-100">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'clean' ? 'Create a Cleanliness Complaint' : mode === 'food' ? 'Create a Food Review' : 'Create a Maintenance Complaint'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {mode === 'food'
                  ? 'Share your day-to-day feedback about meals.'
                  : 'Add details so the team can take action quickly.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-white/70 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {mode === 'food' ? 'Review Title' : 'Complaint Title'}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  mode === 'clean'
                    ? 'e.g., Washroom not cleaned today'
                    : mode === 'food'
                      ? 'e.g., Lunch quality feedback'
                      : 'e.g., Power outage in Block A'
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={mode === 'food' ? 'Write your day-to-day review...' : 'Add a short description of the issue...'}
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {mode !== 'maintenance' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              ) : null}

              {mode === 'food' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700">Meal</label>
                  <select
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  >
                    {MEALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              ) : mode === 'clean' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700">Area</label>
                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., Washroom / Corridor"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mode !== 'food' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Block</label>
                    <input
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="e.g., B"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Room / Location</label>
                    <input
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="e.g., 204"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </>
              ) : null}

              {mode !== 'maintenance' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={String(r)}>
                        {r} / 5
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-2 flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
                    {PRIORITIES.map((p) => {
                      const active = p === priority;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            active
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === 'food' ? 'Submit Review' : 'Submit Complaint'}
            </button>

            <div className="text-xs text-gray-500">
              {mode === 'maintenance' ? (
                <>
                  Selected: <span className="font-medium">{category}</span> •{' '}
                  <span className="font-medium">{priority}</span>
                </>
              ) : (
                <>
                  Selected: <span className="font-medium">{date}</span> •{' '}
                  <span className="font-medium">Rating {rating}/5</span>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
