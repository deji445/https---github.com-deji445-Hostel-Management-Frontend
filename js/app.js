const API_BASE = 'https://hostel-management-backend-m4cq.onrender.com/api'

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  // handle 204 No Content
  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    // pull out the server’s error/message field if set
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false
  });
}

async function register(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    auth: false
  });
}

window.request  = request;
window.login    = login;
window.register = register;
