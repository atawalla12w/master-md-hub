
import {useState, useEffect} from 'react'

export default function Home(){
  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ loadNews() }, [])

  function pickFile(type){
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type
    input.onchange = e => setFile(e.target.files[0])
    input.click()
  }

  async function submitSearch(){
    if(!file && !question){ alert('Please upload a file or type a question'); return; }
    setLoading(true)
    const form = new FormData()
    if(file) form.append('file', file)
    form.append('question', question)
    const res = await fetch('/api/search', { method:'POST', body: form })
    const j = await res.json()
    setResult(j)
    setLoading(false)
  }

  async function loadNews(){
    try{
      const r = await fetch('/api/news')
      const j = await r.json()
      const container = document.getElementById('news')
      if(j.articles) container.innerHTML = j.articles.map(a=>`<div class="card"><a href="${a.url}" target="_blank">${a.title}</a><br/><small>${new Date(a.publishedAt).toLocaleString()}</small></div>`).join('')
      else container.innerText = 'No news'
    }catch(e){ document.getElementById('news').innerText = 'Failed to load news' }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold text-red-500">MASTER MD HUB</div>
        <div className="cursor-pointer" onClick={()=>document.getElementById('searchPanel')?.classList.toggle('hidden')}>🔎</div>
      </header>

      <div id="searchPanel" className="mb-6 bg-gray-800 p-4 rounded hidden">
        <input className="w-full p-2 rounded text-black" placeholder="Ask your question (Sinhala/Tamil/English)" value={question} onChange={e=>setQuestion(e.target.value)} />
        <div className="flex gap-3 mt-3">
          <button className="bg-red-500 px-3 py-2 rounded" onClick={()=>pickFile('image/*')}>📷 Photo</button>
          <button className="bg-red-500 px-3 py-2 rounded" onClick={()=>pickFile('video/*')}>🎥 Video</button>
          <button className="bg-red-500 px-3 py-2 rounded" onClick={()=>pickFile('audio/*')}>🎵 MP3</button>
          {file && <div className="ml-auto">Selected: {file.name}</div>}
        </div>
        <div className="mt-3">
          <button className="bg-green-600 px-4 py-2 rounded" onClick={submitSearch} disabled={loading}>{loading? 'Searching...':'Search'}</button>
        </div>
      </div>

      <main>
        <section className="mb-6">
          <h2 className="text-xl font-semibold">Result</h2>
          {result ? (
            <div className="bg-gray-800 p-4 rounded mt-2">
              <h3 className="font-semibold">AI Answer</h3>
              <pre className="whitespace-pre-wrap">{result.aiAnswer}</pre>
              <button className="mt-2 px-3 py-1 bg-blue-600 rounded" onClick={()=>navigator.clipboard.writeText(result.aiAnswer)}>Copy</button>
              <h4 className="mt-3">Wikipedia</h4>
              <p>{result.wiki}</p>
              <h4 className="mt-3">Media Analysis (raw)</h4>
              <pre className="whitespace-pre-wrap">{JSON.stringify(result.mediaAnalysis, null, 2)}</pre>
            </div>
          ) : <p className="text-gray-400">No result yet.</p>}
        </section>

        <section>
          <h2 className="text-xl font-semibold">Latest News</h2>
          <div id="news" className="mt-2"></div>
        </section>
      </main>
    </div>
  )
}
