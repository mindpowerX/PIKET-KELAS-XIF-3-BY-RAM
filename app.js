let daftarPiket = JSON.parse(localStorage.getItem('piket_kelas_db')) || [];
let currentFilter = 'semua';

document.addEventListener('DOMContentLoaded', () => {
    initSyncStatus();
    renderDashboard();
});

// DETEKSI STATUS SYNC ONLINE/OFFLINE
function initSyncStatus() {
    const badge = document.getElementById('syncBadge');
    const updateStatus = () => {
        if (navigator.onLine) {
            badge.textContent = "● Online";
            badge.className = "badge-sync online";
        } else {
            badge.textContent = "● Offline";
            badge.className = "badge-sync offline";
        }
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

// LOGIKA UTAMA: simpanPiket (Nama, Hari, Tugas, Deadline, Reminder)
function handleSimpanPiket(e) {
    e.preventDefault();
    const namaSiswa = document.getElementById('namaSiswa').value;
    const hariPiket = document.getElementById('hariPiket').value;
    const jenisTugas = document.getElementById('jenisTugas').value;
    const deadlineInput = document.getElementById('deadline').value;
    const reminderTime = document.getElementById('reminder').value;

    // VALIDASI TANGGAL (Minimal hari ini)
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const selectedDeadline = new Date(deadlineInput);

    if (selectedDeadline < hariIni) {
        openModalError();
        return false;
    }

    const piketBaru = {
        id_piket: "PKT-" + Date.now(),
        nama_siswa: namaSiswa,
        hari_piket: hariPiket,
        jenis_tugas: jenisTugas,
        tenggat_waktu: deadlineInput,
        timestamp_pengingat: reminderTime || null,
        status_pengerjaan: 0 // 0 = Belum Selesai, 1 = Selesai
    };

    daftarPiket.push(piketBaru);
    localStorage.setItem('piket_kelas_db', JSON.stringify(daftarPiket));

    closeModalForm();
    document.getElementById('taskForm').reset();
    renderDashboard();
}

// TOGGLE CHECKBOX STATUS SELESAI
function toggleStatusPiket(idPiket) {
    daftarPiket = daftarPiket.map(piket => {
        if (piket.id_piket === idPiket) {
            piket.status_pengerjaan = piket.status_pengerjaan === 0 ? 1 : 0;
        }
        return piket;
    });
    localStorage.setItem('piket_kelas_db', JSON.stringify(daftarPiket));
    renderDashboard();
}

// RENDER DAFTAR JADWAL PIKET
function renderDashboard() {
    const taskListElement = document.getElementById('taskList');
    if (!taskListElement) return;
    taskListElement.innerHTML = '';

    const filtered = daftarPiket.filter(piket => {
        if (currentFilter === 'belum') return piket.status_pengerjaan === 0;
        if (currentFilter === 'selesai') return piket.status_pengerjaan === 1;
        return true;
    });

    if (filtered.length === 0) {
        taskListElement.innerHTML = '<p style="text-align:center; color:#888; font-size:12px; margin-top:20px;">Belum ada jadwal piket yang dicatat.</p>';
        return;
    }

    filtered.forEach(piket => {
        const card = document.createElement('div');
        const isCompleted = piket.status_pengerjaan === 1;
        card.className = `task-card ${isCompleted ? 'completed' : ''}`;

        card.innerHTML = `
            <div>
                <span class="nama-badge">👤 ${piket.nama_siswa}</span>
                <span class="hari-badge">📅 ${piket.hari_piket}</span>
                <h4 style="font-size:13px; margin:4px 0;">${piket.jenis_tugas}</h4>
                <p style="font-size:11px; color:#d93025;">⏰ Tanggal: ${piket.tenggat_waktu} ${piket.timestamp_pengingat ? '('+piket.timestamp_pengingat+')' : ''}</p>
            </div>
            <div>
                <input type="checkbox" ${isCompleted ? 'checked' : ''} onclick="toggleStatusPiket('${piket.id_piket}')" style="transform: scale(1.3); cursor:pointer;">
            </div>
        `;
        taskListElement.appendChild(card);
    });
}

function filterPiket(filterType, event) {
    currentFilter = filterType;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    renderDashboard();
}

function openModalForm() { document.getElementById('modalFormOverlay').classList.remove('hidden'); }
function closeModalForm() { document.getElementById('modalFormOverlay').classList.add('hidden'); }
function openModalError() { document.getElementById('modalErrorOverlay').classList.remove('hidden'); }
function closeModalError() { document.getElementById('modalErrorOverlay').classList.add('hidden'); }

renderDashboard();