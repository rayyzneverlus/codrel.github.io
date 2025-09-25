// Data awal (akan disimpan di localStorage)
let kumpulanKode = {
    'ai-converter': {
        nama: 'AI & Converter',
        kode: [
            {
                id: 1,
                judul: 'Handler ToFigure untuk Bot WhatsApp',
                deskripsi: 'Kode JavaScript untuk mengonversi gambar menjadi figure/sketsa menggunakan API ZELARIXA. Cocok untuk bot WhatsApp berbasis Baileys.',
                bahasa: 'javascript',
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
                kodeSumber: `const handler = async (m, {
