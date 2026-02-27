import ComplaintCard from './ComplaintCard.jsx';

export default function Column({ title, headerClassName, dotClassName, complaints, selectedId, onSelectComplaint }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className={`px-5 py-4 ${headerClassName}`}>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <div className="mt-1 text-xs text-white/80">{complaints.length} items</div>
      </div>

      <div className="space-y-3 p-4">
        {complaints.map((complaint) => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
            dotClassName={dotClassName}
            active={selectedId === complaint.id}
            onSelect={onSelectComplaint}
          />
        ))}

        {complaints.length === 0 ? (
          <div className="rounded-xl bg-gray-50 px-4 py-5 text-sm text-gray-600 ring-1 ring-gray-100">
            No items here yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
