import { useState, useEffect } from 'react'
import Login from './components/Login.jsx'
import Analytics from './components/Analytics.jsx'
import Reports from './components/Reports.jsx'
import AIInsights from './components/AIInsights.jsx'
import QueryDetails from './components/QueryDetails.jsx'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api'

function App() {
  const [user, setUser] = useState(null)
  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem('currentTab') || 'queries'
  })
  const [queries, setQueries] = useState([])
  const [filteredQueries, setFilteredQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [newQuery, setNewQuery] = useState({ content: '', channel: 'email', priority: 'medium', customer_email: '', customer_name: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    // Handle browser back/forward
    const handlePopState = (event) => {
      const tab = event.state?.tab || 'queries'
      setCurrentTab(tab)
      localStorage.setItem('currentTab', tab)
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (user) {
      fetchQueries()
    }
  }, [user])

  useEffect(() => {
    // Remove duplicates based on query content and customer
    const uniqueQueries = queries.filter((query, index, self) => 
      index === self.findIndex(q => 
        q.content === query.content && 
        q.customer_name === query.customer_name
      )
    )
    
    let filtered = uniqueQueries
    
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter)
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(q => q.priority === priorityFilter)
    }
    
    setFilteredQueries(filtered)
  }, [queries, searchTerm, statusFilter, priorityFilter])

  const fetchQueries = async (retries = 3) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/queries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setQueries(data)
    } catch (error) {
      console.error('Error fetching queries:', error)
      if (retries > 0 && error.message.includes('Failed to fetch')) {
        setTimeout(() => fetchQueries(retries - 1), 1000)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const updateQuery = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE}/queries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      fetchQueries()
    } catch (error) {
      console.error('Error updating query:', error)
    }
  }

  const createQuery = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuery)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setNewQuery({ content: '', channel: 'email', priority: 'medium' })
      setShowNewForm(false)
      fetchQueries()
    } catch (error) {
      console.error('Error creating query:', error)
    }
  }

  const getStats = () => {
    const total = queries.length
    const open = queries.filter(q => q.status === 'open').length
    const inProgress = queries.filter(q => q.status === 'in_progress').length
    const high = queries.filter(q => q.priority === 'high').length
    return { total, open, inProgress, high }
  }

  const stats = getStats()

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  if (loading) return <div className="app">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 font-sans" style={{fontFamily: 'Poppins, system-ui, -apple-system, sans-serif'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-sm border border-emerald-500 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-teal-50 mb-3 drop-shadow-lg">QueryFlow</h1>
              <p className="text-lg text-emerald-50 drop-shadow-md">Enterprise Query Management</p>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <button 
                className={`flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  currentTab === 'queries' 
                    ? 'bg-white text-emerald-700 shadow-lg' 
                    : 'text-white hover:bg-white/20 hover:shadow-md'
                }`}
                onClick={() => {
                  setCurrentTab('queries')
                  localStorage.setItem('currentTab', 'queries')
                  window.history.pushState({tab: 'queries'}, '', '#queries')
                }}
              >
                <span className="text-lg">📋</span>
                Queries
              </button>
              <button 
                className={`flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  currentTab === 'analytics' 
                    ? 'bg-white text-emerald-700 shadow-lg' 
                    : 'text-white hover:bg-white/20 hover:shadow-md'
                }`}
                onClick={() => {
                  setCurrentTab('analytics')
                  localStorage.setItem('currentTab', 'analytics')
                  window.history.pushState({tab: 'analytics'}, '', '#analytics')
                }}
              >
                <span className="text-lg">📊</span>
                Analytics
              </button>
              <button 
                className={`flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  currentTab === 'reports' 
                    ? 'bg-white text-emerald-700 shadow-lg' 
                    : 'text-white hover:bg-white/20 hover:shadow-md'
                }`}
                onClick={() => {
                  setCurrentTab('reports')
                  localStorage.setItem('currentTab', 'reports')
                  window.history.pushState({tab: 'reports'}, '', '#reports')
                }}
              >
                <span className="text-lg">📈</span>
                Reports
              </button>
              <button 
                className={`flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  currentTab === 'ai' 
                    ? 'bg-white text-emerald-700 shadow-lg' 
                    : 'text-white hover:bg-white/20 hover:shadow-md'
                }`}
                onClick={() => {
                  setCurrentTab('ai')
                  localStorage.setItem('currentTab', 'ai')
                  window.history.pushState({tab: 'ai'}, '', '#ai')
                }}
              >
                <span className="text-lg">🤖</span>
                AI Insights
              </button>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-medium text-teal-100">Welcome, {user.name}</span>
              <button 
                className="px-3 py-2 text-sm font-medium text-white bg-white/20 border border-white/30 rounded-md hover:bg-white/30 transition-colors backdrop-blur-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

      {currentTab === 'analytics' && <Analytics />}
      {currentTab === 'reports' && <Reports />}
      {currentTab === 'ai' && <AIInsights />}
      
      {currentTab === 'queries' && (
        <>
        {/* Header */}

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-blue-800">Unified inbox for all customer queries and support requests</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📬</span>
              <span className="text-lg font-medium text-gray-800">{stats.total} Total Queries</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-blue-700 mb-1">{stats.total}</h3>
                <p className="text-sm font-medium text-blue-600">Total Queries</p>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <span className="text-white text-xl">🔓</span>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-yellow-700 mb-1">{stats.open}</h3>
                <p className="text-sm font-medium text-yellow-600">Open</p>
              </div>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.open / stats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-purple-700 mb-1">{stats.inProgress}</h3>
                <p className="text-sm font-medium text-purple-600">In Progress</p>
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500 p-3 rounded-lg">
                <span className="text-white text-xl">🚨</span>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-red-700 mb-1">{stats.high}</h3>
                <p className="text-sm font-medium text-red-600">High Priority</p>
              </div>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <span className="text-white text-lg">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filter & Search</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search queries by content, customer, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-gray-50 hover:bg-white"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-gray-50 hover:bg-white font-medium"
            >
              <option value="all">📋 All Status</option>
              <option value="open">🔓 Open</option>
              <option value="in_progress">⚡ In Progress</option>
              <option value="closed">✅ Closed</option>
            </select>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-gray-50 hover:bg-white font-medium"
            >
              <option value="all">🎯 All Priority</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => setShowNewForm(!showNewForm)}
            >
              <span className="text-lg">➕</span>
              New Query
            </button>
          </div>
        </div>

        {showNewForm && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500 p-3 rounded-xl">
                <span className="text-white text-xl">✍️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Create New Query</h3>
            </div>
            <form onSubmit={createQuery} className="space-y-6">
              <div className="bg-white rounded-xl p-4 border border-indigo-200">
                <textarea
                  placeholder="📝 Describe the customer query or issue in detail..."
                  value={newQuery.content}
                  onChange={(e) => setNewQuery({...newQuery, content: e.target.value})}
                  required
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-vertical min-h-[120px] bg-gray-50 hover:bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-indigo-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">📱 Channel</label>
                  <select
                    value={newQuery.channel}
                    onChange={(e) => setNewQuery({...newQuery, channel: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-gray-50 hover:bg-white font-medium"
                  >
                    <option value="email">✉️ Email</option>
                    <option value="social">📱 Social Media</option>
                    <option value="chat">💬 Live Chat</option>
                  </select>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Priority Level</label>
                  <select
                    value={newQuery.priority}
                    onChange={(e) => setNewQuery({...newQuery, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-gray-50 hover:bg-white font-medium"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-lg">🚀</span>
                  Create Query
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  onClick={() => setShowNewForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <span className="text-white text-lg">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">List ({filteredQueries.length})</h3>
            </div>
          </div>
          {filteredQueries.map(query => (
            <div key={query.id} className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-lg flex-shrink-0">
                      <span className="text-lg">💬</span>
                    </div>
                    <div className="flex-1">
                      <p 
                        className="text-gray-900 mb-2 leading-relaxed cursor-pointer hover:text-indigo-600 transition-colors font-medium group-hover:text-indigo-700"
                        onClick={() => setSelectedQuery(query)}
                      >
                        {query.content}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <span>👤</span>
                          {query.customer_name || 'Anonymous'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          {new Date(query.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 ml-12">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                      (query.priority || 'medium') === 'high' 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : (query.priority || 'medium') === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      <span>{(query.priority || 'medium') === 'high' ? '🔴' : (query.priority || 'medium') === 'medium' ? '🟡' : '🟢'}</span>
                      {(query.priority || 'medium').toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                      (query.status || 'open') === 'open'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : (query.status || 'open') === 'in_progress'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      <span>{(query.status || 'open') === 'open' ? '🔓' : (query.status || 'open') === 'in_progress' ? '⚡' : '✅'}</span>
                      {(query.status || 'open').replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                      (query.channel || 'email') === 'email'
                        ? 'bg-gray-100 text-gray-800 border border-gray-200'
                        : (query.channel || 'email') === 'social'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      <span>{(query.channel || 'email') === 'email' ? '✉️' : (query.channel || 'email') === 'social' ? '📱' : '💬'}</span>
                      {(query.channel || 'email').toUpperCase()}
                    </span>
                    {query.assignee && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                        <span>👤</span>
                        {query.assignee}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  {query.status === 'open' && (
                    <button 
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={() => updateQuery(query.id, { 
                        status: 'in_progress', 
                        assignee: 'Current User' 
                      })}
                    >
                      <span>🚀</span>
                      Take
                    </button>
                  )}
                  {query.status === 'in_progress' && (
                    <button 
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={() => updateQuery(query.id, { status: 'closed' })}
                    >
                      <span>✅</span>
                      Close
                    </button>
                  )}
                  {query.priority !== 'high' && (
                    <button 
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={() => updateQuery(query.id, { priority: 'high' })}
                    >
                      <span>🚨</span>
                      Escalate
                    </button>
                  )}
                  <button 
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                    onClick={() => setSelectedQuery(query)}
                  >
                    <span>👁️</span>
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
      
      {selectedQuery && (
        <QueryDetails 
          query={selectedQuery}
          onClose={() => setSelectedQuery(null)}
          onUpdate={updateQuery}
        />
      )}
      </div>
    </div>
  )
}

export default App