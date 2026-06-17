import { Github, MapPin, Users, Star, GitFork, Code2, Calendar } from 'lucide-react'

const SKILL_COLORS = {
  beginner: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
  intermediate: 'text-sky-400 border-sky-400/30 bg-sky-400/5',
  advanced: 'text-terminal-green border-terminal-green/30 bg-terminal-green/5',
}

const LANG_COLORS = [
  'bg-terminal-green/20 text-terminal-green',
  'bg-sky-400/20 text-sky-400',
  'bg-violet-400/20 text-violet-400',
  'bg-amber-400/20 text-amber-400',
  'bg-rose-400/20 text-rose-400',
]

export default function ProfileCard({ profile }) {
  const topLangs = Object.entries(profile.top_languages).slice(0, 6)
  const totalBytes = topLangs.reduce((s, [, b]) => s + b, 0)

  return (
    <div className="border border-terminal-border rounded-lg overflow-hidden bg-terminal-card fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 border-b border-terminal-border">
        <div className="relative">
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-16 h-16 rounded-lg border border-terminal-border"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-terminal-green border-2 border-terminal-bg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-terminal-text font-mono">
              {profile.name || profile.username}
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded border font-mono font-medium ${SKILL_COLORS[profile.skill_level]}`}>
              {profile.skill_level}
            </span>
          </div>
          <a
            href={`https://github.com/${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-terminal-muted hover:text-terminal-green transition-colors mt-0.5 font-mono"
          >
            <Github size={13} />
            @{profile.username}
          </a>
          {profile.bio && (
            <p className="text-sm text-terminal-text/70 mt-2 leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-terminal-border divide-x divide-terminal-border">
        {[
          { icon: Code2, label: 'repos', value: profile.public_repos },
          { icon: Star, label: 'stars', value: profile.total_stars },
          { icon: Users, label: 'followers', value: profile.followers },
          { icon: Calendar, label: 'years', value: profile.account_age_years },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center justify-center py-3 px-2">
            <span className="text-xl font-bold text-terminal-green font-mono">{value}</span>
            <span className="text-[10px] text-terminal-muted uppercase tracking-widest mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Language bar */}
      <div className="p-5">
        <p className="text-[10px] text-terminal-muted uppercase tracking-widest mb-3 font-mono">
          Language Breakdown
        </p>
        <div className="flex rounded-full overflow-hidden h-2 mb-3 gap-px">
          {topLangs.map(([lang, bytes], i) => (
            <div
              key={lang}
              style={{ width: `${(bytes / totalBytes) * 100}%` }}
              className={`h-full ${['bg-terminal-green', 'bg-sky-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400', 'bg-orange-400'][i] || 'bg-terminal-dim'}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {topLangs.map(([lang, bytes], i) => (
            <span key={lang} className={`text-xs px-2 py-0.5 rounded font-mono ${LANG_COLORS[i] || 'bg-terminal-dim/30 text-terminal-muted'}`}>
              {lang} <span className="opacity-60">{((bytes / totalBytes) * 100).toFixed(0)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Location / info */}
      {(profile.location || profile.company) && (
        <div className="px-5 pb-4 flex gap-4 flex-wrap">
          {profile.location && (
            <span className="flex items-center gap-1.5 text-xs text-terminal-muted font-mono">
              <MapPin size={11} /> {profile.location}
            </span>
          )}
          {profile.company && (
            <span className="text-xs text-terminal-muted font-mono">@ {profile.company}</span>
          )}
        </div>
      )}
    </div>
  )
}
