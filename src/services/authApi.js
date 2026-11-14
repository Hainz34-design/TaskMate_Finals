// Expo replaces this public URL from .env.local when bundling the app.
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
// Alisin ang trailing slash para maidugtong nang tama ang /auth/... paths.
const apiBaseUrl = configuredApiUrl ? configuredApiUrl.replace(/\/+$/, '') : '';

// Shared POST helper para hindi ulitin ang fetch at response handling.
async function post(path, payload) {
  if (!apiBaseUrl) {
    throw new Error('Set EXPO_PUBLIC_API_URL in the project .env.local file');
  }

  let response;
  // Ipadala ang fields bilang JSON; ang fetch failure ay ibig sabihing unreachable ang API.
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Cannot reach the TaskMate API. Check that the backend is running and the API URL is correct.');
  }

  // Ibalik ang server message kapag 4xx/5xx para maipakita ito sa form.
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'The request could not be completed');
  }

  return result;
}

// Ipadala ang name/email/password sa endpoint na gumagawa ng user record.
export function registerUser({ fullName, email, password }) {
  return post('/auth/register', { fullName, email, password });
}

// Ipadala ang email/password sa endpoint na nagva-verify ng existing account.
export function loginUser({ email, password }) {
  return post('/auth/login', { email, password });
}
