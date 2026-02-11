// ===================================
// CONSOLIDATED PROJECT.JS
// ===================================

// Initialize Lucide icons
lucide.createIcons();

// ===================================
// GLOBAL STATE & VARIABLES
// ===================================
let allProjects = [];
let filtered = [];
let currentPage = 1;
let perPage = 10;
let sortState = {};

// ===================================
// AUTHENTICATION
// ===================================
async function logout() {
    try {
        const res = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        const json = await res.json();

        if (json.status === 'success') {
            window.location.href = '/login';
        } else {
            showToast(json.message || 'Gagal logout', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Gagal logout', 'error');
    }
}

// ===================================
// PROJECT LIST FUNCTIONS
// ===================================

// Load projects
async function loadProjects() {
    try {
        const res = await fetch('/projects');
        const json = await res.json();
        allProjects = json.data || [];
        filtered = [...allProjects];

        updateStats();
        render();
    } catch (error) {
        console.error('Error loading projects:', error);
        showToast('Gagal memuat data project', 'error');
    }
}

// Update stats
function updateStats() {
    const total = allProjects.length;
    const completed = allProjects.filter(p => p.isCompleted).length;
    const inProgress = total - completed;

    const totalEl = document.getElementById('totalProjects');
    const completedEl = document.getElementById('completedProjects');
    const inProgressEl = document.getElementById('inProgressProjects');

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (inProgressEl) inProgressEl.textContent = inProgress;

    // Show/hide sections based on whether there are projects
    const isEmpty = total === 0;
    const emptyState = document.getElementById('emptyState');
    const searchSection = document.getElementById('searchSection');

    if (emptyState) emptyState.classList.toggle('hidden', !isEmpty);
    if (searchSection) searchSection.classList.toggle('hidden', isEmpty);
}

// Helper to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render projects
function render() {
    const total = filtered.length;
    const isAll = perPage === 'all';
    const pageCount = isAll ? 1 : Math.ceil(total / perPage);

    if (currentPage > pageCount) currentPage = Math.max(1, pageCount);

    const start = isAll ? 0 : (currentPage - 1) * perPage;
    const end = isAll ? total : Math.min(start + perPage, total);

    const visible = filtered.slice(start, end);

    const desktopTable = document.getElementById('desktopTable');
    const mobileList = document.getElementById('mobileList');

    if (total === 0) {
        if (desktopTable) desktopTable.classList.add('hidden');
        if (mobileList) mobileList.classList.add('hidden');
    } else {
        if (desktopTable) renderDesktopTable(visible, start);
        if (mobileList) renderMobileCards(visible);
    }

    updatePaginationBar(total, start, end, pageCount);
    updateSearchInfo();
    lucide.createIcons();
}

function renderDesktopTable(visible, start) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    visible.forEach((project, idx) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors cursor-pointer';
        row.onclick = () => viewProject(project.id);

        row.innerHTML = `
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-mono font-semibold text-gray-700">
                    ${start + idx + 1}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-50 rounded-lg">
                        <i data-lucide="folder" class="w-4 h-4 text-blue-600"></i>
                    </div>
                    <span class="font-semibold text-gray-900">${escapeHtml(project.nama)}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <p class="text-sm text-gray-600 max-w-md truncate">${escapeHtml(project.deskripsi || 'Tidak ada deskripsi')}</p>
            </td>
            <td class="px-6 py-4">
                <span class="text-xs px-3 py-1.5 rounded-full font-semibold ${project.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    <i data-lucide="${project.isCompleted ? 'check-circle-2' : 'clock'}" class="w-3 h-3 inline mr-1"></i>
                    ${project.isCompleted ? 'Selesai' : 'Proses'}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    ${createActionButtons(project)}
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function renderMobileCards(visible) {
    const mobileList = document.getElementById('mobileList');
    if (!mobileList) return;

    mobileList.innerHTML = '';

    visible.forEach(project => {
        const card = document.createElement('div');
        card.className = 'card-hover bg-white rounded-xl shadow-md border border-gray-100 p-5 cursor-pointer';
        card.onclick = () => viewProject(project.id);

        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="p-2 bg-blue-50 rounded-lg shrink-0">
                        <i data-lucide="folder" class="w-5 h-5 text-blue-600"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h3 class="font-semibold text-gray-900 truncate">${escapeHtml(project.nama)}</h3>
                        <div class="flex flex-wrap gap-1.5 mt-1">
                            <span class="inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold ${project.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                                <i data-lucide="${project.isCompleted ? 'check-circle-2' : 'clock'}" class="w-3 h-3 mr-1"></i>
                                ${project.isCompleted ? 'Selesai' : 'Dalam Proses'}
                            </span>
                            <span class="inline-block px-2 py-1 rounded bg-gray-100 text-xs font-mono font-semibold text-gray-700">
                                #${project.id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">${escapeHtml(project.deskripsi || 'Tidak ada deskripsi')}</p>
            <div class="flex flex-wrap gap-2">
                ${createMobileActionButtons(project)}
            </div>
        `;

        mobileList.appendChild(card);
    });
}

function createActionButtons(project) {
    return `
        <div class="dropdown">
            <button onclick="event.stopPropagation(); toggleMenu(this)"
                class="p-2 rounded-lg hover:bg-gray-100 transition">
                <i data-lucide="more-vertical" class="w-5 h-5"></i>
            </button>

            <div class="dropdown-menu hidden w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-left">
                ${!project.isCompleted ? `
                    <a href="/projects-page/${project.id}/edit"
                       onclick="event.stopPropagation()"
                       class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Edit
                    </a>
                ` : ''}

                ${!project.isCompleted ? `
                    <button onclick="event.stopPropagation(); completeProject(${project.id})"
                        class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                        Selesaikan
                    </button>
                ` : `
                    <button onclick="event.stopPropagation(); uncompleteProject(${project.id})"
                        class="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
                        Batalkan
                    </button>
                `}

                <button onclick="event.stopPropagation(); confirmDeleteProject(${project.id}, '${escapeHtml(project.nama).replace(/'/g, "\\'")}')"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Hapus
                </button>
            </div>
        </div>
    `;
}

function createMobileActionButtons(project) {
    const buttons = [];

    if (!project.isCompleted) {
        buttons.push(`
            <button onclick="event.stopPropagation(); completeProject(${project.id})"
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-600 transition-all hover:bg-green-100 active:scale-95">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>Selesai
            </button>
        `);
    } else {
        buttons.push(`
            <button onclick="event.stopPropagation(); uncompleteProject(${project.id})"
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-4 py-2.5 text-xs font-semibold text-yellow-600 transition-all hover:bg-yellow-100 active:scale-95">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>Batalkan
            </button>
        `);
    }

    buttons.push(`
        <a href="/projects-page/${project.id}/edit"
           onclick="event.stopPropagation()"
           class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100">
            <i data-lucide="edit" class="w-3.5 h-3.5"></i>Edit
        </a>
    `);

    buttons.push(`
        <button onclick="event.stopPropagation(); confirmDeleteProject(${project.id}, '${escapeHtml(project.nama).replace(/'/g, "\\'")}')"
            class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
    `);

    return buttons.join('');
}

function toggleMenu(btn) {
    const menu = btn.nextElementSibling;
    const isOpen = !menu.classList.contains('hidden');

    document.querySelectorAll('.dropdown-menu')
        .forEach(m => m.classList.add('hidden'));

    if (!isOpen) {
        menu.classList.remove('hidden');
    }
}

function updatePaginationBar(total, start, end, pageCount) {
    const wrapper = document.getElementById('paginationWrapper');
    if (!wrapper) return;

    wrapper.style.display = total === 0 ? 'none' : '';

    const pageFrom = document.getElementById('pageFrom');
    const pageTo = document.getElementById('pageTo');
    const pageTotal = document.getElementById('pageTotal');

    if (pageFrom) pageFrom.textContent = total === 0 ? 0 : start + 1;
    if (pageTo) pageTo.textContent = end;
    if (pageTotal) pageTotal.textContent = total;

    const container = document.getElementById('pageButtons');
    if (!container) return;

    container.innerHTML = '';

    if (pageCount <= 1) return;

    const btn = (label, page, disabled, active) => {
        const b = document.createElement('button');
        b.innerHTML = label;
        b.disabled = disabled;
        b.className = [
            'min-w-[36px] h-9 px-2 rounded-lg border-2 text-sm font-semibold transition-all active:scale-95',
            active ? 'page-btn-active border-transparent'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600',
            disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        ].join(' ');
        if (!disabled && !active) b.onclick = () => { currentPage = page; render(); };
        return b;
    };

    container.appendChild(btn('<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>', currentPage - 1, currentPage === 1, false));

    const pages = buildPageRange(currentPage, pageCount);
    pages.forEach(p => {
        if (p === '…') {
            const s = document.createElement('span');
            s.textContent = '…';
            s.className = 'px-1 text-gray-400 text-sm select-none';
            container.appendChild(s);
        } else {
            container.appendChild(btn(p, p, false, p === currentPage));
        }
    });

    container.appendChild(btn('<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>', currentPage + 1, currentPage === pageCount, false));
}

function buildPageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
}

// Search
function updateSearchInfo() {
    const searchInput = document.getElementById('searchInput');
    const searchInfo = document.getElementById('searchInfo');
    const resultCount = document.getElementById('resultCount');
    const totalCount = document.getElementById('totalCount');
    const noResults = document.getElementById('noResults');

    if (!searchInput) return;

    const keyword = searchInput.value.trim();
    const total = filtered.length;

    if (keyword) {
        if (searchInfo) searchInfo.classList.remove('hidden');
        if (resultCount) resultCount.textContent = total;
        if (totalCount) totalCount.textContent = allProjects.length;
        if (noResults) noResults.classList.toggle('hidden', total > 0);
    } else {
        if (searchInfo) searchInfo.classList.add('hidden');
        if (noResults) noResults.classList.add('hidden');
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    if (!searchInput) return;

    const keyword = searchInput.value.toLowerCase().trim();

    if (keyword) {
        if (clearBtn) {
            clearBtn.classList.remove('hidden');
            clearBtn.classList.add('flex');
        }
        filtered = allProjects.filter(p =>
            p.nama.toLowerCase().includes(keyword) ||
            (p.deskripsi || '').toLowerCase().includes(keyword)
        );
    } else {
        if (clearBtn) {
            clearBtn.classList.add('hidden');
            clearBtn.classList.remove('flex');
        }
        filtered = [...allProjects];
    }

    currentPage = 1;
    render();
}

function sortTable(colIndex, type) {
    const direction = sortState[colIndex] === 'asc' ? 'desc' : 'asc';
    sortState = { [colIndex]: direction };

    const keys = ['id', 'nama', 'deskripsi'];
    const key = keys[colIndex];

    filtered.sort((a, b) => {
        let av = a[key], bv = b[key];
        if (type === 'number') { av = +av; bv = +bv; }
        else { av = String(av || '').toLowerCase(); bv = String(bv || '').toLowerCase(); }
        if (av < bv) return direction === 'asc' ? -1 : 1;
        if (av > bv) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    document.querySelectorAll("[id^='sort-']").forEach(el => el.textContent = '↕');
    const sortEl = document.getElementById(`sort-${colIndex}`);
    if (sortEl) sortEl.textContent = direction === 'asc' ? '↑' : '↓';

    render();
}

async function completeProject(id) {
    try {
        const res = await fetch(`/projects/${id}/complete`, { method: 'PATCH' });
        const json = await res.json();
        if (json.status === 'success') {
            showToast('Project berhasil diselesaikan');
            loadProjects();
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Terjadi kesalahan', 'error');
    }
}

async function uncompleteProject(id) {
    try {
        const res = await fetch(`/projects/${id}/uncomplete`, { method: 'PATCH' });
        const json = await res.json();
        if (json.status === 'success') {
            showToast('Status project dikembalikan');
            loadProjects();
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Terjadi kesalahan', 'error');
    }
}

function viewProject(id) {
    window.location.href = `/projects-page/${id}/tasks`;
}

// ===================================
// CREATE PROJECT FORM
// ===================================

function initCreateProjectForm() {
    const form = document.getElementById('createForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        const name = document.getElementById('projectName').value.trim();
        const taskInputs = [...document.querySelectorAll('input[name="tasks[]"]')];
        const hasTask = taskInputs.some(i => i.value.trim() !== '');

        if (!name) {
            e.preventDefault();
            showInlineError('projectName', 'Nama project wajib diisi.');
            return;
        }
        if (name.length > 100) {
            e.preventDefault();
            showInlineError('projectName', 'Nama project maksimal 100 karakter.');
            return;
        }
        if (!hasTask) {
            e.preventDefault();
            const container = document.getElementById('taskContainer');
            const hint = document.createElement('p');
            hint.id = 'taskError';
            hint.className = 'mt-2 text-sm text-red-600 flex items-center gap-1';
            hint.innerHTML = '<i data-lucide="alert-circle" class="w-4 h-4 inline"></i> Tambahkan minimal satu task dengan judul.';
            const existing = document.getElementById('taskError');
            if (existing) existing.remove();
            container.after(hint);
            lucide.createIcons();
            hint.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 inline mr-2 animate-spin"></i> Menyimpan...';
        submitBtn.disabled = true;
        lucide.createIcons();
    });
}

function showInlineError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('input-error');
    input.classList.remove('border-gray-200');

    const existingErr = input.parentElement.querySelector('.inline-err');
    if (existingErr) existingErr.remove();

    const p = document.createElement('p');
    p.className = 'inline-err mt-1.5 text-xs text-red-600 flex items-center gap-1';
    p.innerHTML = `<i data-lucide="alert-circle" class="w-3 h-3"></i> ${message}`;
    input.after(p);
    lucide.createIcons();
    input.focus();

    input.addEventListener('input', () => {
        input.classList.remove('input-error');
        input.classList.add('border-gray-200');
        p.remove();
    }, { once: true });
}

function addTask() {
    const container = document.getElementById('taskContainer');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'task-item border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-300 transition-all';
    div.innerHTML = `
        <div class="flex gap-3 sm:gap-4">
            <div class="drag-handle cursor-move flex items-center text-gray-400 hover:text-blue-600 transition-colors pt-1">
                <i data-lucide="grip-vertical" class="w-5 h-5"></i>
            </div>
            <div class="flex-1 min-w-0 relative">
                <button type="button"
                    onclick="this.closest('.task-item').remove(); updateTaskNumbers()"
                    class="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all z-10">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <span class="task-number w-6 h-6 flex items-center justify-center rounded bg-blue-100 text-blue-600 text-xs"></span>
                        <span class="task-label"></span>
                    </h4>
                </div>
                <div class="space-y-3">
                    <div>
                        <label class="text-xs font-semibold text-gray-600 mb-1.5 block">Judul Task</label>
                        <input type="text" name="tasks[]" placeholder="Contoh: Setup database PostgreSQL"
                            class="input-focus w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-all hover:border-gray-300" />
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi Task</label>
                        <textarea name="taskDescriptions[]" rows="2" placeholder="Detail tambahan untuk task ini..."
                            class="input-focus w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm resize-none transition-all hover:border-gray-300"></textarea>
                    </div>
                </div>
            </div>
        </div>`;
    container.appendChild(div);
    updateTaskNumbers();
    lucide.createIcons();
    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const taskError = document.getElementById('taskError');
    if (taskError) taskError.remove();
}

function updateTaskNumbers() {
    document.querySelectorAll('.task-item').forEach((item, i) => {
        const n = item.querySelector('.task-number');
        const l = item.querySelector('.task-label');
        if (n) n.textContent = i + 1;
        if (l) l.textContent = `Task #${i + 1}`;
    });
}

function initSortable() {
    const taskContainer = document.getElementById('taskContainer');
    if (!taskContainer || typeof Sortable === 'undefined') return;

    new Sortable(taskContainer, {
        animation: 200,
        handle: '.drag-handle',
        ghostClass: 'bg-blue-50',
        dragClass: 'opacity-50',
        onEnd: updateTaskNumbers,
    });
}

// ===================================
// EDIT PROJECT FORM
// ===================================

function initEditProjectForm() {
    const form = document.getElementById('editProjectForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<i data-lucide="loader-2" class="w-4 h-4 inline mr-2 animate-spin"></i> Menyimpan...';
        lucide.createIcons();

        const formData = new FormData(form);

        const payload = {
            nama: formData.get('nama'),
            deskripsi: formData.get('deskripsi'),
        };

        // Get project ID from URL path - more reliable than form attributes
        const pathMatch = window.location.pathname.match(/\/projects-page\/(\d+)/);
        const projectId = pathMatch ? pathMatch[1] : null;

        if (!projectId) {
            alert('Project ID tidak ditemukan');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            lucide.createIcons();
            return;
        }

        try {
            const res = await fetch(`/projects/${projectId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || 'Gagal memperbarui project');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                lucide.createIcons();
                return;
            }

            window.location.href = `/projects-page/${projectId}/tasks?success=project_updated`;
        } catch (err) {
            console.error('Error updating project:', err);
            alert('Terjadi kesalahan saat menyimpan data');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            lucide.createIcons();
        }
    });
}

// ===================================
// DELETE PROJECT MODAL
// ===================================

function confirmDeleteProject(id, name) {
    const deleteModal = document.getElementById('deleteModal');
    const deleteProjectName = document.getElementById('deleteProjectName');
    const confirmDelete = document.getElementById('confirmDelete');

    if (deleteProjectName) deleteProjectName.textContent = name;
    if (confirmDelete) confirmDelete.onclick = () => deleteProject(id);
    if (deleteModal) {
        deleteModal.classList.remove('hidden');
        deleteModal.classList.add('flex');
    }
}

function confirmDelete() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.classList.remove('hidden');
        deleteModal.classList.add('flex');
    }
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.classList.add('hidden');
        deleteModal.classList.remove('flex');
    }
}

async function deleteProject(id) {
    // If id is not provided, try to get it from URL
    if (!id) {
        const pathMatch = window.location.pathname.match(/\/projects-page\/(\d+)/);
        id = pathMatch ? pathMatch[1] : null;
    }

    if (!id) {
        alert('Project ID tidak ditemukan');
        return;
    }

    try {
        const res = await fetch(`/projects/${id}`, {
            method: 'DELETE',
        });

        const result = await res.json();

        if (!res.ok) {
            alert(result.message || 'Gagal menghapus project');
            return;
        }

        // Check if we're on the edit page or list page
        if (document.getElementById('editProjectForm')) {
            // On edit page - redirect to projects list
            window.location.href = '/projects-page?success=project_deleted';
        } else {
            // On list page - show toast and reload
            showToast('Project berhasil dihapus');
            closeDeleteModal();
            loadProjects();
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Terjadi kesalahan saat menghapus project');
    }
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
// ERROR ALERT AUTO-DISMISS
// ===================================

function initErrorAlert() {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
        setTimeout(() => {
            errorAlert.style.transition = 'opacity .4s';
            errorAlert.style.opacity = '0';
            setTimeout(() => errorAlert.remove(), 400);
        }, 8000);
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

function initEventListeners() {
    // Close dropdown menus when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown')) return;
        document.querySelectorAll('.dropdown-menu')
            .forEach(m => m.classList.add('hidden'));
    });

    // Close delete modal on Escape or background click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDeleteModal();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            } else {
                addTask();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const createForm = document.getElementById('createForm');
            if (createForm) createForm.requestSubmit();
        }
    });

    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') closeDeleteModal();
        });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }

    // Clear search button
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
                performSearch();
                searchInput.focus();
            }
        });
    }

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
                performSearch();
            }
            sortState = {};
            document.querySelectorAll("[id^='sort-']").forEach(el => el.textContent = '↕');
            if (searchInput) searchInput.focus();
        });
    }

    // Per page select
    const perPageSelect = document.getElementById('perPageSelect');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', (e) => {
            perPage = e.target.value === 'all' ? 'all' : +e.target.value;
            currentPage = 1;
            render();
        });
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Auto-focus project name input
    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput) {
        projectNameInput.focus();
    }

    // Initialize error alert
    initErrorAlert();

    // Initialize event listeners
    initEventListeners();

    // Initialize create project form
    initCreateProjectForm();

    // Initialize edit project form
    initEditProjectForm();

    // Initialize sortable for task container
    initSortable();

    // Load projects if on list page
    const tableBody = document.getElementById('tableBody');
    const mobileList = document.getElementById('mobileList');
    if (tableBody || mobileList) {
        loadProjects();
    }

    // Handle success messages from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');

    if (successParam) {
        const messages = {
            'project_created': 'Project berhasil dibuat',
            'project_updated': 'Project berhasil diperbarui',
            'project_deleted': 'Project berhasil dihapus',
            'task_created': 'Task berhasil ditambahkan',
            'task_updated': 'Task berhasil diperbarui',
            'task_deleted': 'Task berhasil dihapus',
            'task_completed': 'Task berhasil diselesaikan',
            'task_uncompleted': 'Status task dikembalikan'
        };

        const message = messages[successParam] || 'Operasi berhasil';
        showToast(message, 'success');

        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
});