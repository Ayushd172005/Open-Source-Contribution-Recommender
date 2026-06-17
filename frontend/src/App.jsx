import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { Terminal, Github, Cpu, GitBranch } from 'lucide-react'

import { recommendationsApi } from './utils/api'
import SearchBar from './components/SearchBar'
import ProfileCard from './components/ProfileCard'
import IssueCard from './components/IssueCard'
import FilterBar from './components/FilterBar'
import LoadingTerminal from './components/LoadingTerminal'
import StatsSummary from './components/StatsSummary'

const EXAMPLES = ['torvalds', 'gvanrossum', 'sindresorhus', 'yyx990803']

export default function App() {
  const [loading, setLoading] = useState(false)
  const [currentUsername, setCurrentUsername] = useState('')
  const [result, setResult] = useState(null)
  const [filtered, setFiltered] = useState([])

  const handleSearch = async (username) => {
    setLoading(true)
    setCurrentUsername(username)
    setResult(null)

    try {
      const res = await recommendationsApi.get(username)
      setResult(res.data)
      setFiltered(res.data.recommendations)
      toast.success(`Found ${res.data.recommendations.length} matching issues`)
    } catch (e) {
      const msg = e.response?.data?.detail || 'Failed to analyze profile. Check your API keys.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Header */}
      <header className="border-b border-terminal-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-terminal-green rounded flex items-center justify-center">
            <Terminal size={15} className="text-terminal-green" />
          </div>
          <span className="font-mono font-bold text-terminal-green tracking-tight">oss-copilot</span>
          <span className="text-terminal-muted font-mono text-xs hidden sm:block">/ open source contribution recommender</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-terminal-muted hover:text-terminal-green font-mono transition-colors"
        >
          <Github size={13} /> Powered by GitHub API
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero */}
        {!result && !loading && (
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center gap-2 border border-terminal-green/30 rounded-full px-4 py-1.5 text-xs font-mono text-terminal-green mb-6">
              <Cpu size={11} /> AI-Powered Skill Matching
            </div>
            <h1 className="text-4xl font-bold text-terminal-green font-mono mb-3 tracking-tight">
              Find your first OSS contribution
            </h1>
            <p className="text-terminal-text/60 text-lg max-w-xl mx-auto leading-relaxed">
              Enter a GitHub username. We analyze the profile, find beginner-friendly issues,
              and match them to the developer's exact skill stack.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} loading={loading} />
          {!result && !loading && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-terminal-muted font-mono">try:</span>
              {EXAMPLES.map(u => (
                <button key={u} onClick={() => handleSearch(u)}
                  className="text-xs font-mono text-terminal-green hover:underline">
                  @{u}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <LoadingTerminal username={currentUsername} />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5 fade-in">
            <ProfileCard profile={result.profile} />
            <StatsSummary response={result} />

            {result.recommendations.length > 0 ? (
              <>
                <FilterBar recommendations={result.recommendations} onFilter={setFiltered} />
                <div className="space-y-3">
                  {filtered.map((rec, i) => (
                    <IssueCard key={rec.issue.id} rec={rec} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <div className="border border-terminal-border rounded-lg p-8 text-center">
                <GitBranch size={32} className="mx-auto text-terminal-dim mb-3" />
                <p className="text-terminal-muted font-mono text-sm">No matching issues found.</p>
                <p className="text-terminal-dim font-mono text-xs mt-1">
                  Try a different username or check back later.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f1510',
            border: '1px solid #1a2e1a',
            color: '#c8e6c8',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}
