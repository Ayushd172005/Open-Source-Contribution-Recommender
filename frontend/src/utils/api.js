import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
})

export const profileApi = {
  get: (username) => api.get(`/github/profile/${username}`),
}

export const recommendationsApi = {
  get: (username, options = {}) =>
    api.post('/recommendations/', {
      username,
      max_results: options.maxResults || 10,
      include_languages: options.languages || null,
      difficulty_filter: options.difficulty || null,
    }),
}

export const issuesApi = {
  search: (languages, labels, minStars = 100) =>
    api.post('/issues/search', { languages, labels, min_stars: minStars }),
}

export default api
