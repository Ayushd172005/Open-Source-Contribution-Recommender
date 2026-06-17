import { useState } from 'react'
import { Search, Terminal, Loader2 } from 'lucide-react'

export default function SearchBar({ onSearch, loading }) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) onSearch(username.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-3 border border-terminal-border rounded-lg bg-terminal-card px-4 py-3 focus-within:border-terminal-green transition-all">
        <Terminal size={16} className="text-terminal-green flex-shrink-0" />
        <span className="text-terminal-muted font-mono text-sm">github.com/</span>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="username"
          autoFocus
          className="flex-1 bg-transparent text-terminal-text font-mono text-sm placeholder-terminal-dim focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="flex items-center gap-2 px-4 py-1.5 bg-terminal-green text-terminal-bg text-sm font-semibold font-mono rounded-md hover:bg-terminal-green2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {loading ? 'Analyzing...' : 'Find Issues'}
        </button>
      </div>
    </form>
  )
}
