import { useState } from 'react'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const endpoint = isSignup ? '/signup' : '/login'
      const body = isSignup ? { email, name } : { email }
      
      const response = await fetch(`http://localhost:3001/api/auth${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert(isSignup ? 'Signup failed' : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50" style={{fontFamily: 'Poppins, sans-serif'}}>
      <div className="flex min-h-screen">
        {/* Left Side - Landing Content */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="max-w-2xl">
            {/* Logo & Brand */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-2xl">
                  <span className="text-white text-4xl">📬</span>
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">QueryFlow</h1>
                  <p className="text-xl text-gray-600">Query Management & Response System</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Unified Inbox</h3>
                  <p className="text-gray-600">Manage all customer queries from one place</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                  <p className="text-gray-600">Smart categorization and response suggestions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Real-time Analytics</h3>
                  <p className="text-gray-600">Track performance and response metrics</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to streamline your support?</h2>
              <p className="text-emerald-100 mb-6">Join thousands of teams already using QueryFlow to deliver exceptional customer support.</p>
              <div className="flex gap-4">
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">✨ Free Trial</span>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">🚀 Quick Setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-96 bg-white shadow-2xl flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignup ? 'Get Started' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignup ? 'Create your account to begin' : 'Sign in to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-gray-50 hover:bg-white"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-gray-50 hover:bg-white"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-4 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setEmail('')
                  setName('')
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                {isSignup ? 'Already have an account? Sign in' : 'Need an account? Get started'}
              </button>
            </div>
            
            {!isSignup && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-800 text-center font-medium mb-2">Demo Accounts</p>
                <div className="space-y-1 text-xs text-emerald-700">
                  <p>• admin@company.com</p>
                  <p>• john@company.com</p>
                  <p>• sarah@company.com</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login