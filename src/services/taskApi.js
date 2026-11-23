const BASE = process.env.EXPO_PUBLIC_API_URL;

const PRIORITY_STYLES = {
  HIGH: { color: '#ff6262', bg: 'rgba(255,98,98,0.12)' },
  MEDIUM: { color: '#ffae00', bg: 'rgba(255,174,0,0.12)' },
  LOW: { color: '#4cd964', bg: 'rgba(76,217,100,0.12)' },
};

// Turns a MongoDB task into the shape your screens already use.
const normalize = (t) => ({
  ...t,
  id: t._id,
  priority: { label: t.priority, ...PRIORITY_STYLES[t.priority] },
});

async function request(path, token, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    throw new Error('Cannot reach the TaskMate API.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

export async function fetchTasks(token) {
  const data = await request('/tasks', token);
  return data.map(normalize);
}

export async function createTask(token, task) {
  const data = await request('/tasks', token, {
    method: 'POST',
    body: JSON.stringify({ ...task, priority: task.priority.label }),
  });
  return normalize(data);
}

export async function updateTask(token, id, changes) {
  const data = await request(`/tasks/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
  return normalize(data);
}

export async function deleteTask(token, id) {
  await request(`/tasks/${id}`, token, { method: 'DELETE' });
}
