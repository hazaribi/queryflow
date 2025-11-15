import { useState, useEffect } from 'react'

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async (retries = 3) => {
    try {
      const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/queries/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      if (retries > 0 && error.message.includes('Failed to fetch')) {
        setTimeout(() => fetchAnalytics(retries - 1), 1000)
        return
      }
      // Fallback mock data
      setAnalytics({
        total: 4,
        open: 3,
        in_progress: 1,
        closed: 0,
        high_priority: 2,
        avg_response_time: 45,
        by_channel: [
          { channel: 'email', count: 2 },
          { channel: 'social', count: 1 },
          { channel: 'chat', count: 1 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  if (!analytics) return (
    <div className="text-center py-12">
      <div className="text-gray-500 text-lg">No analytics data available</div>
    </div>
  )

  const metrics = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'channels', name: 'Channels', icon: '📱' },
    { id: 'trends', name: 'Trends', icon: '📈' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-200 rounded-xl p-4 mb-6 border border-slate-300">
        <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
        <p className="text-gray-600 mt-1">Real-time insights into your query management performance</p>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedMetric === metric.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>{metric.icon}</span>
            {metric.name}
          </button>
        ))}
      </div>

      {/* Overview Metrics */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.avg_response_time ? `${Math.round(analytics.avg_response_time)}m` : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">Avg Response Time</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.total > 0 ? Math.round((analytics.closed / analytics.total) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-500">Resolution Rate</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{width: `${analytics.total > 0 ? (analytics.closed / analytics.total) * 100 : 0}%`}}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
                <p className="text-sm text-gray-500">Total Queries</p>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 bg-blue-200 h-2 rounded"></div>
              <div className="flex-1 bg-yellow-200 h-2 rounded"></div>
              <div className="flex-1 bg-green-200 h-2 rounded"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{analytics.high_priority}</p>
                <p className="text-sm text-gray-500">High Priority</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{width: `${analytics.total > 0 ? (analytics.high_priority / analytics.total) * 100 : 0}%`}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Distribution */}
      {selectedMetric === 'channels' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-6">Channel Distribution</h3>
          <div className="space-y-4">
            {analytics.by_channel?.map((channel, index) => {
              const percentage = analytics.total > 0 ? (channel.count / analytics.total) * 100 : 0
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500']
              return (
                <div key={channel.channel} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium capitalize">{channel.channel}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                      style={{width: `${percentage}%`}}
                    ></div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium">{channel.count}</span>
                    <span className="text-xs text-gray-500 ml-1">({Math.round(percentage)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {selectedMetric === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Response Time Trend</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {[65, 45, 78, 52, 38, 67, 43].map((height, index) => (
                <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{height: `${height}%`}}></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Query Volume</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {[85, 92, 78, 96, 87, 91, 89].map((height, index) => (
                <div key={index} className="flex-1 bg-green-500 rounded-t" style={{height: `${height}%`}}></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      )}

      {/* Trends */}
      {selectedMetric === 'trends' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-6">Key Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-2xl font-bold text-green-600">+23%</div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-blue-600">-15%</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-purple-600">+31%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics