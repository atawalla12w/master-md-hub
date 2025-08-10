
import fetch from 'node-fetch';
export default async function handler(req, res){
  try{
    const r = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=6&apiKey=${process.env.NEWSAPI_KEY}`);
    const j = await r.json();
    res.json(j);
  }catch(e){ res.status(500).json({ error: String(e) }) }
}
