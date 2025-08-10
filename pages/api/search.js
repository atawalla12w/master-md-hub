
import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = { api: { bodyParser: false } };

function detectType(mime){ if(!mime) return null; if(mime.startsWith('image/')) return 'image'; if(mime.startsWith('video/')) return 'video'; if(mime.startsWith('audio/')) return 'audio'; return 'other'; }

export default async function handler(req, res){
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if(err) return res.status(500).json({ error: 'Form parse error' });
    try{
      const question = fields.question || '';
      const lang = fields.lang || '';
      let file = files.file;
      let fileBuffer = null;
      let mimetype = null;
      if(file){
        const data = fs.readFileSync(file.filepath);
        fileBuffer = data;
        mimetype = file.mimetype;
      }
      let ftype = detectType(mimetype || '');
      let mediaAnalysis = null;

      if((ftype === 'image' || ftype === 'video') && process.env.GOOGLE_API_KEY){
        const b64 = fileBuffer ? fileBuffer.toString('base64') : '';
        const body = {
          requests: [{
            image: { content: b64 },
            features: [{ type:'LABEL_DETECTION', maxResults:6 }, { type:'WEB_DETECTION', maxResults:5 }, { type:'TEXT_DETECTION', maxResults:5 }]
          }]
        };
        const r = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
        mediaAnalysis = await r.json();
      }

      if(ftype === 'audio' && process.env.ACR_HOST && process.env.ACR_ACCESS_KEY && process.env.ACR_ACCESS_SECRET){
        const http_method = 'POST';
        const http_uri = '/v1/identify';
        const data_type = 'audio';
        const timestamp = Math.floor(Date.now()/1000);
        const string_to_sign = [http_method, http_uri, process.env.ACR_ACCESS_KEY, data_type, '1', timestamp].join('\n');
        const crypto = require('crypto');
        const signature = crypto.createHmac('sha1', process.env.ACR_ACCESS_SECRET).update(string_to_sign).digest('base64');
        const formData = new FormData();
        formData.append('access_key', process.env.ACR_ACCESS_KEY);
        formData.append('data_type', data_type);
        formData.append('signature', signature);
        formData.append('sample_bytes', fileBuffer.length.toString());
        formData.append('sample', fileBuffer, { filename: file.originalFilename || 'sample' });
        formData.append('timestamp', String(timestamp));
        const r = await fetch(`https://${process.env.ACR_HOST}/v1/identify`, { method:'POST', body: formData });
        mediaAnalysis = await r.json();
      }

      const prompt = `User language: ${lang || 'en'}\nQuestion: ${question}\nMediaAnalysis: ${JSON.stringify(mediaAnalysis).slice(0,2000)}\nPlease answer in user's language.`;

      let aiAnswer = 'OpenAI key not configured on server.';
      if(process.env.OPENAI_API_KEY){
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages:[{ role:'user', content: prompt }], temperature: 0 })
        });
        const j = await r.json();
        aiAnswer = j.choices?.[0]?.message?.content || JSON.stringify(j);
      }

      let wiki = null;
      if(question){
        try{
          const wr = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(question)}`);
          if(wr.ok){ const wj = await wr.json(); wiki = wj.extract || null; }
        }catch(e){ wiki = null; }
      }

      res.json({ success:true, aiAnswer, wiki, mediaAnalysis, whichAI: { openai: !!process.env.OPENAI_API_KEY, media: ftype === 'audio' ? 'ACRCloud' : 'GoogleVision' } });
    }catch(e){
      console.error(e);
      res.status(500).json({ success:false, error: String(e) });
    }
  });
}
