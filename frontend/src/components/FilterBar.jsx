import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard']
const SORT_OPTIONS = ['match_score', 'stars', 'recent']

export default function FilterBar({ recommendations, onFilter }) {
  const [difficulty, setDifficulty] = useState('all')
  const [sort, setSort] = useState('match_score')
  const [langFilter, setLangFilter] = useState('all')

  // Collect unique languages
  const langs = ['all', ...new Set(
    recommendations.map(r => r.issue.repo_language).filter(Boolean)
  )]

  const apply = (diff, s, lang) => {
    let filtered = [...recommendations]
    if (diff !== 'all') filtered = filtered.filter(r => r.difficulty === diff)
    if (lang !== 'all') filtered = filtered.filter(r => r.issue.repo_language === lang)

    filtered.sort((a, b) => {
      if (s === 'match_score') return b.match_score - a.match_score
      if (s === 'stars') return b.issue.repo_stars - a.issue.repo_stars
      if (s === 'recent') return new Date(b.issue.created_at) - new Date(a.issue.created_at)
      return 0
    })
    onFilter(filtered)
  }

  const handleDiff = (d) => { setDifficulty(d); apply(d, sort, langFilter) }
  const handleSort = (s) => { setSort(s); apply(difficulty, s, langFilter) }
  const handleLang = (l) => { setLangFilter(l); apply(difficulty, sort, l) }

  return (
    <div className="flex flex-wrap items-center gap-4 py-3 border-b border-terminal-border">
      <div className="flex items-center gap-1.5 text-xs text-terminal-muted font-mono">
        <SlidersHorizontal size={12} /> Filters
      </div>

      {/* Difficulty */}
      <div className="flex gap-1">
        {DIFFICULTIES.map(d => (
          <button key={d} onClick={() => handleDiff(d)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-mono transition-colors capitalize',
              difficulty === d
                ? 'bg-terminal-green text-terminal-bg font-semibold'
                : 'text-terminal-muted hover:text-terminal-green border border-terminal-border'
            )}
          >{d}</button>
        ))}
      </div>

      {/* Language */}
      <select
        value={langFilter}
        onChange={e => handleLang(e.target.value)}
        className="bg-terminal-card border border-terminal-border text-terminal-muted text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-terminal-green"
      >
        {langs.map(l => <option key={l} value={l}>{l === 'all' ? 'All languages' : l}</option>)}
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={e => handleSort(e.target.value)}
        className="bg-terminal-card border border-terminal-border text-terminal-muted text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-terminal-green"
      >
        <option value="match_score">Sort: Best match</option>
        <option value="stars">Sort: Most stars</option>
        <option value="recent">Sort: Most recent</option>
      </select>

      <span className="text-xs text-terminal-muted font-mono ml-auto">
        {recommendations.length} issues
      </span>
    </div>
  )
}
