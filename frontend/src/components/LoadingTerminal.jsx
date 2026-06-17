import { useEffect, useState } from 'react'

const STEPS = [
  { delay: 0,    text: '$ gh api /users/:username' },
  { delay: 800,  text: '→ analyzing repository languages...' },
  { delay: 1800, text: '→ computing skill profile...' },
  { delay: 2800, text: '$ gh search issues --label "good first issue"' },
  { delay: 3800, text: '→ scanning open issues...' },
  { delay: 4800, text: '→ running LLM skill-matching pipeline...' },
  { delay: 5800, text: '→ ranking by compatibility score...' },
  { delay: 6800, text: '✓ recommendations ready' },
]

export default function LoadingTerminal({ username }) {
  const [shown, setShown] = useState([])

  useEffect(() => {
    const timers = STEPS.map(({ delay, text }, i) =>
      setTimeout(() => setShown(prev => [...prev, text]), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="border border-terminal-border rounded-lg bg-terminal-card p-6 font-mono text-sm relative overflow-hidden scanline">
      <div className="flex items-center gap-2 mb-5 border-b border-terminal-border pb-3">
        <div className="w-3 h-3 rounded-full bg-rose-500/70" />
        <div className="w-3 h-3 rounded-full bg-amber-500/70" />
        <div className="w-3 h-3 rounded-full bg-terminal-green/70" />
        <span className="text-terminal-muted text-xs ml-2">oss-copilot — analyzing @{username}</span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {shown.map((line, i) => (
          <div key={i} className="flex items-center gap-2 fade-in">
            <span className={line.startsWith('$') ? 'text-terminal-green' : line.startsWith('✓') ? 'text-terminal-green' : 'text-terminal-muted'}>
              {line}
            </span>
          </div>
        ))}
        {shown.length < STEPS.length && (
          <div className="flex items-center gap-1 text-terminal-green">
            <span className="animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  )
}
