export function checkAuth() {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    window.location.href = '/login';
  }
}