import { useState } from 'react'
import { ExternalLink, Star, MessageSquare, Clock, Zap, BookOpen, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import clsx from 'clsx'

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'text-terminal-green border-terminal-green/30 bg-terminal-green/5' },
  medium: { label: 'Medium', color: 'text-amber-400 border-amber-400/30 bg-amber-400/5' },
  hard: { label: 'Hard', color: 'text-rose-400 border-rose-400/30 bg-rose-400/5' },
}

function ScoreRing({ score }) {
  const color = score >= 80 ? '#00d26a' : score >= 60 ? '#fbbf24' : '#94a3b8'
  const r = 20, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={r} fill="none" stroke="#1a2e1a" strokeWidth="4" />
        <circle cx="25" cy="25" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono"
        style={{ color }}>{Math.round(score)}</span>
    </div>
  )
}

export default function IssueCard({ rec, index }) {
  const [expanded, setExpanded] = useState(false)
  const { issue, match_score, match_reasons, difficulty, estimated_time,
    why_good_fit, skills_you_ll_use, skills_you_ll_learn, contribution_tips } = rec

  const diff = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy

  return (
    <div className={`border border-terminal-border rounded-lg bg-terminal-card fade-in overflow-hidden transition-all
      hover:border-terminal-green/40`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <ScoreRing score={match_score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <a
                href={issue.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-terminal-text hover:text-terminal-green transition-colors leading-snug flex items-start gap-1.5 group"
              >
                {issue.title}
                <ExternalLink size={12} className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded border font-mono ${diff.color}`}>
                {diff.label}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap mt-1.5">
              <a href={`https://github.com/${issue.repo_full_name}`} target="_blank" rel="noreferrer"
                className="text-xs text-terminal-green font-mono hover:underline">
                {issue.repo_full_name}
              </a>
              {issue.repo_language && (
                <span className="text-xs text-terminal-muted font-mono">{issue.repo_language}</span>
              )}
              <span className="flex items-center gap-1 text-xs text-terminal-muted font-mono">
                <Star size={10} /> {issue.repo_stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-xs text-terminal-muted font-mono">
                <MessageSquare size={10} /> {issue.comments}
              </span>
              <span className="flex items-center gap-1 text-xs text-terminal-muted font-mono">
                <Clock size={10} /> {estimated_time}
              </span>
            </div>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {issue.labels.slice(0, 4).map(l => (
                  <span key={l} className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 bg-terminal-dim/30 text-terminal-muted rounded font-mono">
                    <Tag size={9} /> {l}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Why good fit */}
        {why_good_fit && (
          <p className="mt-3 ml-18 text-sm text-terminal-text/70 leading-relaxed pl-[4.5rem]">
            {why_good_fit}
          </p>
        )}

        {/* Match reasons (mini pills) */}
        {match_reasons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 pl-[4.5rem]">
            {match_reasons.map((r, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 bg-terminal-green/8 text-terminal-green border border-terminal-green/20 rounded font-mono">
                ✓ {r}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-terminal-border text-[11px] text-terminal-muted hover:text-terminal-green font-mono transition-colors"
      >
        {expanded ? <><ChevronUp size={12} /> Hide details</> : <><ChevronDown size={12} /> View skills & tips</>}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-terminal-border grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-terminal-border">
          <div className="p-4">
            <p className="text-[10px] font-mono text-terminal-muted uppercase tracking-widest mb-2 flex items-center gap-1">
              <Zap size={10} /> Skills Used
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills_you_ll_use.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 bg-sky-400/10 text-sky-400 rounded font-mono">{s}</span>
              ))}
            </div>
          </div>
          <div className="p-4">
            <p className="text-[10px] font-mono text-terminal-muted uppercase tracking-widest mb-2 flex items-center gap-1">
              <BookOpen size={10} /> You'll Learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills_you_ll_learn.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 bg-violet-400/10 text-violet-400 rounded font-mono">{s}</span>
              ))}
            </div>
          </div>
          <div className="p-4">
            <p className="text-[10px] font-mono text-terminal-muted uppercase tracking-widest mb-2">Tips</p>
            <ul className="space-y-1">
              {contribution_tips.map((tip, i) => (
                <li key={i} className="text-xs text-terminal-text/70 font-mono flex items-start gap-1.5">
                  <span className="text-terminal-green mt-0.5">›</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
