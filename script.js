// Konfigurasi Admin (Hanya 1 akun khusus)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'codrel123'
};

// Data awal kode (jika localStorage kosong) - Tambah kategori "tools" sebagai tambahan
const DATA_AWAL = {
    'ai-converter': {
        nama: 'AI & Converter',
        kode: [
            {
                id: 1,
                judul: 'Handler ToFigure untuk Bot WhatsApp',
                deskripsi: 'Kode JavaScript untuk mengonversi gambar menjadi figure/sketsa menggunakan API ZELARIXA. Cocok untuk bot WhatsApp berbasis Baileys.',
                bahasa: 'javascript',
                kategori: 'ai-converter',
                kodeSumber: `// Feature : ToFigure
// Created by Farel
// Source : https://whatsapp.com/channel/0029Vb6lzpD0bIds18WBqH0Y
import axios from 'axios'
import FormData from 'form-data'

let TOFIGURE = url => 'https://zelarixa.dpdns.org/tools/tofigure?url=' + encodeURIComponent(url)

const fetchBuffer = async target => {
  if (!target) throw new Error('no target')
  if (typeof target.download === 'function') {
    const buff = await target.download()
    if (buff && buff.length) return buff
  }
  const url = target.msg?.url ?? target.message?.imageMessage?.url
  if (url) {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 })
    return Buffer.from(res.data)
  }
  throw new Error('cannot download media')
}

const uploadCatbox = async buffer => {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })
  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: { ...form.getHeaders() },
    timeout: 60000,
    maxBodyLength: Infinity
  })
  const url = String(res.data || '').trim()
  if (!url.startsWith('http')) throw new Error('catbox upload failed')
  return url
}

const uploadTmpfiles = async buffer => {
  const form = new FormData()
  form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })
  const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
    headers: { ...form.getHeaders() },
    timeout: 60000
  })
  const url = res?.data?.data?.url ?? res?.data?.url
  if (!url) throw new Error('tmpfiles upload failed')
  return url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/')
}

const uploadImage = async buffer => {
  try {
    return await uploadCatbox(buffer)
  } catch {
    return await uploadTmpfiles(buffer)
  }
}

const handler = async (m, { conn, prefix, command }) => {
  try {
    const target = m.quoted ?? m
    const mime = target.msg?.mimetype ?? target.mimetype ?? target.message?.imageMessage?.mimetype ?? ''
    if (!mime || !mime.startsWith('image')) {
      await conn.sendMessage(m.chat, { text: 'Reply atau kirim gambar dengan caption ' + prefix + (command ?? 'tofigure') }, { quoted: m })
      return
    }
    await conn.sendMessage(m.chat, { text: 'Mengunduh media...' }, { quoted: m })
    const buffer = await fetchBuffer(target)
    await conn.sendMessage(m.chat, { text: 'Mengunggah gambar...' }, { quoted: m })
    const imgUrl = await uploadImage(buffer)
    await conn.sendMessage(m.chat, { text: 'Memproses gambar...' }, { quoted: m })
    const apiRes = await axios.get(TOFIGURE(imgUrl), { responseType: 'arraybuffer', timeout: 120000 })
    const outBuffer = Buffer.from(apiRes.data)
    await conn.sendMessage(m.chat, { image: outBuffer, caption: '' }, { quoted: m })
  } catch (err) {
    const msg = err?.response?.data ? String(err.response.data).slice(0, 300) : err?.message ?? 'unknown'
    await conn.sendMessage(m.chat, { text: 'Gagal: ' + msg }, { quoted: m })
  }
}

handler.help = ['tofigure']
handler.tags = ['ai','converter']
handler.command = ['tofigure','figure']

export default handler`
            }
        ]
    },
    'web': {
        nama: 'Web Development',
        kode: [
            {
                id: 2,
                judul: 'Template HTML Sederhana',
                deskripsi: 'Contoh halaman web dasar dengan CSS responsif.',
                bahasa: 'html',
                kategori: 'web',
                kodeSumber: `<!DOCTYPE html>
<html lang="id">
<head>
    <title>Halaman Sederhana</title>
</head>
<body>
    <h1>Halo Dunia!</h1>
    <p>Ini adalah contoh kode HTML dasar.</p>
</body>
</html>`
            }
        ]
    },
    'bot': {
        nama: 'Bot & Automation',
        kode: [
            {
                id: 3,
                judul: 'Handler Reply Bot Sederhana',
                deskripsi: 'Kode JS untuk bot WhatsApp yang merespon pesan.',
                bahasa: 'javascript',
                kategori: 'bot',
                kodeSumber: `const handler = async (m, { conn }) => {
    if (m.text === 'halo') {
        await conn.reply(m.chat, 'Halo juga!', m)
    }
}
export default handler`
            }
        ]
    },
    'tools': {  // Kategori tambahan baru
        nama: 'Tools',
        kode: [
            {
                id: 4,
                judul: 'Utility Function JS Sederhana',
                deskripsi: 'Fungsi utilitas untuk format tanggal dan validasi email di JavaScript.',
                bahasa: 'javascript',
                kategori: 'tools',
                kodeSumber: `// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID');
}

function validateEmail(email) {
    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return re.test(email);
}

// Contoh penggunaan
console.log(formatDate(new Date())); // Output: tanggal hari ini
console.log(validateEmail('test@example.com')); // Output: true`
            }
        ]
    }
};

// Fungsi utama: Load data dari localStorage atau data awal
let kumpulanKode = JSON.parse(localStorage.getItem('kumpulanKode')) || DATA_AWAL;
let isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
let currentEditingId = null;
let currentFilterKategori = ''; // Untuk sidebar dan filter bawah search

// Event listener saat DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    tampilkanDaftarKode();
    setupEventListeners();
});

// Inisialisasi app
function initApp() {
    if (isAdminLoggedIn) {
        showAdminMode();
    } else {
        showPublicMode();
    }
    // Load dark mode dari localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        updateDarkModeButtons(true);
    }
    // Setup sidebar berdasarkan screen size
    setupSidebar();
}

// Setup Sidebar (Responsif) - Update untuk kategori baru
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // Desktop: Sidebar selalu terbuka
    if (window.innerWidth > 768) {
        sidebar.classList.add('open');
        toggleBtn.style.display = 'none';
    } else {
        // Mobile: Sidebar tersembunyi, gunakan toggle
        toggleBtn.style.display = 'block';
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Event listener untuk kategori sidebar (termasuk "All" dan "tools")
    document.querySelectorAll('#kategoriSidebar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const kategori = e.target.dataset.kategori || '';
            currentFilterKategori = kategori;
            document.getElementById('kategoriFilter').value = kategori;
            // Update active class
            document.querySelectorAll('#kategoriSidebar a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            // Tutup sidebar di mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
            tampilkanDaftarKode();
        });
    });

    // Set active default untuk "All"
    document.querySelector('#kategoriSidebar a[data-kategori=""]').classList.add('active');

    // Resize listener untuk responsif
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.add('open');
            overlay.classList.remove('active');
            toggleBtn.style.display = 'none';
        } else {
            toggleBtn.style.display = 'block';
            if (!sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// Tampilkan Public Mode
function showPublicMode() {
    document.getElementById('publicHeader').style.display = 'block';
    document.getElementById('adminHeader').style.display = 'none';
    document.getElementById('tambah-kode').style.display = 'none';
    document.getElementById('detail-actions').style.display = 'none'; // Sembunyikan actions di detail
    document.querySelector('footer p').innerHTML = '<i class="fas fa-eye"></i> &copy; 2024 Codrel. Public hanya lihat. Dibuat dengan ❤️ oleh AI Assistant.';
}

// Tampilkan Admin Mode
function showAdminMode() {
    document.getElementById('publicHeader').style.display = 'none';
    document.getElementById('adminHeader').style.display = 'block';
    document.getElementById('tambah-kode').style.display = 'block';
    document.querySelector('footer p').innerHTML = '<i class="fas fa-crown"></i> &copy; 2024 Codrel. Admin Mode - Khusus pemilik. Dibuat dengan ❤️ oleh AI Assistant.';
}

// Setup event listeners
function setupEventListeners() {
    // Admin Login
    document.getElementById('adminLoginBtn').addEventListener('click', () => {
        document.getElementById('adminModal').style.display = 'block';
    });

    document.getElementById('formAdminLogin').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('usernameAdmin').value;
        const password = document.getElementById('passwordAdmin').value;
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            isAdminLoggedIn = true;
            localStorage.setItem('isAdminLoggedIn', 'true');
            document.getElementById('adminModal').style.display = 'none';
            document.getElementById('loginError').style.display = 'none';
            showAdminMode();
            tampilkanDaftarKode();
            alert('Selamat datang, Admin!');
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        isAdminLoggedIn = false;
        localStorage.removeItem('isAdminLoggedIn');
        showPublicMode();
        tampilkanDaftarKode();
        // Tutup detail jika terbuka
        document.getElementById('kode-detail').style.display = 'none';
        // Reset filter ke "All"
        currentFilterKategori = '';
        document.getElementById('kategoriFilter').value = '';
        document.querySelector('#kategoriSidebar a[data-kategori=""]').classList.add('active');
        document.querySelectorAll('#kategoriSidebar a').forEach(a => {
            if (a.dataset.kategori !== '') a.classList.remove('active');
        });
    });

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
            document.getElementById('loginError').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.getElementById('loginError').style.display = 'none';
        }
    });

    // Dark Mode Public
    document.getElementById('toggleDarkPublic').addEventListener('click', toggleDarkMode);

    // Dark Mode Admin
    document.getElementById('toggleDarkAdmin').addEventListener('click', toggleDarkMode);

    // Search & Filter (Sinkron dengan layout baru: search atas, filter bawah)
    document.getElementById('searchInput').addEventListener('input', tampilkanDaftarKode);
    document.getElementById('kategoriFilter').addEventListener('change', (e) => {
        currentFilterKategori = e.target.value;
        // Update sidebar active berdasarkan filter
        document.querySelectorAll('#kategoriSidebar a').forEach(a => a.classList.remove('active'));
        const sidebarLink = document.querySelector(`#kategoriSidebar a[data-kategori="${currentFilterKategori}"]`);
        if (sidebarLink) {
            sidebarLink.classList.add('active');
        } else {
            document.querySelector('#kategoriSidebar a[data-kategori=""]').classList.add('active');
        }
        tampilkanDaftarKode();
    });

    // Form Tambah Kode (Admin Only) - Dengan spinner
    document.getElementById('formTambah').addEventListener('submit', tambahKode);

    // Kembali dari detail
    document.getElementById('kembali').addEventListener('click', () => {
        document.getElementById('kode-detail').style.display = 'none';
        document.getElementById('daftar-kode').style.display = 'block';
        document.getElementById('tambah-kode').style.display = isAdminLoggedIn ? 'block' : 'none';
    });

    // Edit & Delete & Copy (Admin Only) - Event delegation karena dynamic
    document.addEventListener('click', (e) => {
        if (e.target.closest('#editBtn')) {
            bukaEditModal();
        }
        if (e.target.closest('#deleteBtn')) {
            deleteKode();
        }
        if (e.target.closest('#copyBtn')) {
            copyKode();
        }
    });

    document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('edit-modal').style.display = 'none';
    });
    document.getElementById('formEdit').addEventListener('submit', updateKode);
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeButtons(isDark);
}

function updateDarkModeButtons(isDark) {
    const publicBtn = document.getElementById('toggleDarkPublic');
    const adminBtn = document.getElementById('toggleDarkAdmin');
    if (isDark) {
        publicBtn.innerHTML = '<i class="fas fa-sun"></i>';
        adminBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        publicBtn.innerHTML = '<i class="fas fa-moon"></i>';
        adminBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Simpan data ke localStorage
function simpanData() {
    localStorage.setItem('kumpulanKode', JSON.stringify(kumpulanKode));
}

// Escape HTML untuk keamanan
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cari kode berdasarkan ID
function cariKodeById(id) {
    for (let key in kumpulanKode) {
        const kode = kumpulanKode[key].kode.find(k => k.id === id);
