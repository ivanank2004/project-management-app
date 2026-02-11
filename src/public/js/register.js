lucide.createIcons();

document.getElementById('currentYear').textContent =
    new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('email').focus();
});

/* ===============================
   TOGGLE PASSWORD
================================ */
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }

    lucide.createIcons();
}

/* ===============================
   ELEMENT REFERENCES
================================ */
const form = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');

const passwordInput = document.getElementById('password');
const passwordError = document.getElementById('password-error');

const confirmPasswordInput = document.getElementById('confirmPassword');
const confirmPasswordError = document.getElementById('confirm-password-error');

const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

const errorBox = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const successBox = document.getElementById('success');
const submitBtn = document.getElementById('submitBtn');

/* ===============================
   EMAIL VALIDATION
================================ */
emailInput.addEventListener('blur', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailInput.value && !emailRegex.test(emailInput.value)) {
        emailInput.classList.add('input-error', 'border-red-300');
        emailError.classList.remove('hidden');
        lucide.createIcons();
    } else {
        emailInput.classList.remove('input-error', 'border-red-300');
        emailError.classList.add('hidden');
    }
});

emailInput.addEventListener('input', () => {
    emailError.classList.add('hidden');
});

/* ===============================
   PASSWORD STRENGTH
================================ */
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
}

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);

    if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'password-strength bg-gray-200';
        strengthText.textContent = 'Minimal 6 karakter';
        strengthText.className = 'mt-1 text-xs text-gray-500';
    } else if (password.length < 6) {
        strengthBar.style.width = '25%';
        strengthBar.className = 'password-strength bg-red-500';
        strengthText.textContent = 'Password terlalu lemah';
        strengthText.className = 'mt-1 text-xs text-red-600';
    } else if (strength <= 2) {
        strengthBar.style.width = '50%';
        strengthBar.className = 'password-strength bg-yellow-500';
        strengthText.textContent = 'Password sedang';
        strengthText.className = 'mt-1 text-xs text-yellow-600';
    } else if (strength <= 4) {
        strengthBar.style.width = '75%';
        strengthBar.className = 'password-strength bg-blue-500';
        strengthText.textContent = 'Password kuat';
        strengthText.className = 'mt-1 text-xs text-blue-600';
    } else {
        strengthBar.style.width = '100%';
        strengthBar.className = 'password-strength bg-green-500';
        strengthText.textContent = 'Password sangat kuat';
        strengthText.className = 'mt-1 text-xs text-green-600';
    }

    passwordError.classList.add('hidden');

    if (confirmPasswordInput.value) {
        validateConfirmPassword();
    }
});

passwordInput.addEventListener('blur', () => {
    if (!passwordInput.value || passwordInput.value.length < 6) {
        passwordInput.classList.add('input-error', 'border-red-300');
        passwordError.classList.remove('hidden');
    } else {
        passwordInput.classList.remove('input-error', 'border-red-300');
        passwordError.classList.add('hidden');
    }
});

/* ===============================
   CONFIRM PASSWORD
================================ */
function validateConfirmPassword() {
    if (confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordInput.classList.add('input-error', 'border-red-300');
        confirmPasswordError.classList.remove('hidden');
        return false;
    } else {
        confirmPasswordInput.classList.remove('input-error', 'border-red-300');
        confirmPasswordError.classList.add('hidden');
        return true;
    }
}

confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
confirmPasswordInput.addEventListener('input', validateConfirmPassword);

/* ===============================
   FORM SUBMIT (FETCH API)
================================ */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Frontend validation
    if (!validateConfirmPassword()) return;
    if (password.length < 6) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Memproses...';

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server tidak mengembalikan response yang valid');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registrasi gagal');
        }

        // SUCCESS
        successBox.classList.remove('hidden');
        form.reset();

        strengthBar.style.width = '0%';
        strengthBar.className = 'password-strength bg-gray-200';
        strengthText.textContent = 'Minimal 6 karakter';

    } catch (err) {
        errorMessage.textContent = err.message;
        errorBox.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <i data-lucide="user-plus" class="w-4 h-4 inline mr-2"></i>
            Buat Akun
        `;
        lucide.createIcons();
    }
});