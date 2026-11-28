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

const send = (method, path, token, body) =>
  request(path, token, { method, body: JSON.stringify(body) });

export const getAccount = (token) => request('/account', token);

export const changeName = (token, fullName) => send('PATCH', '/account/name', token, { fullName });

export const changeEmail = (token, email, password) =>
  send('PATCH', '/account/email', token, { email, password });

// Contact number is optional. Pass '' to remove it.
export const changePhone = (token, phone) => send('PATCH', '/account/phone', token, { phone });

export const changePassword = (token, currentPassword, newPassword) =>
  send('PATCH', '/account/password', token, { currentPassword, newPassword });

export const deleteAccount = (token, password) => send('DELETE', '/account', token, { password });