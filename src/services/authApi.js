// this is authapi.js 
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const apiBaseUrl = configuredApiUrl ? configuredApiUrl.replace(/\/+$/, '') : '';

async function post(path, payload) {
  if (!apiBaseUrl) {
    throw new Error('Set EXPO_PUBLIC_API_URL in the project .env.local file');
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Cannot reach the TaskMate API. Check that the backend is running and the API URL is correct.');
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'The request could not be completed');
  }

  return result;
}

export function registerUser({ fullName, email, password }) {
  return post('/auth/register', { fullName, email, password });
}

export function loginUser({ email, password }) {
  return post('/auth/login', { email, password });
}
