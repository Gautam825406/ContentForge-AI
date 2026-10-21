import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BookOpenText,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Copy,
  FileText,
  Languages,
  LoaderCircle,
  PenLine,
  Plus,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8097'
const languages = [
  { value: '', label: 'No translation' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Japanese', label: 'Japanese' },
]

function LandingPage({ onOpenStudio }) {
  return (
    <div className="landing-page" id="home">
      <header className="landing-nav">
        <a className="brand landing-brand" href="#home" aria-label="ContentForge home">
          <span className="brand-mark"><PenLine size={17} strokeWidth={2.3} /></span>
          <span>content<span className="brand-light">forge</span></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#what-you-get">What you get</a>
        </nav>
        <button className="landing-nav-cta" type="button" onClick={onOpenStudio}>Open the studio <ArrowUpRight size={15} /></button>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <div className="landing-eyebrow"><span /> THE EDITORIAL STUDIO FOR YOUR NEXT BIG IDEA</div>
            <h1 id="landing-title">Good ideas deserve <em>good stories.</em></h1>
            <p>Turn a topic or transcript into a thoughtful, structured first draft. Keep your voice, find your angle, and get back to the work only you can do.</p>
            <div className="landing-actions">
              <button className="landing-primary" type="button" onClick={onOpenStudio}>Start a draft <ArrowUpRight size={17} /></button>
              <a className="landing-secondary" href="#how-it-works"><span><BookOpenText size={16} /></span> See how it works</a>
            </div>
            <div className="landing-proof"><span><Check size={13} /> Topic or transcript</span><span><Check size={13} /> Your choice of voice</span><span><Check size={13} /> Optional translation</span></div>
          </div>

          <div className="landing-preview" aria-label="Preview of the ContentForge writing studio">
            <div className="preview-topbar"><span className="preview-brand"><span><PenLine size={12} /></span> contentforge <small>/ studio</small></span><span className="preview-status"><i /> READY TO WRITE</span></div>
            <div className="preview-content">
              <div className="preview-input">
                <div className="preview-step">01 <span>THE STARTING POINT</span></div>
                <h2>What are we writing about?</h2>
                <div className="preview-tabs"><span className="selected"><Sparkles size={12} /> A topic</span><span><FileText size={12} /> A transcript</span></div>
                <div className="preview-text"><strong>YOUR IDEA</strong><span>Why neighborhood bookstores are finding new life</span><i /><i /><i /></div>
                <div className="preview-settings"><span>VOICE <b>Warm and insightful</b></span><span>LENGTH <b>~1,200 words</b></span></div>
                <div className="preview-generate"><WandSparkles size={14} /> Generate my first draft <ArrowUpRight size={13} /></div>
              </div>
              <div className="preview-output">
                <div className="preview-step">02 <span>THE FIRST DRAFT</span></div>
                <span className="preview-draft-label"><i /> FIRST DRAFT</span>
                <h3>More Than Shelves: The Neighborhood Bookstore Finds Its Next Chapter</h3>
                <p className="preview-lede">Independent bookstores are doing more than selling books. They are building places where a neighborhood can meet itself.</p>
                <div className="preview-rule" />
                <h4>A place to find your people</h4>
                <p>In a world of one-click convenience, the local bookshop offers something harder to ship: a sense of belonging...</p>
                <div className="preview-output-footer"><span><Check size={12} /> Draft generated</span><span><Languages size={12} /> Translate</span></div>
              </div>
            </div>
          </div>
          <div className="landing-caption"><span>YOUR IDEA, WITH ROOM TO BECOME SOMETHING</span><span>01 — 02</span></div>
        </section>

        <section className="landing-process" id="how-it-works">
          <div className="process-heading"><span className="landing-eyebrow"><span /> A CLEAR PATH FROM SPARK TO STORY</span><h2>Start with what you have.</h2><p>No blank-page ritual required. Bring the seed of an idea; leave with a draft you can make your own.</p></div>
          <div className="process-steps">
            <article><span className="process-number">01</span><div className="process-icon"><Sparkles size={18} /></div><h3>Bring the raw material</h3><p>Start from a single topic or paste in a video transcript. The story starts where you are.</p></article>
            <article><span className="process-number">02</span><div className="process-icon coral"><BookOpenText size={18} /></div><h3>Shape the first draft</h3><p>Set the voice, audience, and length. ContentForge finds an angle and gives it structure.</p></article>
            <article id="what-you-get"><span className="process-number">03</span><div className="process-icon blue"><Languages size={18} /></div><h3>Make it yours</h3><p>Review the draft, explore title ideas, copy your work, or request a translation.</p></article>
          </div>
          <div className="process-bottom"><span>Made for the stories only you can tell.</span><button type="button" onClick={onOpenStudio}>Write your first draft <ArrowUpRight size={15} /></button></div>
        </section>
      </main>
      <footer className="landing-footer"><a className="brand landing-brand" href="#home"><span className="brand-mark"><PenLine size={15} strokeWidth={2.3} /></span><span>content<span className="brand-light">forge</span></span></a><span>Thoughtful drafts. Yours to shape.</span><span>CONTENTFORGE AI · STUDIO</span></footer>
    </div>
  )
}

function articleToMarkdown(title, article) {
  const sections = article.sections
    .map((section) => `## ${section.heading}\n\n${section.body}`)
    .join('\n\n')

  return `# ${title}\n\n${article.introduction}\n\n${sections}\n\n${article.conclusion}`
}

function App() {
  const [showStudio, setShowStudio] = useState(false)
  const [sourceType, setSourceType] = useState('topic')
  const [source, setSource] = useState('')
  const [tone, setTone] = useState('Warm and insightful')
  const [audience, setAudience] = useState('Curious readers')
  const [length, setLength] = useState(1200)
  const [targetLanguage, setTargetLanguage] = useState('')
  const [result, setResult] = useState(null)
  const [viewLanguage, setViewLanguage] = useState('original')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState('checking')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/ready`)
      .then(async (response) => ({ response, body: await response.json() }))
      .then(({ response, body }) => {
        if (!alive) return
        setApiStatus(response.ok && body.groq_configured ? 'ready' : 'setup')
      })
      .catch(() => {
        if (alive) setApiStatus('offline')
      })

    return () => {
      alive = false
    }
  }, [])

  async function generateArticle(event) {
    event.preventDefault()
    if (!source.trim()) {
      setError(`Add a ${sourceType === 'topic' ? 'topic' : 'transcript'} to get started.`)
      return
    }

    setIsGenerating(true)
    setError('')
    setResult(null)
    setViewLanguage('original')

    try {
      const response = await fetch(`${API_BASE}/api/v1/blogs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [sourceType]: source.trim(),
          audience: audience.trim() || null,
          tone,
          target_length_words: length,
          target_language: targetLanguage || null,
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error?.message || 'The draft could not be generated.')
      }

      setResult(payload)
      setApiStatus('ready')
    } catch (generationError) {
      setError(generationError.message || 'Could not connect to the ContentForge API.')
      if (generationError instanceof TypeError) setApiStatus('offline')
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyDraft() {
    const translated = viewLanguage === 'translated' && result?.translation
    const article = translated ? result.translation.article : result?.article
    const title = translated ? result.title : result?.title
    if (!article) return

    await navigator.clipboard.writeText(articleToMarkdown(title, article))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const selectedArticle =
    viewLanguage === 'translated' && result?.translation
      ? result.translation.article
      : result?.article
  const selectedTitle =
    viewLanguage === 'translated' && result?.translation
      ? result.translation.title
      : result?.title
  const statusLabel = {
    checking: 'Checking connection',
    ready: 'Groq connected',
    setup: 'Add Groq API key',
    offline: 'API offline',
  }[apiStatus]

  if (!showStudio) return <LandingPage onOpenStudio={() => setShowStudio(true)} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="ContentForge home" onClick={(event) => { event.preventDefault(); setShowStudio(false) }}>
          <span className="brand-mark"><PenLine size={17} strokeWidth={2.3} /></span>
          <span>content<span className="brand-light">forge</span></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">S</span>
          <span className="workspace-name">Studio workspace<small>Personal studio</small></span>
          <ChevronDown size={15} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Workspace">
          <a href="#compose" className="nav-item active"><Plus size={17} /> New draft</a>
          <button className="nav-item" type="button" onClick={() => setResult(null)}><FileText size={17} /> Drafts <span className="nav-count">01</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className={`connection-card ${apiStatus}`}>
            <span className="connection-dot" />
            <span><strong>{statusLabel}</strong><small>{apiStatus === 'ready' ? 'Ready to write' : apiStatus === 'setup' ? 'Backend needs configuration' : apiStatus === 'offline' ? 'Start the local API' : 'Connecting to your API'}</small></span>
            <span className="connection-pulse" />
          </div>
          <button className="help-link" type="button" title="Setup and help"><CircleHelp size={16} /> Help & setup <ArrowUpRight size={13} /></button>
          <div className="profile-row"><span className="profile-avatar">CF</span><span>Content creator<small>Free workspace</small></span><ChevronDown size={14} /></div>
        </div>
      </aside>

      <main id="top" className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>New draft</strong></div>
          <div className="topbar-actions"><span className="shortcut"><Command size={13} /> K</span><button className="icon-button" title="Help"><CircleHelp size={18} /></button><span className="top-avatar">S</span></div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR EDITORIAL STUDIO</div><h1>Make something worth reading.</h1><p>Start with an idea, leave with a first draft.</p></div>
            <div className="heading-note"><span className="note-icon"><Sparkles size={16} /></span><span>Thoughtful drafts,<br /><strong>made in a few minutes.</strong></span></div>
          </div>

          <div className="editor-grid">
            <section id="compose" className="compose-panel" aria-labelledby="source-title">
              <div className="panel-topline"><div className="step-label"><span>01</span> THE STARTING POINT</div><span className="private-label"><span /> New draft</span></div>
              <h2 id="source-title">What are we writing about?</h2>
              <p className="panel-description">Give your idea some shape. You can refine the details later.</p>

              <div className="source-tabs" role="tablist" aria-label="Choose source type">
                <button role="tab" aria-selected={sourceType === 'topic'} className={sourceType === 'topic' ? 'source-tab selected' : 'source-tab'} onClick={() => { setSourceType('topic'); setSource(''); setError('') }} type="button"><Sparkles size={15} /> A topic</button>
                <button role="tab" aria-selected={sourceType === 'transcript'} className={sourceType === 'transcript' ? 'source-tab selected' : 'source-tab'} onClick={() => { setSourceType('transcript'); setSource(''); setError('') }} type="button"><FileText size={15} /> A transcript</button>
              </div>

              <form onSubmit={generateArticle}>
                <label className="field-label" htmlFor="source-input">{sourceType === 'topic' ? 'YOUR IDEA' : 'VIDEO TRANSCRIPT'}<span>{sourceType === 'topic' ? 'A sentence is plenty' : `${source.trim().split(/\s+/).filter(Boolean).length} words`}</span></label>
                <textarea id="source-input" className={`source-input ${sourceType}`} value={source} onChange={(event) => setSource(event.target.value)} placeholder={sourceType === 'topic' ? 'e.g. Why small neighborhood bookstores are finding new life' : 'Paste the transcript here. We’ll find the story inside it…'} rows={sourceType === 'topic' ? 5 : 8} maxLength={sourceType === 'topic' ? 5000 : 40000} />
                <div className="input-footnote"><span>{source.length.toLocaleString()} / {sourceType === 'topic' ? '5,000' : '40,000'} characters</span><span><span className="autosave-dot" /> Ready to generate</span></div>

                <div className="section-rule"><span>Make it yours</span></div>
                <div className="options-grid">
                  <label className="option-field">VOICE<select value={tone} onChange={(event) => setTone(event.target.value)}><option>Warm and insightful</option><option>Clear and practical</option><option>Playful and conversational</option><option>Confident and expert</option><option>Thoughtful and analytical</option></select></label>
                  <label className="option-field">FOR WHOM?<input value={audience} onChange={(event) => setAudience(event.target.value)} maxLength={100} placeholder="Curious readers" /></label>
                </div>
                <div className="length-row"><label htmlFor="length-range">LENGTH</label><input id="length-range" type="range" min="600" max="2000" step="200" value={length} onChange={(event) => setLength(Number(event.target.value))} /><span className="length-value">~{length.toLocaleString()} <small>words</small></span></div>

                <label className="option-field language-field">TRANSLATE AFTER WRITING<span className="select-wrap"><Languages size={15} /><select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>{languages.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select><ChevronDown size={14} /></span></label>

                {apiStatus === 'setup' && <div className="setup-message" role="status">Add <code>GROQ_API_KEY</code> to the backend <code>.env</code> file, then restart the API.</div>}
                {apiStatus === 'offline' && <div className="setup-message" role="status">Start the FastAPI service to connect this workspace.</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                <button className="generate-button" type="submit" disabled={isGenerating || apiStatus === 'offline' || apiStatus === 'setup'}><span>{isGenerating ? <LoaderCircle className="spin" size={18} /> : <WandSparkles size={18} />}</span>{isGenerating ? 'Finding the story…' : 'Generate my first draft'}<ArrowUpRight size={16} /></button>
                <div className="generate-caption"><Clock3 size={13} /> Usually ready in under a minute <span className="caption-separator">·</span> Powered by Groq</div>
              </form>
            </section>

            <section className={`draft-panel ${result ? 'has-result' : ''}`} aria-labelledby="draft-title">
              <div className="draft-header"><div><div className="step-label"><span>02</span> THE FIRST DRAFT</div><h2 id="draft-title">Your story, taking shape</h2></div><div className="draft-actions">{result && <button className="icon-button copy-button" onClick={copyDraft} title="Copy draft as Markdown" type="button">{copied ? <Check size={17} /> : <Copy size={17} />}<span>{copied ? 'Copied' : 'Copy'}</span></button>}</div></div>

              {isGenerating ? (
                <div className="generating-state"><div className="generating-mark"><LoaderCircle size={23} className="spin" /></div><span className="eyebrow">WORKING THROUGH YOUR IDEA</span><h3>Finding the thread.</h3><p>Brainstorming titles, shaping the article, and polishing the flow.</p><div className="progress-track"><span /></div><div className="workflow-steps"><span className="complete"><Check size={13} /> Title ideas</span><span className="current"><LoaderCircle size={13} className="spin" /> Writing draft</span><span><Languages size={13} /> Translation</span></div></div>
              ) : result && selectedArticle ? (
                <article className="article-preview">
                  <div className="article-meta"><span className="draft-badge"><span /> FIRST DRAFT</span><span>{result.source_type === 'topic' ? 'From your topic' : 'From your transcript'}</span></div>
                  {result.translation && <div className="language-toggle" role="group" aria-label="Draft language"><button type="button" className={viewLanguage === 'original' ? 'active' : ''} onClick={() => setViewLanguage('original')}>Original</button><button type="button" className={viewLanguage === 'translated' ? 'active' : ''} onClick={() => setViewLanguage('translated')}>{result.translation.language}</button></div>}
                  <h3>{selectedTitle}</h3>
                  {viewLanguage === 'original' && <div className="title-ideas"><span>ALSO CONSIDER</span>{result.title_candidates.filter((title) => title !== result.title).map((title) => <span className="title-chip" key={title}>{title}</span>)}</div>}
                  <div className="article-body"><p className="article-intro">{selectedArticle.introduction}</p>{selectedArticle.sections.map((section, index) => <section className="article-section" key={`${section.heading}-${index}`}><h4>{section.heading}</h4><p>{section.body}</p></section>)}<p className="article-conclusion">{selectedArticle.conclusion}</p></div>
                  <div className="article-footer"><span><Check size={14} /> Draft generated</span><span>Review before publishing</span></div>
                </article>
              ) : (
                <div className="empty-draft"><div className="empty-art"><div className="paper-back" /><div className="paper-front"><span /><span /><span /><span /><span /></div><div className="sparkle-one"><Sparkles size={16} /></div><div className="sparkle-two"><span /></div></div><span className="empty-kicker">A BLANK PAGE, IN THE BEST WAY</span><h3>Your next good read<br />starts right here.</h3><p>Your draft will appear here, ready for a little human magic.</p><div className="empty-hint"><BookOpenText size={15} /><span>One idea in. A story out.</span></div></div>
              )}
              <div className="draft-footer"><span><span className="privacy-mark">✳</span> Your work stays yours</span><span>ContentForge <span className="footer-separator">/</span> Studio <ArrowUpRight size={12} /></span></div>
            </section>
          </div>
          <footer className="page-footer"><span>Made for the stories only you can tell.</span><span><span className="footer-dot" /> All systems {apiStatus === 'ready' ? 'operational' : 'local'}</span></footer>
        </section>
      </main>
    </div>
  )
}

export default App
