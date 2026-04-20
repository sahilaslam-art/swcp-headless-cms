import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as toast from '../utils/toast'

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email?.trim())) {
    return 'Please enter a valid email address'
  }
  return null
}

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.showSuccess(location.state.successMessage)
    }
  }, [location.state])

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, location, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const emailError = validateEmail(formData.email)
      const passwordError = !formData.password ? 'Password is required' : null

      if (emailError || passwordError) {
        emailError && toast.showError(emailError)
        passwordError && toast.showError(passwordError)
        setIsLoading(false)
        return
      }

      const response = await login(formData.email.trim(), formData.password, true)

      if (response.success) {
        toast.showSuccess('Login successful! Redirecting to dashboard...')
        const from = location.state?.from?.pathname || '/'
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 1500)
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err.response?.status === 401) {
        toast.showError('Invalid email or password. Please try again.')
      } else {
        toast.showError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="font-body text-[#3D3A34] min-h-screen flex flex-col selection:bg-[#D4754C] selection:text-white bg-[#FAF7F2]">
      {/* Top Navigation */}
      <header className="w-full px-12 py-8 flex justify-between items-center z-10">
        <div className="font-headline text-xl font-bold tracking-tighter text-[#3D3A34] uppercase">
            ADMIN PANEL
        </div>
        <div className="hidden md:block text-[10px] font-label uppercase tracking-[0.2em] opacity-40">
            Secure Entry Protocol v.2.6
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 md:px-12 py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-16 items-start">
          
          {/* Left Column: Branding/Context */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between h-full py-12">
            <div>
              <h1 className="font-headline text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.9] text-[#3D3A34] uppercase mb-8">
                  Access your <br/>workspace
              </h1>
              <div className="w-16 h-1 bg-[#D4754C] mb-12"></div>
              <p className="text-[#8B8680] max-w-xs text-sm leading-relaxed">
                  Enter your credentials to access the encrypted terminal. All sessions are monitored for security compliance.
              </p>
            </div>
            <div className="mt-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-sm" data-icon="verified_user">verified_user</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Secure and private</span>
              </div>
              <p className="font-label text-[10px] uppercase tracking-[0.15em] text-[#8B8680]">
                  Established 2026 — High Precision Systems
              </p>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="md:col-span-7 lg:col-span-6 lg:col-start-7 flex justify-center md:justify-end">
            <div className="w-full max-w-md bg-white border border-[#E8DDD1] rounded-2xl p-8 md:p-12 relative shadow-sm">
              {/* Brutalist Accent Header removed for clean saas look */}
              
              {/* Mobile Headline (Only visible on small screens) */}
              <h1 className="md:hidden font-headline text-4xl font-extrabold tracking-tighter leading-tight text-[#3D3A34] uppercase mb-10">
                  Access workspace
              </h1>
              
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                {/* Email Field */}
                <div className="space-y-2 group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B8680] mb-2" htmlFor="email">
                      Identity / Email
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-[#FAF7F2] border border-[#E8DDD1] rounded-lg px-4 py-3 text-[#3D3A34] placeholder:text-[#8B8680]/50 focus:border-[#D4754C] focus:ring-1 focus:ring-[#D4754C] outline-none text-sm font-medium transition-all"  
                      id="email" 
                      name="email" 
                      placeholder="name@authority.io" 
                      required 
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading || loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B8680] mb-2" htmlFor="password">
                        Access Key
                    </label>
                    <Link to="/forgot-password" className="text-[10px] uppercase tracking-widest font-bold text-[#D4754C] hover:underline transition-colors pb-2">
                        Forgot Key?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <input 
                      className="w-full bg-[#FAF7F2] border border-[#E8DDD1] rounded-lg px-4 py-3 text-[#3D3A34] placeholder:text-[#8B8680]/50 focus:border-[#D4754C] focus:ring-1 focus:ring-[#D4754C] outline-none text-sm font-medium transition-all" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading || loading}
                    />
                    <button 
                      className="absolute right-4 text-[#8B8680] hover:text-[#3D3A34] transition-colors" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Area */}
                <div className="pt-4 space-y-6">
                  <button 
                    disabled={isLoading || loading}
                    className="w-full bg-[#D4754C] text-white font-bold uppercase tracking-[0.1em] text-xs py-4 rounded-xl shadow-lg shadow-[#D4754C]/20 hover:bg-[#c26742] transition-colors flex items-center justify-center gap-2 disabled:opacity-50" 
                    type="submit"
                  >
                      {isLoading || loading ? 'Authorizing...' : 'Authorize Session'}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-grow h-[1px] bg-[#E8DDD1]"></div>
                    <span className="text-[9px] uppercase tracking-widest text-[#8B8680] font-bold whitespace-nowrap">Alternative Access</span>
                    <div className="flex-grow h-[1px] bg-[#E8DDD1]"></div>
                  </div>
                  
                  <button 
                    onClick={() => alert('Google auth coming soon')}
                    className="w-full bg-[#FAF7F2] border border-[#E8DDD1] rounded-xl text-[#3D3A34] font-bold uppercase tracking-[0.1em] text-[10px] py-4 flex items-center justify-center gap-3 hover:bg-[#E8DDD1]/50 transition-colors" 
                    type="button"
                  >
                    <img alt="Google logo" className="w-4 h-4 grayscale opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArBI9KcOrFysAnE4b0RMdKJNbxfp4aaRhnpukpVkFCJZJbbPIbPV-0sVYAEMEp-fOlDTh9VtEVu5hmkjyq-fvE6yZxXRflREN8YUlGlowSENqaHvCBLnsLLQ472nwb0GyKGFqa2BaXTb3v-cVQ2pNeBwN5DvFrNUtBjUO4tkw2nDushx0uYwf2E_2UGRnkV5EVdnqK__xjM-LvXZv44K_0gXA-cUrIMZIg__8vmfowNxseL08m1y52kufmbna_OXBiG551w7aA2SI" />
                      Continue with google
                  </button>
                </div>
              </form>

              <p className="mt-12 text-center text-[10px] uppercase tracking-widest opacity-40">
                  Don't have access? <Link to="/register" className="text-primary opacity-100 font-bold hover:underline">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-12 py-16 flex flex-col md:flex-row justify-between items-center gap-8 z-10">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <div className="text-sm font-black text-[#dee5ff] uppercase tracking-tighter">ADMIN PANEL</div>
          <div className="font-['Inter'] text-[10px] uppercase tracking-[0.1em] opacity-40 text-[#b7c8e1]">
              © 2026 ADMIN PANEL.
          </div>
        </div>
        <div className="flex gap-8 items-center font-label text-[10px] tracking-widest uppercase">
          <a className="opacity-40 text-[#b7c8e1] hover:opacity-100 transition-opacity duration-500" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a className="opacity-40 text-[#b7c8e1] hover:opacity-100 transition-opacity duration-500" href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          <a className="opacity-40 text-[#b7c8e1] hover:opacity-100 transition-opacity duration-500" href="/security" target="_blank" rel="noopener noreferrer">Security</a>
        </div>
      </footer>

      {/* Background Decoration (Brutalist Grid) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <div className="absolute inset-0"></div>
      </div>
    </div>
  )
}

export default Login
