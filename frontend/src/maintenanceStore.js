const KEY = 'hostelops_maintenance_complaints';

function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeComplaint(item) {
  if (!item || typeof item !== 'object') return null;

  const id = String(item.id || '').trim();
  if (!id) return null;

  return {
    id,
    status: item.status || 'Reported',
    visitStatus: item.visitStatus || 'Not Scheduled',
    visitDate: item.visitDate || '',
    preventiveCheckStatus: item.preventiveCheckStatus || 'Not Done',
    preventiveCheckDate: item.preventiveCheckDate || '',
    user: item.user || 'Student',
    title: item.title || '',
    description: item.description || '',
    category: item.category || 'Other',
    priority: item.priority || 'Medium',
    block: item.block || '',
    room: item.room || '',
    notes: item.notes || '',
  };
}

export function loadMaintenanceComplaints() {
  const raw = localStorage.getItem(KEY);
  const data = safeParseJson(raw, []);
  if (!Array.isArray(data)) return [];
  return data.map(normalizeComplaint).filter(Boolean);
}

export function saveMaintenanceComplaints(list) {
  const normalized = Array.isArray(list) ? list.map(normalizeComplaint).filter(Boolean) : [];
  localStorage.setItem(KEY, JSON.stringify(normalized));
}
