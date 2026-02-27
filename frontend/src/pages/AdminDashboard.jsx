import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import { loadMaintenanceComplaints, saveMaintenanceComplaints } from '../maintenanceStore.js';

function badgeTone(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('high')) return 'bg-red-50 text-red-700 ring-red-100';
  if (v.includes('medium')) return 'bg-amber-50 text-amber-800 ring-amber-100';
  if (v.includes('low')) return 'bg-gray-50 text-gray-700 ring-gray-200';
  if (v.includes('completed')) return 'bg-green-50 text-green-700 ring-green-100';
  if (v.includes('progress')) return 'bg-amber-50 text-amber-800 ring-amber-100';
  if (v.includes('reported')) return 'bg-blue-50 text-blue-700 ring-blue-100';
  if (v.includes('visited')) return 'bg-green-50 text-green-700 ring-green-100';
  if (v.includes('scheduled')) return 'bg-purple-50 text-purple-700 ring-purple-100';
  return 'bg-gray-50 text-gray-700 ring-gray-200';
}

function getDisplayStatus(ticket) {
  if (!ticket) return 'Reported';
  if (ticket.status === 'Completed') return 'Completed';
  if (ticket.status === 'In Progress') return 'In Progress';
  if (ticket.visitStatus === 'Visited') return 'Visited';
  if (ticket.visitStatus === 'Scheduled') return 'Scheduled';
  return 'Reported';
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    setTickets(loadMaintenanceComplaints());
  }, []);

  useEffect(() => {
    if (tickets.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId) {
      setSelectedId(tickets[0].id);
      return;
    }

    const stillExists = tickets.some((t) => t.id === selectedId);
    if (!stillExists) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'hostelops_maintenance_complaints') {
        setTickets(loadMaintenanceComplaints());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const selected = useMemo(() => tickets.find((t) => t.id === selectedId) || null, [tickets, selectedId]);

  useEffect(() => {
    setScheduleError('');
    setScheduleDate(selected?.visitDate || '');
  }, [selected?.id]);

  const stats = useMemo(() => {
    const reported = tickets.filter((t) => t.status === 'Reported').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const completed = tickets.filter((t) => t.status === 'Completed').length;
    const scheduled = tickets.filter((t) => t.visitStatus === 'Scheduled').length;
    return { reported, inProgress, completed, scheduled, total: tickets.length };
  }, [tickets]);

  const updateTicket = (id, patch) => {
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
      saveMaintenanceComplaints(next);
      return next;
    });
  };

  const onScheduleVisit = (id) => {
    if (id !== selectedId) {
      setSelectedId(id);
      return;
    }

    setScheduleError('');
    const date = String(scheduleDate || '').trim();
    if (!date) {
      setScheduleError('Choose a date to schedule the visit.');
      return;
    }

    updateTicket(id, { visitStatus: 'Scheduled', visitDate: date });
  };
  const onMarkVisited = (id) => updateTicket(id, { visitStatus: 'Visited' });
  const onStartRepair = (id) => updateTicket(id, { status: 'In Progress' });
  const onComplete = (id) => updateTicket(id, { status: 'Completed' });
  const onPreventiveCheckDone = (id) => {
    const today = new Date().toISOString().slice(0, 10);
    updateTicket(id, { preventiveCheckStatus: 'Done', preventiveCheckDate: today });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
        <Header
          title="Admin Maintenance Desk"
          subtitle="Review complaints, visit rooms, and manage repairs"
        />

        <main className="px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="rounded-2xl bg-gradient-to-b from-purple-50 to-pink-50 p-5 ring-1 ring-purple-100 md:col-span-2">
              <div className="text-xs font-semibold text-purple-700">TOTAL COMPLAINTS</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</div>
              <div className="mt-1 text-sm text-gray-600">Maintenance complaints tracked</div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
              <div className="text-xs font-semibold text-gray-700">REPORTED</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.reported}</div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
              <div className="text-xs font-semibold text-gray-700">IN PROGRESS</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.inProgress}</div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
              <div className="text-xs font-semibold text-gray-700">VISITS SCHEDULED</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.scheduled}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Complaints</h2>
                <p className="mt-1 text-sm text-gray-600">Click a complaint to see details and actions.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-700">
                      <th className="px-5 py-3">Complaint</th>
                      <th className="px-5 py-3">Room</th>
                      <th className="px-5 py-3">Priority</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Visit Date</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((t) => {
                      const active = t.id === selectedId;
                      const displayStatus = getDisplayStatus(t);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedId(t.id)}
                          className={
                            `cursor-pointer align-top transition ${active ? 'bg-purple-50/40' : 'hover:bg-gray-50'}`
                          }
                        >
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-gray-900">{t.title}</div>
                            <div className="mt-1 text-sm text-gray-600">{t.user}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-gray-900">Block {t.block}</div>
                            <div className="mt-1 text-sm text-gray-600">{t.room}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${badgeTone(t.priority)}`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${badgeTone(
                                displayStatus
                              )}`}
                            >
                              {displayStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {t.visitStatus === 'Scheduled' && t.visitDate ? t.visitDate : '—'}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => onScheduleVisit(t.id)}
                                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                              >
                                Schedule Visit
                              </button>
                              <button
                                type="button"
                                onClick={() => onMarkVisited(t.id)}
                                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                              >
                                Mark Visited
                              </button>
                              <button
                                type="button"
                                onClick={() => onStartRepair(t.id)}
                                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                              >
                                Start Repair
                              </button>
                              <button
                                type="button"
                                onClick={() => onComplete(t.id)}
                                className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700"
                              >
                                Complete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {tickets.length === 0 ? (
                      <tr>
                        <td className="px-5 py-6 text-sm text-gray-600" colSpan={6}>
                          No complaints yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Room Visit & Repair</h2>
              {selected ? (
                <>
                  <div className="mt-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
                    <div className="text-xs font-semibold text-gray-700">TITLE</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">{selected.title}</div>
                    <div className="mt-2 text-xs font-semibold text-gray-700">REPORTED BY</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">{selected.user}</div>
                    <div className="mt-2 text-xs font-semibold text-gray-700">LOCATION</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">Block {selected.block} • {selected.room}</div>
                    <div className="mt-2 text-xs font-semibold text-gray-700">CURRENT</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${badgeTone(
                          getDisplayStatus(selected)
                        )}`}
                      >
                        {getDisplayStatus(selected)}
                      </span>
                      {getDisplayStatus(selected) === 'Scheduled' && selected.visitDate ? (
                        <span className="text-xs font-semibold text-gray-600">{selected.visitDate}</span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.category ? (
                        <span className="inline-flex rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                          {selected.category}
                        </span>
                      ) : null}
                      {selected.priority ? (
                        <span className="inline-flex rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                          Priority: {selected.priority}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-900">Complaint</div>
                    <div className="mt-1 text-sm text-gray-600">{selected.description}</div>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
                    <div className="text-xs font-semibold text-gray-700">PREVENTIVE CHECK</div>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {selected.preventiveCheckStatus || 'Not Done'}
                        {selected.preventiveCheckStatus === 'Done' && selected.preventiveCheckDate ? (
                          <span className="ml-2 text-sm font-semibold text-gray-600">({selected.preventiveCheckDate})</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => onPreventiveCheckDone(selected.id)}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-900">Scheduled Visit Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => {
                        setScheduleError('');
                        setScheduleDate(e.target.value);
                      }}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                    {scheduleError ? (
                      <div className="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
                        {scheduleError}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-900">Repair Notes</label>
                    <textarea
                      rows={6}
                      value={selected.notes || ''}
                      onChange={(e) => updateTicket(selected.id, { notes: e.target.value })}
                      placeholder="Add what you observed during the room visit, parts needed, repair steps..."
                      className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => onScheduleVisit(selected.id)}
                      className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                    >
                      Schedule Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkVisited(selected.id)}
                      className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                    >
                      Visit Room
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartRepair(selected.id)}
                      className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                    >
                      Start Repair
                    </button>
                    <button
                      type="button"
                      onClick={() => onComplete(selected.id)}
                      className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                    >
                      Mark Completed
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-sm text-gray-600">Select a complaint to manage a room visit.</div>
              )}

            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
