import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import './App.css'

function App() {
  const [inputMode, setInputMode] = useState('text')
  const [inputText, setInputText] = useState('')
  const [backendStatus, setBackendStatus] = useState('checking') // checking, up, down
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryResult, setSummaryResult] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // 檢查後端連接
  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/health', { cache: 'no-store' })
      if (response.ok) {
        setBackendStatus('up')
      } else {
        setBackendStatus('down')
      }
    } catch (error) {
      setBackendStatus('down')
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/summary/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('無法獲取歷史紀錄', error)
    }
  }

  useEffect(() => {
    checkBackend()
    fetchHistory()
    
    const interval = setInterval(() => {
      checkBackend()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation()
    try {
      const itemToDelete = history.find(item => item.id === id)
      const response = await fetch(`http://localhost:8080/api/summary/history/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        if (summaryResult === itemToDelete?.summaryText) {
          setSummaryResult(null)
        }
        setHistory(history.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('刪除失敗', error)
    }
  }

  const handleSummarize = async () => {
    if (!inputText.trim()) return
    
    setIsSummarizing(true)
    setSummaryResult(null)
    setShowHistory(false)
    
    try {
      const response = await fetch('http://localhost:8080/api/summary/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputText }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSummaryResult(data.summary)
        fetchHistory()
      } else {
        setSummaryResult(`❌ 錯誤: ${data.error || '摘要生成失敗'}`)
      }
    } catch (error) {
      setSummaryResult('❌ 無法連線至後端服務，請檢查後端是否正常運行。')
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setSummaryResult(null)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
    } catch (err) {
      console.error('無法讀取剪貼簿內容', err)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6 w-full z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
          <h1 className="text-[#0d141b] dark:text-white text-2xl font-bold tracking-tight">Alpoint</h1>
        </div>

        {/* Backend Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className={`size-2 rounded-full ${
            backendStatus === 'up' ? 'bg-green-500' : 
            backendStatus === 'down' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
          }`}></div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {backendStatus === 'up' ? '服務在線' : 
             backendStatus === 'down' ? '服務離線' : '檢查中'}
          </span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4 lg:py-8 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10">
        
        {/* LEFT PANEL: Input */}
        <section className="flex flex-col flex-1 gap-5 min-h-[500px]">
          {/* Input Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 items-center rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setInputMode('text')}
                className={`relative flex h-full items-center justify-center rounded-full px-5 transition-all text-xs font-bold ${
                  inputMode === 'text' ? 'bg-primary text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
              >
                直接輸入
              </button>
              <button 
                onClick={() => setInputMode('file')}
                className={`relative flex h-full items-center justify-center rounded-full px-5 transition-all text-xs font-bold ${
                  inputMode === 'file' ? 'bg-primary text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
              >
                上傳文檔
              </button>
              <button 
                onClick={() => setInputMode('url')}
                className={`relative flex h-full items-center justify-center rounded-full px-5 transition-all text-xs font-bold ${
                  inputMode === 'url' ? 'bg-primary text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
              >
                使用網址
              </button>
            </div>
            <div className="text-xs text-slate-400 font-medium px-2">
              {inputText.length} / 5000 字符
            </div>
          </div>

          {/* Input Card */}
          <div className="relative flex-1 bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 overflow-hidden group transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {inputMode === 'text' ? (
              <textarea 
                className="w-full h-full p-8 bg-transparent border-none outline-none resize-none text-base leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                placeholder="在此粘貼文本或輸入內容..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
            ) : inputMode === 'file' ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">upload_file</span>
                <p className="text-slate-500 dark:text-slate-400 mb-4">拖放文件或點擊上傳</p>
                <button className="px-6 py-2 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-all">選擇文件</button>
                <p className="text-xs text-slate-400 mt-4">支援 PDF, DOCX (最大 10MB)</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                  <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-6 block text-center">link</span>
                  <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <input 
                      type="url" 
                      placeholder="https://example.com/article" 
                      className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">請輸入包含文章內容的網址</p>
                </div>
              </div>
            )}

            {/* Bottom Toolbar inside input */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700" title="Clear"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
              <button 
                onClick={handlePaste}
                className="p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700" title="Paste"
              >
                <span className="material-symbols-outlined text-[20px]">content_paste</span>
              </button>
            </div>
          </div>
        </section>

        {/* CENTER: Action Cluster */}
        <section className="flex lg:flex-col items-center justify-center gap-6 shrink-0 py-4 lg:py-0 z-10">
          <div className="hidden lg:block h-full w-[1px] bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing || !inputText.trim()}
              className={`group relative flex size-20 lg:size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-all duration-300 ${
                isSummarizing || !inputText.trim() 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-primary text-slate-50 shadow-[0_8px_20px_-6px_rgba(43,140,238,0.5)] hover:-translate-y-1 hover:shadow-[0_12px_25px_-6px_rgba(43,140,238,0.6)] active:translate-y-0 active:scale-95'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center gap-1">
                {isSummarizing ? (
                  <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">auto_fix_high</span>
                )}
                <span className="text-xs font-bold tracking-wider">{isSummarizing ? '處理中' : '開始'}</span>
              </div>
            </button>
            <div className="flex flex-col items-center text-center gap-1.5 select-none">
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">一鍵摘要</p>
              <p className="text-sm font-medium text-slate-300 dark:text-slate-600 text-xs">快速找到重點</p>
            </div>
          </div>
          <div className="hidden lg:block h-full w-[1px] bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
        </section>

        {/* RIGHT PANEL: Output & History */}
        <section className="flex flex-col flex-1 gap-5 min-h-[500px]">
          {/* Output Header */}
          <div className="flex items-center justify-between h-12">
            <div className="flex gap-4">
              <button 
                onClick={() => setShowHistory(false)}
                className={`text-lg font-bold px-2 flex items-center gap-2 transition-colors ${!showHistory ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span className="material-symbols-outlined">stars</span>
                摘要結果
              </button>
              <button 
                onClick={() => {
                  setShowHistory(true)
                  fetchHistory()
                }}
                className={`text-lg font-bold px-2 flex items-center gap-2 transition-colors ${showHistory ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span className="material-symbols-outlined">history</span>
                歷史紀錄
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={!summaryResult || showHistory}
                className={`flex items-center justify-center size-9 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all ${
                  summaryResult ? 'text-slate-400 hover:text-primary hover:border-primary/30' : 'text-slate-200 dark:text-slate-800 cursor-not-allowed'
                }`} 
                title="Copy"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
              <button 
                disabled={!summaryResult || showHistory}
                className={`flex items-center justify-center size-9 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all ${
                  summaryResult ? 'text-slate-400 hover:text-primary hover:border-primary/30' : 'text-slate-200 dark:text-slate-800 cursor-not-allowed'
                }`} 
                title="Export"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
          </div>

          {/* Output Card */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 p-8 flex flex-col relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-transparent to-transparent dark:from-slate-700/20 dark:to-transparent pointer-events-none"></div>
            
            {!showHistory ? (
              /* Summary Result View */
              !summaryResult ? (
                /* Empty State Content */
                <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                  <div className="relative flex flex-col items-center gap-4 max-w-[280px]">
                    <div className="size-32 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                      <img 
                        alt="Preparing" 
                        className="w-full h-full object-cover opacity-60 dark:opacity-40" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdwICt4fRuCeUusUscTsmw5GKYbkIywuLZfctZHmw4D6xLOzs1c85CsdbskjwxhvDPvDfV9poYXcNh-lGONNTrg_YjytFz3jlVtwRdYQo6S1eLI33f_s_Q-s_2C66Zb5S64Vxd-yu7fVEzQC8db11b-ZkwJr9RqcZ5-N50L00yFD2x9V7ylx9kX2-F1tARpr1wGOWuMDoI67xdn1OlyB0d70eXaW4pfnZ7LcILqwn4nrlE4VwZxyL1V2SeQZsV5TV8yWcZN-JXQfU"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">準備就緒</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
                      請在左側輸入您的內容，AI 將為您生成精簡的摘要重點。
                    </p>
                  </div>
                </div>
              ) : (
                /* Summary Content */
                <div className="relative z-10 w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: ({node, inline, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {summaryResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            ) : (
              /* History List View */
              <div className="relative z-10 w-full h-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <span className="material-symbols-outlined text-6xl mb-2">folder_off</span>
                    <p>暫無歷史紀錄</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setSummaryResult(item.summaryText)
                        setShowHistory(false)
                      }}
                      className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                          {item.sourceType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.summaryText.replace(/[#*]/g, '')}
                      </p>
                      <button 
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        © 2024 Alpoint. Powered by Advanced AI Models.
      </footer>
    </div>
  )
}

export default App
