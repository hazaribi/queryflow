import { useState, useEffect } from 'react'

function Reports() {
  const [slaMetrics, setSlaMetrics] = useState(null)
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async (retries = 3) => {
    try {
      const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const [slaResponse, analyticsResponse] = await Promise.all([
        fetch(`${API_BASE}/reports/sla`, { headers }),
        fetch(`${API_BASE}/reports/analytics/advanced`, { headers })
      ])
      
      if (!slaResponse.ok || !analyticsResponse.ok) {
        throw new Error('HTTP Error')
      }
      
      setSlaMetrics(await slaResponse.json())
      setAdvancedAnalytics(await analyticsResponse.json())
    } catch (error) {
      console.error('Error fetching reports:', error)
      if (retries > 0 && error.message.includes('Failed to fetch')) {
        setTimeout(() => fetchReports(retries - 1), 1000)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async () => {
    try {
      const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/reports/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'queries-report.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  if (loading) return <div>Loading reports...</div>

  return (
    <div className="space-y-6">
      <div className="bg-slate-200 rounded-xl p-4 mb-6 border border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Advanced Reports</h2>
            <p className="text-sm text-gray-600 mt-1">Comprehensive insights and data exports</p>
          </div>
          <button 
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
            onClick={downloadReport}
          >
            Download CSV Report
          </button>
        </div>
      </div>

      {slaMetrics && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            SLA Performance Dashboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500 p-3 rounded-lg">
                  <span className="text-white text-xl">✅</span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-700">{slaMetrics.sla_compliance}%</p>
                  <p className="text-sm text-green-600 font-medium">SLA Compliance</p>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                  style={{width: `${slaMetrics.sla_compliance}%`}}
                ></div>
              </div>
              <p className="text-xs text-green-600 mt-2">Target: 95%</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-500 p-3 rounded-lg">
                  <span className="text-white text-xl">🚨</span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-700">{slaMetrics.sla_violations}</p>
                  <p className="text-sm text-red-600 font-medium">Active Violations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-red-600">Requires immediate attention</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <span className="text-white text-xl">⏱️</span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-700">{slaMetrics.avg_resolution_hours}h</p>
                  <p className="text-sm text-blue-600 font-medium">Avg Resolution Time</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{width: '68%'}}></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">Target: 4h</p>
            </div>
          </div>
        </div>
      )}

      {advancedAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">👥</span>
              Top Customers
            </h4>
            <div className="space-y-3">
              {advancedAnalytics.top_customers?.slice(0, 5).map((customer, index) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500']
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${colors[index]} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.customer_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{customer.customer_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {customer.query_count} queries
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">📈</span>
              Resolution Time by Priority
            </h4>
            <div className="space-y-4">
              {advancedAnalytics.resolution_by_priority?.map((item, index) => {
                const priorityColors = {
                  high: { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' },
                  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500' },
                  low: { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' }
                }
                const colors = priorityColors[item.priority] || priorityColors.medium
                const maxTime = 120 // minutes
                const percentage = Math.min((item.avg_minutes / maxTime) * 100, 100)
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{Math.round(item.avg_minutes)} min avg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors.bar} h-2 rounded-full transition-all duration-500`}
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports