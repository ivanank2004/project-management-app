const form = document.getElementById('loginForm');
const errorBox = document.getElementById('error');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorBox.classList.add('hidden');
    errorMessage.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server tidak mengembalikan response yang valid');
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Email atau password salah');
        }

        window.location.href = '../projects-page';
    } catch (err) {
        errorMessage.textContent = err.message;
        errorBox.classList.remove('hidden');
    }
});