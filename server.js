import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const PUBLIC_DATA = path.join(__dirname, 'public', 'data');
const TMP_DIR = path.join(os.tmpdir(), 'shawer_merge');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// دمج الفيديوهات باستخدام FFmpeg concat demuxer
app.post('/api/merge', (req, res) => {
  const { clips } = req.body; // e.g. ['أنا.mp4', 'حب.mp4', 'الجميع.mp4']
  if (!clips || clips.length === 0) return res.status(400).json({ error: 'No clips provided' });

  // فيديو واحد → أرسله مباشرة
  if (clips.length === 1) {
    const single = path.join(PUBLIC_DATA, clips[0]);
    return fs.existsSync(single)
      ? res.sendFile(single)
      : res.status(404).json({ error: 'File not found' });
  }

  const hash = crypto.createHash('md5').update(clips.join('|')).digest('hex');
  const outFile = path.join(TMP_DIR, `${hash}.mp4`);

  // إذا اتعمل قبل كده → أرسله فوراً من الكاش
  if (fs.existsSync(outFile)) return res.sendFile(outFile);

  // اكتب ملف القائمة لـ FFmpeg
  const listFile = path.join(TMP_DIR, `${hash}.txt`);
  const lines = clips.map(c => `file '${path.join(PUBLIC_DATA, c).replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listFile, lines, 'utf8');

  const ffmpeg = (process.env.FFMPEG_PATH || 'ffmpeg').replace(/\\/g, '/');
  const cmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${listFile.replace(/\\/g, '/')}" -c copy "${outFile.replace(/\\/g, '/')}"`;

  exec(cmd, (err, stdout, stderr) => {
    try { fs.unlinkSync(listFile); } catch {}
    if (err) {
      console.error('[FFmpeg Error]', stderr);
      return res.status(500).json({ error: 'FFmpeg failed', detail: stderr });
    }
    res.sendFile(outFile);
  });
});

app.listen(3001, () => console.log('✅ Shawer API server → http://localhost:3001'));
