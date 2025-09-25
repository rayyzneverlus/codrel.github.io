// Konfigurasi Admin (Hanya 1 akun khusus)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'codrel123'
};

// Data awal kode (jika localStorage kosong)
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
                id: 1,
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
                id: 1,
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
    }
};

// Fungsi utama: Load data dari localStorage atau data awal
let kumpulanKode = JSON.parse(localStorage.getItem('kumpulanKode')) || DATA_AWAL;
let isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
let currentEditingId = null;

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
}

// Tampilkan Public Mode
function showPublicMode() {
    document.getElementById('publicHeader').style.display = 'block';
    document.getElementById('adminHeader').style.display = 'none';
    document.getElementById('tambah-kode').style.display = 'none';
    document.getElementById('detail-actions').style.display = 'none'; // Sembunyikan actions di detail
    document.querySelector('footer p').textContent = '&copy; 2024 Codrel. Public hanya lihat. Dibuat dengan ❤️ oleh AI Assistant.';
}

// Tampilkan Admin Mode
function showAdminMode() {
    document.getElementById('publicHeader').style.display = 'none';
    document.getElementById('adminHeader').style.display = 'block';
    document.getElementById('tambah-kode').style.display = 'block';
    document.querySelector('footer p').textContent = '&copy; 2024 Codrel. Admin Mode - Khusus pemilik. Dibuat dengan ❤️ oleh AI Assistant.';
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

    // Search & Filter
    document.getElementById('searchInput').addEventListener('input', tampilkanDaftarKode);
    document.getElementById('kategoriFilter').addEventListener('change', tampilkanDaftarKode);

    // Form Tambah Kode (Admin Only)
    document.getElementById('formTambah').addEventListener('submit', tambahKode);

    // Kembali dari detail
    document.getElementById('kembali').addEventListener('click', () => {
        document.getElementById('kode-detail').style.display = 'none';
    });

    // Edit & Delete (Admin Only)
    document.getElementById('editBtn').addEventListener('click', bukaEditModal);
    document.getElementById('deleteBtn').addEventListener('click', deleteKode);
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
        publicBtn.textContent = '☀️ Light Mode';
        adminBtn.textContent = '☀️ Light Mode';
    } else {
        publicBtn.textContent = '🌙 Dark Mode';
        adminBtn.textContent = '🌙 Dark Mode';
    }
}

// Tampilkan Daftar Kode (Public & Admin)
function tampilkanDaftarKode() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filterKategori = document.getElementById('kategoriFilter').value;
    const daftarCard = document.getElementById('daftar-card');
    daftarCard.innerHTML = '';

    Object.keys(kumpulanKode).forEach(key => {
        kumpulanKode[key].kode.forEach(kode => {
            if ((kode.judul.toLowerCase().includes(search) || kode.deskripsi.toLowerCase().includes(search)) &&
                (!filterKategori || kode.kategori === filterKategori)) {
                const card = document.createElement('div');
                card.className = 'kode-card';
                card.innerHTML = `
                    <h3>${escapeHtml(kode.judul)}</h3>
                    <span class="kategori-tag">${kumpulanKode[kode.kategori].nama}</span>
                    <p>${escapeHtml(kode.deskripsi)}</p>
                `;
                card.addEventListener('click', () => tampilkanDetail(kode));
                daftarCard.appendChild(card);
            }
        });
    });

    if (daftarCard.innerHTML === '') {
        daftarCard.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Tidak ada kode yang ditemukan.</p>';
    }
}

// Tampilkan Detail Kode
function tampilkanDetail(kode) {
    document.getElementById('daftar-kode').style.display = 'none';
    document.getElementById('tambah-kode').style.display = isAdminLoggedIn ? 'block' : 'none';
    document.getElementById('kode-detail').style.display = 'block';

    const detailContent = document.getElementById('detail-content');
    detailContent.innerHTML = `
        <h3>${escapeHtml(kode.judul)}</h3>
        <p>${escapeHtml(kode.deskripsi)}</p>
        <span class="kategori-tag">${kumpulanKode[kode.kategori].nama}</span>
        <br><br>
        <button class="copy-btn" id="copyBtn" style="display: ${isAdminLoggedIn ? 'block' : 'none'};">📋 Copy Kode</button>
        <pre><code class="language-${kode.bahasa}">${escapeHtml(kode.kodeSumber)}</code></pre>
    `;

    // Highlight dengan Prism
    Prism.highlightAll();

    // Copy Button (Admin Only)
    if (isAdminLoggedIn) {
        document.getElementById('copyBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(kode.kodeSumber).then(() => {
                alert('Kode berhasil dicopy!');
            }).catch(() => {
                alert('Gagal copy, salin manual ya!');
            });
        });

        // Tampilkan actions admin
        document.getElementById('detail-actions').style.display = 'block';
        document.getElementById('editBtn').dataset.id = kode.id;
        document.getElementById('deleteBtn').dataset.id = kode.id;
    }
}

// Tambah Kode Baru (Admin Only)
function tambahKode(e) {
    e.preventDefault();
    const judul = document.getElementById('judulInput').value;
    const deskripsi = document.getElementById('deskripsiInput').value;
    const bahasa = document.getElementById('bahasaInput').value;
    const kategori = document.getElementById('kategoriInput').value;
    const kodeSumber = document.getElementById('kodeInput').value;

    if (!judul || !deskripsi || !bahasa || !kategori || !kodeSumber) {
        alert('Semua field harus diisi!');
        return;
    }

    const newId = Date.now(); // ID unik berdasarkan timestamp
    const newKode = {
        id: newId,
        judul,
        deskripsi,
        bahasa,
        kategori,
        kodeSumber
    };

    if (!kumpulanKode[kategori]) {
        kumpulanKode[kategori] = { nama: kategori.toUpperCase(), kode: [] };
    }
    kumpulanKode[kategori].kode.push(newKode);

    simpanData();
    tampilkanDaftarKode();
    e.target.reset();
    alert('Kode baru berhasil ditambahkan!');
}

// Edit Kode (Admin Only)
function bukaEditModal() {
    const id = parseInt(document.getElementById('editBtn').dataset.id);
    currentEditingId = id;
    const kode = cariKodeById(id);

    if (!kode) return;

    document.getElementById('editJudul').value = kode.judul;
    document.getElementById('editDeskripsi').value = kode.deskripsi;
    document.getElementById('editBahasa').value = kode.bahasa;
    document.getElementById('editKategori').value = kode.kategori;
    document.getElementById('editKode').value = kode.kodeSumber;

    document.getElementById('edit-modal').style.display = 'block';
}

function updateKode(e) {
    e.preventDefault();
    const id = currentEditingId;
    const kode = cariKodeById(id);

    if (!kode) return;

    kode.judul = document.getElementById('editJudul').value;
    kode.deskripsi = document.getElementById('editDeskripsi').value;
    kode.bahasa = document.getElementById('editBahasa').value;
    kode.kategori = document.getElementById('editKategori').value;
