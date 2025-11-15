import { useState, useEffect } from 'react'

function AIInsights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testQuery, setTestQuery] = useState('')
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async (retries = 3) => {
    try {
      const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/ai/insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      if (retries > 0 && error.message.includes('Failed to fetch')) {
        setTimeout(() => fetchInsights(retries - 1), 1000)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const analyzeQuery = async () => {
    if (!testQuery.trim()) return
    
    try {
      const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: testQuery })
      })
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Error analyzing query:', error)
    }
  }

  if (loading) return <div>Loading AI insights...</div>

  return (
    <div className="space-y-6">
      <div className="bg-slate-200 rounded-xl p-4 mb-6 border border-slate-300">
        <h2 className="text-xl font-semibold text-gray-800">AI-Powered Insights</h2>
        <p className="text-sm text-gray-600 mt-1">Intelligent analysis and automated recommendations</p>
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          Test AI Analysis
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <textarea
            placeholder="Enter a customer query to analyze..."
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            rows={3}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
          />
          <button 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium self-start"
            onClick={analyzeQuery}
          >
            🔍 Analyze Query
          </button>
        </div>
        
        {analysis && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                AI-Generated Response Suggestions
              </h4>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-800 leading-relaxed">"{suggestion}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-xl">😊</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Sentiment Analysis</h4>
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    analysis.sentiment.sentiment === 'positive' 
                      ? 'bg-green-100 text-green-800' 
                      : analysis.sentiment.sentiment === 'negative'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {analysis.sentiment.sentiment.toUpperCase()}
                  </span>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900">{Math.round(analysis.sentiment.confidence * 100)}%</div>
                    <div className="text-sm text-gray-500">Confidence</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{width: `${analysis.sentiment.confidence * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Category</h4>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {analysis.category.category.toUpperCase()}
                  </span>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900">{Math.round(analysis.category.confidence * 100)}%</div>
                    <div className="text-sm text-gray-500">Confidence</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{width: `${analysis.category.confidence * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <span className="text-xl">⚡</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Predicted Priority</h4>
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    analysis.predicted_priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : analysis.predicted_priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {analysis.predicted_priority.toUpperCase()}
                  </span>
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">AI Recommendation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Analytics */}
      {insights && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            AI Analytics Overview
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">😊</span>
                Sentiment Distribution
              </h4>
              <div className="space-y-3">
                {insights.sentiment_distribution?.map((item, index) => {
                  const sentimentColors = {
                    positive: { bg: 'bg-green-500', text: 'text-green-700' },
                    negative: { bg: 'bg-red-500', text: 'text-red-700' },
                    neutral: { bg: 'bg-gray-500', text: 'text-gray-700' }
                  }
                  const colors = sentimentColors[item.sentiment] || sentimentColors.neutral
                  const total = insights.sentiment_distribution.reduce((sum, s) => sum + s.count, 0)
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${colors.bg} rounded-full`}></div>
                        <span className="capitalize font-medium">{item.sentiment || 'Unknown'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{item.count}</span>
                        <span className="text-sm text-gray-500 ml-1">({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">📊</span>
                Category Breakdown
              </h4>
              <div className="space-y-3">
                {insights.category_distribution?.map((item, index) => {
                  const categoryColors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500']
                  const total = insights.category_distribution.reduce((sum, c) => sum + c.count, 0)
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${categoryColors[index % categoryColors.length]} rounded-full`}></div>
                        <span className="capitalize font-medium">{item.category || 'Unknown'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{item.count}</span>
                        <span className="text-sm text-gray-500 ml-1">({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                AI Confidence Levels
              </h4>
              <div className="space-y-3">
                {insights.confidence_levels?.map((item, index) => {
                  const confidenceColors = {
                    high: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
                    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
                    low: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
                  }
                  const colors = confidenceColors[item.confidence_level] || confidenceColors.medium
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {item.confidence_level.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-bold">{item.count} queries</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIInsights