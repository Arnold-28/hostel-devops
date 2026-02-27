import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Column from '../components/Column.jsx';
import CreateComplaintModal from '../components/CreateComplaintModal.jsx';
import { getStoredUser } from '../auth';
import { loadMaintenanceComplaints, saveMaintenanceComplaints } from '../maintenanceStore.js';

const TABS = [
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'clean', label: 'Cleanliness' },
  { key: 'food', label: 'Food Review' },
];

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState('maintenance');
  const [maintenanceComplaints, setMaintenanceComplaints] = useState([]);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
  const [cleanlinessComplaints, setCleanlinessComplaints] = useState([]);
  const [foodReviews, setFoodReviews] = useState([]);

  const user = getStoredUser();

  useEffect(() => {
    setMaintenanceComplaints(loadMaintenanceComplaints());
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'hostelops_maintenance_complaints') {
        setMaintenanceComplaints(loadMaintenanceComplaints());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (section !== 'maintenance') return;
    if (maintenanceComplaints.length === 0) {
      setSelectedMaintenanceId(null);
      return;
    }
    if (!selectedMaintenanceId) {
      setSelectedMaintenanceId(maintenanceComplaints[0].id);
      return;
    }
    const stillExists = maintenanceComplaints.some((c) => c.id === selectedMaintenanceId);
    if (!stillExists) setSelectedMaintenanceId(maintenanceComplaints[0].id);
  }, [maintenanceComplaints, selectedMaintenanceId, section]);

  const selectedMaintenance = useMemo(
    () => maintenanceComplaints.find((c) => c.id === selectedMaintenanceId) || null,
    [maintenanceComplaints, selectedMaintenanceId]
  );

  const getDisplayStatus = (c) => {
    if (!c) return 'Reported';
    if (c.status === 'Completed') return 'Completed';
    if (c.status === 'In Progress') return 'In Progress';
    if (c.visitStatus === 'Visited') return 'Visited';
    if (c.visitStatus === 'Scheduled') return 'Scheduled';
    return 'Reported';
  };

  const maintenanceColumns = useMemo(() => {
    const reported = maintenanceComplaints.filter((c) => c.status === 'Reported');
    const inProgress = maintenanceComplaints.filter((c) => c.status === 'In Progress');
    const completed = maintenanceComplaints.filter((c) => c.status === 'Completed');

    return { reported, inProgress, completed };
  }, [maintenanceComplaints]);

  const stats = useMemo(() => {
    if (section === 'maintenance') {
      const total = maintenanceComplaints.length;
      const openCount = maintenanceComplaints.filter((t) => t.status !== 'Completed').length;
      const highPriority = maintenanceComplaints.filter((t) => String(t.priority).toLowerCase() === 'high').length;
      return { aLabel: 'OPEN COMPLAINTS', aValue: openCount, aHint: 'Needs attention by maintenance', bLabel: 'HIGH PRIORITY', bValue: highPriority, bHint: 'Prioritize safety and outages', cLabel: 'TOTAL COMPLAINTS', cValue: total, cHint: `Signed in as ${user?.role || ''}` };
    }

    if (section === 'clean') {
      const today = '2026-02-27';
      const todayCount = cleanlinessComplaints.filter((c) => c.date === today).length;
      const avgRating = Math.round(
        (cleanlinessComplaints.reduce((sum, c) => sum + (Number(c.rating) || 0), 0) / Math.max(cleanlinessComplaints.length, 1)) *
          10
      ) / 10;
      const openCount = cleanlinessComplaints.filter((c) => c.status === 'Open').length;
      return { aLabel: "TODAY'S COMPLAINTS", aValue: todayCount, aHint: 'Day-to-day cleaning feedback', bLabel: 'OPEN ITEMS', bValue: openCount, bHint: 'Needs cleaning action', cLabel: 'AVG RATING', cValue: avgRating, cHint: 'Overall cleanliness score' };
    }

    const today = '2026-02-27';
    const todayCount = foodReviews.filter((c) => c.date === today).length;
    const avgRating = Math.round(
      (foodReviews.reduce((sum, c) => sum + (Number(c.rating) || 0), 0) / Math.max(foodReviews.length, 1)) * 10
    ) / 10;
    const lowCount = foodReviews.filter((c) => Number(c.rating) <= 2).length;
    return { aLabel: "TODAY'S REVIEWS", aValue: todayCount, aHint: 'Day-to-day food feedback', bLabel: 'LOW RATINGS', bValue: lowCount, bHint: 'Items to improve quickly', cLabel: 'AVG RATING', cValue: avgRating, cHint: 'Overall food score' };
  }, [section, maintenanceComplaints, cleanlinessComplaints, foodReviews, user?.role]);

  const onCreateComplaint = (payload) => {
    const id = `c_${Date.now()}`;
    const createdBy = user?.name || 'Student';

    if (section === 'maintenance') {
      const { title, description, category, priority, block, room } = payload;
      setMaintenanceComplaints((prev) => {
        const next = [
          {
            id,
            status: 'Reported',
            visitStatus: 'Not Scheduled',
            visitDate: '',
            preventiveCheckStatus: 'Not Done',
            preventiveCheckDate: '',
            user: createdBy,
            title,
            description,
            category,
            priority,
            block,
            room,
            notes: '',
          },
          ...prev,
        ];
        saveMaintenanceComplaints(next);
        return next;
      });
      return;
    }

    if (section === 'clean') {
      const { date, area, description, block, room, rating } = payload;
      setCleanlinessComplaints((prev) => [
        {
          id,
          date,
          user: createdBy,
          area,
          block,
          room,
          rating: Number(rating) || 3,
          description,
          status: 'Open',
        },
        ...prev,
      ]);
      return;
    }

    const { date, meal, description, rating } = payload;
    setFoodReviews((prev) => [
      {
        id,
        date,
        user: createdBy,
        meal,
        rating: Number(rating) || 3,
        description,
      },
      ...prev,
    ]);
  };

  const actionLabel = section === 'maintenance'
    ? 'New Complaint'
    : section === 'clean'
      ? 'New Cleanliness Complaint'
      : 'New Food Review';

  const headerSubtitle = section === 'maintenance'
    ? 'Maintenance complaints'
    : section === 'clean'
      ? 'Day-to-day cleanliness complaints'
      : 'Day-to-day food reviews';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
        <Header
          title="Maintenance System"
          subtitle={headerSubtitle}
          tabs={TABS}
          activeTab={section}
          onTabChange={setSection}
          onPrimaryAction={() => setOpen(true)}
          primaryActionLabel={actionLabel}
        />

        <main className="px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-b from-purple-50 to-pink-50 p-5 ring-1 ring-purple-100">
              <div className="text-xs font-semibold text-purple-700">{stats.aLabel}</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.aValue}</div>
              <div className="mt-1 text-sm text-gray-600">{stats.aHint}</div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
              <div className="text-xs font-semibold text-gray-700">{stats.bLabel}</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.bValue}</div>
              <div className="mt-1 text-sm text-gray-600">{stats.bHint}</div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
              <div className="text-xs font-semibold text-gray-700">{stats.cLabel}</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.cValue}</div>
              <div className="mt-1 text-sm text-gray-600">{stats.cHint}</div>
            </div>
          </div>

          {section === 'maintenance' ? (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Column
                  title="Reported"
                  headerClassName="bg-blue-600"
                  dotClassName="bg-blue-500"
                  complaints={maintenanceColumns.reported}
                  selectedId={selectedMaintenanceId}
                  onSelectComplaint={setSelectedMaintenanceId}
                />

                <Column
                  title="In Progress"
                  headerClassName="bg-amber-500"
                  dotClassName="bg-amber-500"
                  complaints={maintenanceColumns.inProgress}
                  selectedId={selectedMaintenanceId}
                  onSelectComplaint={setSelectedMaintenanceId}
                />

                <Column
                  title="Completed"
                  headerClassName="bg-green-600"
                  dotClassName="bg-green-500"
                  complaints={maintenanceColumns.completed}
                  selectedId={selectedMaintenanceId}
                  onSelectComplaint={setSelectedMaintenanceId}
                />
              </div>

              <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Complaint Details</h2>
                {selectedMaintenance ? (
                  <>
                    <div className="mt-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
                      <div className="text-xs font-semibold text-gray-700">TITLE</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">{selectedMaintenance.title}</div>
                      <div className="mt-2 text-xs font-semibold text-gray-700">LOCATION</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        Block {selectedMaintenance.block} • {selectedMaintenance.room}
                      </div>
                      <div className="mt-2 text-xs font-semibold text-gray-700">STATUS</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                          {getDisplayStatus(selectedMaintenance)}
                        </span>
                        {getDisplayStatus(selectedMaintenance) === 'Scheduled' && selectedMaintenance.visitDate ? (
                          <span className="text-xs font-semibold text-gray-600">{selectedMaintenance.visitDate}</span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedMaintenance.category ? (
                          <span className="inline-flex rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                            {selectedMaintenance.category}
                          </span>
                        ) : null}
                        {selectedMaintenance.priority ? (
                          <span className="inline-flex rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                            Priority: {selectedMaintenance.priority}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-900">Complaint</div>
                      <div className="mt-1 text-sm text-gray-700">{selectedMaintenance.description}</div>
                    </div>

                    {selectedMaintenance.notes ? (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-900">Admin Notes</div>
                        <div className="mt-1 text-sm text-gray-700">{selectedMaintenance.notes}</div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-3 text-sm text-gray-600">Click any complaint card to view its details.</div>
                )}
              </aside>
            </div>
          ) : section === 'clean' ? (
            <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Daily Cleanliness Complaints</h2>
                <p className="mt-1 text-sm text-gray-600">Day-to-day issues about cleaning quality.</p>
              </div>

              <div className="divide-y divide-gray-100">
                {cleanlinessComplaints.map((c) => (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{c.area}</div>
                        <div className="mt-1 text-sm text-gray-600">
                          {c.date} • Block {c.block} • {c.room} • {c.user}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                          Rating: {c.rating}/5
                        </span>
                        <span className={`rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${c.status === 'Open' ? 'bg-amber-50 text-amber-800 ring-amber-100' : 'bg-green-50 text-green-700 ring-green-100'}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{c.description}</div>
                  </div>
                ))}

                {cleanlinessComplaints.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-gray-600">No complaints yet.</div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Daily Food Reviews</h2>
                <p className="mt-1 text-sm text-gray-600">Day-to-day meal feedback from students.</p>
              </div>

              <div className="divide-y divide-gray-100">
                {foodReviews.map((c) => (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{c.meal}</div>
                        <div className="mt-1 text-sm text-gray-600">{c.date} • {c.user}</div>
                      </div>
                      <span className="rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        Rating: {c.rating}/5
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{c.description}</div>
                  </div>
                ))}

                {foodReviews.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-gray-600">No reviews yet.</div>
                ) : null}
              </div>
            </div>
          )}

        </main>
      </div>

      <CreateComplaintModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={onCreateComplaint}
        mode={section}
      />
    </div>
  );
}
