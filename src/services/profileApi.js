const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const BASE = configuredApiUrl ? configuredApiUrl.replace(/\/+$/, '') : '';

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

export function fetchProfile(token) {
  return request('/profile', token);
}

// kind is 'avatar' (profile picture) or 'cover' (background rectangle)
export function saveProfileImage(token, kind, dataUri) {
  return request('/profile', token, {
    method: 'PUT',
    body: JSON.stringify({ [kind]: dataUri }),
  });
}
