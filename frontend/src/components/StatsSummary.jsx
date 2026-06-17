import { Target, Layers, Clock } from 'lucide-react'

export default function StatsSummary({ response }) {
  const { recommendations, total_issues_scanned, search_languages, summary } = response

  const avgScore = recommendations.length
    ? Math.round(recommendations.reduce((s, r) => s + r.match_score, 0) / recommendations.length)
    : 0

  const easyCnt = recommendations.filter(r => r.difficulty === 'easy').length
  const medCnt = recommendations.filter(r => r.difficulty === 'medium').length

  return (
    <div className="border border-terminal-border rounded-lg bg-terminal-card p-5 fade-in">
      <p className="text-sm text-terminal-text/80 leading-relaxed mb-4 font-sans">{summary}</p>
      <div className="grid grid-cols-3 gap-3 border-t border-terminal-border pt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-terminal-green font-mono">{recommendations.length}</p>
          <p className="text-[10px] text-terminal-muted uppercase tracking-widest font-mono mt-0.5">matches found</p>
        </div>
        <div className="text-center border-x border-terminal-border">
          <p className="text-2xl font-bold text-terminal-green font-mono">{total_issues_scanned}</p>
          <p className="text-[10px] text-terminal-muted uppercase tracking-widest font-mono mt-0.5">issues scanned</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-terminal-green font-mono">{avgScore}</p>
          <p className="text-[10px] text-terminal-muted uppercase tracking-widest font-mono mt-0.5">avg match %</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[11px] text-terminal-muted font-mono">searched:</span>
        {search_languages.map(l => (
          <span key={l} className="text-[11px] px-2 py-0.5 border border-terminal-border rounded font-mono text-terminal-text">
            {l}
          </span>
        ))}
        <span className="ml-auto text-[11px] font-mono text-terminal-green">
          {easyCnt} easy · {medCnt} medium
        </span>
      </div>
    </div>
  )
}
