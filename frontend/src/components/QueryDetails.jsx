import { useState } from 'react'

function QueryDetails({ query, onClose, onUpdate }) {
  const [response, setResponse] = useState('')
  const [isResponding, setIsResponding] = useState(false)
  
  console.log('QueryDetails Enhanced v2.0 Loading:', query)

  const handleRespond = async () => {
    if (!response.trim()) return
    
    setIsResponding(true)
    // Simulate API call
    setTimeout(() => {
      onUpdate(query.id, { status: 'closed' })
      setIsResponding(false)
      onClose()
    }, 1000)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-500'
      case 'in_progress': return 'bg-yellow-500'
      case 'closed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                  <span className="text-lg">💬</span>
                </div>
                <h2 className="text-xl font-bold">Query Details</h2>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(query.priority)} text-white shadow-lg`}>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {query.priority?.toUpperCase()}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(query.status)} text-white shadow-lg`}>
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  {query.status?.replace('_', ' ').toUpperCase()}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white shadow-lg">
                  <span className="text-sm">📱</span>
                  {query.channel?.toUpperCase()}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition-all duration-200 hover:scale-110 relative z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Customer Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <span className="text-white text-xl">👤</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <span className="text-green-600 text-sm">📝</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Customer Name</span>
                      <p className="font-semibold text-gray-900">{query.customer_name || 'Anonymous User'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <span className="text-purple-600 text-sm">✉️</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Email Address</span>
                      <p className="font-semibold text-gray-900">{query.customer_email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <span className="text-orange-600 text-sm">🕰️</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Created</span>
                      <p className="font-semibold text-gray-900">{formatDate(query.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <span className="text-indigo-600 text-sm">👥</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Assigned To</span>
                      <p className="font-semibold text-gray-900">{query.assignee || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🕰️</span>
                Query Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Query Created</p>
                    <p className="text-xs text-gray-500">{formatDate(query.created_at)}</p>
                  </div>
                </div>
                {query.assignee && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Assigned to {query.assignee}</p>
                      <p className="text-xs text-gray-500">{formatDate(query.updated_at)}</p>
                    </div>
                  </div>
                )}
                {query.status === 'closed' && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Query Resolved</p>
                      <p className="text-xs text-gray-500">{formatDate(query.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Query Content */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500 p-3 rounded-xl">
                <span className="text-white text-xl">💬</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Query Content</h3>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-800 leading-relaxed text-base">{query.content}</p>
              </div>
            </div>
            
            {/* AI Quick Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <h4 className="font-semibold text-gray-900">AI Quick Analysis</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">😊</div>
                  <div className="text-xs text-gray-500">Sentiment</div>
                  <div className="font-medium text-green-600">Neutral</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-xs text-gray-500">Category</div>
                  <div className="font-medium text-blue-600">Support</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs text-gray-500">Urgency</div>
                  <div className="font-medium text-orange-600">{query.priority?.charAt(0).toUpperCase() + query.priority?.slice(1)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Section */}
          {query.status !== 'closed' && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <span className="text-white text-xl">✍️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Compose Response</h3>
              </div>
              
              {/* Quick Response Templates */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Thank you for contacting us. I'll help you resolve this issue.",
                    "I understand your concern and I'm looking into this right away.",
                    "Let me check on this for you and get back with an update.",
                    "I apologize for any inconvenience. Here's how we can fix this:"
                  ].map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setResponse(template)}
                      className="text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Template {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your personalized response here..."
                  className="w-full h-40 p-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none bg-white shadow-sm"
                />
                
                {/* AI Writing Assistant */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">🤖</span>
                    <span>AI Writing Assistant</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                      ✨ Improve Tone
                    </button>
                    <button className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                      🔍 Check Grammar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => onUpdate(query.id, { status: 'in_progress', assignee: 'Current User' })}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <span className="text-sm">🚀</span>
                Take Query
              </button>
              <button 
                onClick={() => onUpdate(query.id, { priority: 'high' })}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <span className="text-sm">🚨</span>
                Escalate
              </button>
              <button 
                onClick={() => alert('Note functionality would be implemented here')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <span className="text-sm">📄</span>
                Add Note
              </button>
              {query.status === 'in_progress' && (
                <button 
                  onClick={() => onUpdate(query.id, { status: 'closed' })}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  <span className="text-sm">✅</span>
                  Close Query
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              {query.status !== 'closed' && response.trim() && (
                <button 
                  onClick={handleRespond}
                  disabled={isResponding}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none text-sm"
                >
                  {isResponding ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="text-sm">📨</span>
                      Send Response
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className={`w-2 h-2 rounded-full ${
                  query.status === 'open' ? 'bg-blue-500 animate-pulse' :
                  query.status === 'in_progress' ? 'bg-yellow-500 animate-pulse' :
                  'bg-green-500'
                }`}></div>
                <span>Status: {query.status?.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="text-gray-500">
                Last updated: {formatDate(query.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueryDetails