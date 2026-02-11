// ===================================
// CONSOLIDATED TASKS.JS
// ===================================

// Initialize Lucide icons
lucide.createIcons();

// ===================================
// GLOBAL STATE & VARIABLES
// ===================================
let TASK_ID_TO_DELETE = null;

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Get project ID from URL
function getProjectIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/projects-page\/(\d+)/);
    return pathMatch ? pathMatch[1] : null;
}

// Get task ID from URL
function getTaskIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/tasks\/(\d+)/);
    return pathMatch ? pathMatch[1] : null;
}

// ===================================
// TASK LIST PAGE FUNCTIONS
// ===================================

function toggleTask(taskId, isCompleted) {
    const projectId = getProjectIdFromUrl();
    if (!projectId) {
        alert('Project ID tidak ditemukan');
        return;
    }

    const endpoint = isCompleted
        ? `/projects/${projectId}/tasks/${taskId}/complete`
        : `/projects/${projectId}/tasks/${taskId}/uncomplete`;

    fetch(endpoint, {
        method: 'PATCH',
    })
        .then(res => {
            if (!res.ok) throw new Error();

            const title = document.getElementById(`title-${taskId}`);
            const desc = document.getElementById(`desc-${taskId}`);
            const badge = document.getElementById(`badge-${taskId}`);
            const menu = document.getElementById(`menu-${taskId}`);

            title.classList.toggle('line-through', isCompleted);
            title.classList.toggle('text-gray-400', isCompleted);
            title.classList.toggle('text-gray-900', !isCompleted);

            if (desc) {
                desc.classList.toggle('line-through', isCompleted);
                desc.classList.toggle('text-gray-400', isCompleted);
            }

            badge.className = isCompleted
                ? 'text-xs px-3 py-1.5 rounded-full font-semibold bg-green-100 text-green-700'
                : 'text-xs px-3 py-1.5 rounded-full font-semibold bg-yellow-100 text-yellow-700';

            badge.innerHTML = `
                <i data-lucide="${isCompleted ? 'check-circle-2' : 'clock'}"
                   class="w-3 h-3 inline mr-1"></i>
                ${isCompleted ? 'Selesai' : 'Dalam Proses'}
            `;

            const editBtn = document.getElementById(`edit-${taskId}`);

            if (isCompleted && editBtn) {
                editBtn.remove();
            }

            if (!isCompleted && !editBtn) {
                const deleteBtn = menu.querySelector('button');

                const editLink = document.createElement('a');
                editLink.id = `edit-${taskId}`;
                editLink.href = `/projects-page/${projectId}/tasks/${taskId}/edit`;
                editLink.className =
                    'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50';
                editLink.innerHTML = `
                    <i data-lucide="edit" class="w-4 h-4"></i>
                    Edit
                `;

                menu.insertBefore(editLink, deleteBtn);
            }

            updateStats(isCompleted);
            lucide.createIcons();
        })
        .catch(() => alert('Gagal update task'));
}

function updateStats(isCompleted) {
    const totalEl = document.getElementById('totalTasks');
    const completedEl = document.getElementById('completedTasks');
    const pendingEl = document.getElementById('pendingTasks');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const progressCard = document.getElementById('progressCard');

    if (!totalEl || !completedEl || !pendingEl) return;

    const total = +totalEl.textContent;
    let completed = +completedEl.textContent;
    completed += isCompleted ? 1 : -1;

    completedEl.textContent = completed;
    pendingEl.textContent = total - completed;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (progressText) progressText.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressCard) progressCard.textContent = `${percent}%`;
}

function toggleMenu(taskId) {
    const menu = document.getElementById(`menu-${taskId}`);
    const allMenus = document.querySelectorAll('[id^="menu-"]');

    allMenus.forEach(m => {
        if (m !== menu) m.classList.add('hidden');
    });

    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function toggleDescription(taskId) {
    const wrap = document.getElementById(`desc-wrap-${taskId}`);
    if (!wrap) return;

    const isOpen = wrap.classList.contains('max-h-40');

    if (isOpen) {
        wrap.classList.remove('max-h-40', 'opacity-100');
        wrap.classList.add('max-h-0', 'opacity-0');
    } else {
        wrap.classList.remove('max-h-0', 'opacity-0');
        wrap.classList.add('max-h-40', 'opacity-100');
    }
}

function onTaskCardClick(event, taskId) {
    if (event.target.closest('[data-ignore-toggle]')) {
        return;
    }

    toggleDescription(taskId);
}

// ===================================
// DELETE TASK FUNCTIONS
// ===================================

function confirmDelete(taskId, taskTitle) {
    TASK_ID_TO_DELETE = taskId;
    const taskTitleEl = document.getElementById('taskTitle');
    const deleteModal = document.getElementById('deleteModal');

    if (taskTitleEl) taskTitleEl.textContent = taskTitle;
    if (deleteModal) deleteModal.classList.remove('hidden');
}

async function deleteTaskConfirmed() {
    if (!TASK_ID_TO_DELETE) return;

    const projectId = getProjectIdFromUrl();
    if (!projectId) {
        alert('Project ID tidak ditemukan');
        return;
    }

    try {
        const res = await fetch(
            `/projects/${projectId}/tasks/${TASK_ID_TO_DELETE}`,
            { method: 'DELETE' }
        );

        if (!res.ok) throw new Error();

        // Redirect with success message
        window.location.href =
            `/projects-page/${projectId}/tasks?success=task_deleted`;

    } catch (err) {
        console.error('Error deleting task:', err);
        alert('Gagal menghapus task');
    }
}

function closeDeleteModal() {
    TASK_ID_TO_DELETE = null;
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.classList.add('hidden');
}

function deleteTask(taskId) {
    const projectId = getProjectIdFromUrl();
    if (!projectId) {
        alert('Project ID tidak ditemukan');
        return;
    }

    fetch(`/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
    }).then(() => {
        window.location.reload();
    }).catch(() => {
        alert('Gagal menghapus task');
    });
}

// ===================================
// COMPLETE PROJECT FUNCTIONS
// ===================================

function confirmCompleteProject() {
    const totalEl = document.getElementById('totalTasks');
    const completedEl = document.getElementById('completedTasks');

    if (!totalEl || !completedEl) return;

    const total = Number(totalEl.textContent);
    const completed = Number(completedEl.textContent);
    const unfinished = total - completed;

    const modal = document.getElementById('completeProjectModal');
    const msg = document.getElementById('completeMessage');
    const iconWrap = document.getElementById('completeIcon');
    const icon = document.getElementById('completeIconSvg');

    if (!modal || !msg || !iconWrap || !icon) return;

    // Reset icon first (important for Lucide to detect)
    icon.removeAttribute('data-lucide');

    if (unfinished > 0) {
        iconWrap.className = 'p-2 bg-yellow-100 rounded-lg';
        icon.setAttribute('data-lucide', 'alert-triangle');

        msg.innerHTML = `
            Masih terdapat <b>${unfinished}</b> task yang belum selesai.
            <br><br>
            Apakah Anda yakin ingin tetap menyelesaikan project ini?
        `;
    } else {
        iconWrap.className = 'p-2 bg-green-100 rounded-lg';
        icon.setAttribute('data-lucide', 'check-circle-2');

        msg.textContent = 'Semua task sudah selesai. Selesaikan project ini?';
    }

    // Re-render icon
    lucide.createIcons();

    modal.classList.remove('hidden');
}

async function submitCompleteProject() {
    const projectId = getProjectIdFromUrl();
    if (!projectId) {
        alert('Project ID tidak ditemukan');
        return;
    }

    try {
        const res = await fetch(`/projects/${projectId}/complete`, {
            method: 'PATCH',
        });

        if (!res.ok) throw new Error();

        closeCompleteModal();

        const url = new URL(window.location);
        url.searchParams.set('success', 'project_completed');
        window.location.href = url.toString();

    } catch (err) {
        console.error('Error completing project:', err);
        alert('Gagal menyelesaikan project');
    }
}

function closeCompleteModal() {
    const modal = document.getElementById('completeProjectModal');
    if (modal) modal.classList.add('hidden');
}

// ===================================
// DELETE PROJECT FUNCTIONS
// ===================================

function confirmDeleteProject() {
    const modal = document.getElementById('deleteProjectModal');
    if (modal) modal.classList.remove('hidden');
}

function closeDeleteProjectModal() {
    const modal = document.getElementById('deleteProjectModal');
    if (modal) modal.classList.add('hidden');
}

function deleteProject() {
    const projectId = getProjectIdFromUrl();
    if (!projectId) {
        alert('Project ID tidak ditemukan');
        return;
    }

    fetch(`/projects/${projectId}`, {
        method: 'DELETE',
    }).then(() => {
        window.location.href = '/projects-page?success=project_deleted';
    }).catch(() => {
        alert('Gagal menghapus project');
    });
}

// ===================================
// CREATE TASK PAGE FUNCTIONS
// ===================================

function initCreateTaskPage() {
    const taskContainer = document.getElementById('taskContainer');
    const form = document.getElementById('taskForm');

    if (!taskContainer || !form) return;

    // Initialize Sortable
    if (typeof Sortable !== 'undefined') {
        new Sortable(taskContainer, {
            animation: 200,
            handle: '.drag-handle',
            ghostClass: 'bg-blue-50',
            onEnd: updateTaskNumbers,
        });
    }

    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectId = getProjectIdFromUrl();
        if (!projectId) {
            alert('Project ID tidak ditemukan');
            return;
        }

        const nama = [...document.querySelectorAll('input[name="nama[]"]')]
            .map(i => i.value.trim());

        const deskripsi = [...document.querySelectorAll('textarea[name="deskripsi[]"]')]
            .map(t => t.value.trim());

        if (nama.length === 0 || !nama.some(n => n !== '')) {
            alert('Minimal satu task harus diisi');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 inline mr-2 animate-spin"></i> Menyimpan...';
        lucide.createIcons();

        try {
            const res = await fetch(`/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nama, deskripsi }),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || 'Gagal menyimpan task');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                lucide.createIcons();
                return;
            }

            window.location.href =
                `/projects-page/${projectId}/tasks?success=task_created`;

        } catch (err) {
            console.error('Error creating tasks:', err);
            alert('Terjadi kesalahan koneksi');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            lucide.createIcons();
        }
    });
}

function addTask() {
    const taskContainer = document.getElementById('taskContainer');
    if (!taskContainer) return;

    const div = document.createElement('div');
    div.className = 'task-item border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-300 transition-all';

    div.innerHTML = `
        <div class="flex gap-4">
            <div class="drag-handle cursor-move pt-1 text-gray-400 hover:text-blue-600 transition-colors">
                <i data-lucide="grip-vertical" class="w-5 h-5"></i>
            </div>

            <div class="flex-1 relative">
                <button type="button"
                    class="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all z-10">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>

                <h4 class="text-sm font-bold text-gray-700 mb-3"></h4>

                <div class="space-y-3">
                    <div>
                        <label class="text-xs font-semibold text-gray-600 mb-1.5 block">Judul Task</label>
                        <input
                            type="text"
                            name="nama[]"
                            required
                            placeholder="Contoh: Setup database PostgreSQL"
                            class="input-focus w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-all hover:border-gray-300">
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi Task</label>
                        <textarea
                            name="deskripsi[]"
                            rows="2"
                            placeholder="Detail tambahan untuk task ini..."
                            class="input-focus w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm resize-none transition-all hover:border-gray-300"></textarea>
                    </div>
                </div>
            </div>
        </div>
    `;

    div.querySelector('button').addEventListener('click', () => {
        div.remove();
        updateTaskNumbers();
    });

    taskContainer.appendChild(div);
    updateTaskNumbers();
    lucide.createIcons();
    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateTaskNumbers() {
    document.querySelectorAll('.task-item h4').forEach((el, i) => {
        el.textContent = `Task #${i + 1}`;
    });
}

// ===================================
// EDIT TASK PAGE FUNCTIONS
// ===================================

function initEditTaskPage() {
    const form = document.getElementById('editTaskForm');
    if (!form) return;

    // Auto-focus on nama field
    const namaInput = document.getElementById('nama');
    if (namaInput) {
        namaInput.focus();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectId = getProjectIdFromUrl();
        const taskId = getTaskIdFromUrl();

        if (!projectId || !taskId) {
            alert('Project ID atau Task ID tidak ditemukan');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <i data-lucide="loader-2" class="w-4 h-4 inline mr-2 animate-spin"></i>
            Menyimpan...
        `;
        lucide.createIcons();

        const data = {
            nama: document.getElementById('nama').value,
            deskripsi: document.getElementById('deskripsi').value,
        };

        try {
            const res = await fetch(
                `/projects/${projectId}/tasks/${taskId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!res.ok) throw new Error();

            window.location.href =
                `/projects-page/${projectId}/tasks?success=task_updated`;

        } catch (err) {
            console.error('Error updating task:', err);
            alert('Gagal memperbarui task');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            lucide.createIcons();
        }
    });
}

// ===================================
// TOAST NOTIFICATION
// ===================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const msg = document.getElementById('successMessage');

    if (!toast || !msg) return;

    if (type === 'success') {
        toast.classList.remove('bg-red-600');
        toast.classList.add('bg-green-600');
    } else {
        toast.classList.remove('bg-green-600');
        toast.classList.add('bg-red-600');
    }

    msg.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);

    lucide.createIcons();
}

// ===================================
// EVENT LISTENERS
// ===================================

function initEventListeners() {
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[onclick^="toggleMenu"]') &&
            !e.target.closest('[id^="menu-"]')) {
            document.querySelectorAll('[id^="menu-"]').forEach(m => {
                m.classList.add('hidden');
            });
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key - close modals
        if (e.key === 'Escape') {
            closeDeleteModal();
            closeCompleteModal();
            closeDeleteProjectModal();
        }

        // Ctrl/Cmd + K - add task (on create page)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            const taskContainer = document.getElementById('taskContainer');
            if (taskContainer) {
                e.preventDefault();
                addTask();
            }
        }
    });
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    initEventListeners();

    initCreateTaskPage();
    initEditTaskPage();

    const successMessages = {
        project_created: 'Project berhasil dibuat',
        project_updated: 'Project berhasil diperbarui',
        project_deleted: 'Project berhasil dihapus',
        project_completed: 'Project berhasil diselesaikan',
        task_created: 'Task berhasil ditambahkan',
        task_updated: 'Task berhasil diperbarui',
        task_deleted: 'Task berhasil dihapus 🗑️',
    };

    const params = new URLSearchParams(window.location.search);
    const successKey = params.get('success');

    if (successKey && successMessages[successKey]) {
        showToast(successMessages[successKey], 'success');

        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }
});