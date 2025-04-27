// handle the registration form
document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();

  const name     = e.target.name.value.trim();
  const email    = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    // this will now return { message, token, user }
    const data = await register(name, email, password);
    localStorage.setItem('token', data.token);
    window.location = 'student.html';
  } catch (err) {
    document.getElementById('register-error').textContent = err.message;
  }
});

