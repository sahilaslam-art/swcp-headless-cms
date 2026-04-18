import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as toast from '../utils/toast'

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email?.trim()) return 'Email is required!'
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email format. Please enter a valid email.'
  }
  return null
}

const validatePassword = (password) => {
  if (!password) return 'Password is required!'
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.'
  }
  return null
}

const validateUsername = (name) => {
  if (!name?.trim()) return 'Name is required!'
  const nameRegex = /^[a-zA-Z\s]+$/
  if (!nameRegex.test(name.trim())) {
    return 'Name can only contain letters and spaces.'
  }
  return null
}

const Register = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

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
      const emailError = validateEmail(formData.email.trim())
      const passwordError = validatePassword(formData.password)
      const usernameError = validateUsername(formData.username.trim())

      if (emailError || passwordError || usernameError) {
        if (usernameError) toast.showError(usernameError)
        else if (emailError) toast.showError(emailError)
        else if (passwordError) toast.showError(passwordError)
        setIsLoading(false)
        return
      }

      const response = await register(
        formData.email.trim(),
        formData.username.trim(),
        formData.password
      )

      if (response.success) {
        toast.showSuccess('Registration successful! You can now log in.')
        setTimeout(() => {
          navigate('/login', { replace: true, state: { successMessage: 'Successfully signed up! Please login.' } })
        }, 1500)
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast.showError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
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
            Secure Entry Protocol v.2.4
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 md:px-12 py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-16 items-start">
          
          {/* Left Column: Branding/Context */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between h-full py-12">
            <div>
              <h1 className="font-headline text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.9] text-[#3D3A34] uppercase mb-8">
                  Create your <br/>workspace
              </h1>
              <div className="w-16 h-1 bg-[#D4754C] mb-12"></div>
              <p className="text-[#8B8680] max-w-xs text-sm leading-relaxed">
                  Join the platform to set up your isolated portfolio environment. Your data, your rules.
              </p>
            </div>
            <div className="mt-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-sm" data-icon="verified_user">verified_user</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Secure and private</span>
              </div>
              <p className="font-label text-[10px] uppercase tracking-[0.15em] text-[#8B8680]">
                  Established 2024 — High Precision Systems
              </p>
            </div>
          </div>

          {/* Right Column: Register Form */}
          <div className="md:col-span-7 lg:col-span-6 lg:col-start-7 flex justify-center md:justify-end">
            <div className="w-full max-w-md bg-white border border-[#E8DDD1] rounded-2xl p-8 md:p-12 relative shadow-sm">
              <h1 className="md:hidden font-headline text-4xl font-extrabold tracking-tighter leading-tight text-[#3D3A34] uppercase mb-10">
                  Create workspace
              </h1>
              
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Username Field */}
                <div className="space-y-2 group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B8680] mb-2" htmlFor="username">
                      Full Name
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-[#FAF7F2] border border-[#E8DDD1] rounded-lg px-4 py-3 text-[#3D3A34] placeholder:text-[#8B8680]/50 focus:border-[#D4754C] focus:ring-1 focus:ring-[#D4754C] outline-none text-sm font-medium transition-all"  
                      id="username" 
                      name="username" 
                      placeholder="ALEXANDER VOGEL" 
                      required 
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isLoading || loading}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2 group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B8680] mb-2" htmlFor="email">
                      Email Address
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B8680] mb-2" htmlFor="password">
                      Security Password
                  </label>
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
                  {/* Password Strength Indicator */}
                  <div className="mt-4 h-[2px] w-full bg-[#E8DDD1] rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#D4754C] transition-all duration-500" 
                      style={{ width: formData.password.length > 0 ? `${Math.min(formData.password.length * 10, 100)}%` : '0%' }}
                    ></div>
                  </div>
                </div>

                {/* Action Area */}
                <div className="pt-4 space-y-6">
                  <button 
                    disabled={isLoading || loading}
                    className="w-full bg-[#D4754C] text-white font-bold uppercase tracking-[0.1em] text-xs py-4 rounded-xl shadow-lg shadow-[#D4754C]/20 hover:bg-[#c26742] transition-colors flex items-center justify-center gap-2 disabled:opacity-50" 
                    type="submit"
                  >
                      {isLoading || loading ? 'Processing...' : 'Create Account'}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-grow h-[1px] bg-[#E8DDD1]"></div>
                    <span className="text-[9px] uppercase tracking-widest text-[#8B8680] font-bold whitespace-nowrap">Alternative Access</span>
                    <div className="flex-grow h-[1px] bg-[#E8DDD1]"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => alert('Github auth coming soon')}
                      className="w-full bg-[#FAF7F2] border border-[#E8DDD1] rounded-xl text-[#3D3A34] font-bold uppercase tracking-[0.1em] text-[9px] py-4 flex items-center justify-center gap-2 hover:bg-[#E8DDD1]/50 transition-colors" 
                      type="button"
                    >
                      <span className="text-[10px] material-symbols-outlined">code</span>
                        Github
                    </button>
                    <button 
                      onClick={() => alert('Google auth coming soon')}
                      className="w-full bg-[#FAF7F2] border border-[#E8DDD1] rounded-xl text-[#3D3A34] font-bold uppercase tracking-[0.1em] text-[9px] py-4 flex items-center justify-center gap-2 hover:bg-[#E8DDD1]/50 transition-colors" 
                      type="button"
                    >
                      <img alt="Google" className="w-3 h-3 grayscale opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArBI9KcOrFysAnE4b0RMdKJNbxfp4aaRhnpukpVkFCJZJbbPIbPV-0sVYAEMEp-fOlDTh9VtEVu5hmkjyq-fvE6yZxXRflREN8YUlGlowSENqaHvCBLnsLLQ472nwb0GyKGFqa2BaXTb3v-cVQ2pNeBwN5DvFrNUtBjUO4tkw2nDushx0uYwf2E_2UGRnkV5EVdnqK__xjM-LvXZv44K_0gXA-cUrIMZIg__8vmfowNxseL08m1y52kufmbna_OXBiG551w7aA2SI" />
                        Google
                    </button>
                  </div>
                </div>
              </form>

              <p className="mt-12 text-center text-[10px] uppercase tracking-widest opacity-40">
                  Already part of the system? <Link to="/login" className="text-[#D4754C] opacity-100 font-bold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-12 py-16 flex flex-col md:flex-row justify-between items-center gap-8 z-10">
        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left text-[#3D3A34]">
          <div className="text-sm font-black uppercase tracking-tighter">ADMIN PANEL</div>
          <div className="font-['Inter'] text-[10px] uppercase tracking-[0.1em] opacity-40">
              © 2024 ADMIN PANEL. TRUSTED BY 12,000+ TEAMS.
          </div>
        </div>
        <div className="flex gap-8 items-center font-label text-[10px] tracking-widest uppercase">
          <a className="opacity-40 text-[#3D3A34] hover:opacity-100 transition-opacity duration-500" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a className="opacity-40 text-[#3D3A34] hover:opacity-100 transition-opacity duration-500" href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          <a className="opacity-40 text-[#3D3A34] hover:opacity-100 transition-opacity duration-500" href="/security" target="_blank" rel="noopener noreferrer">Security</a>
        </div>
      </footer>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <div className="absolute inset-0"></div>
      </div>
    </div>
  )
}

export default Register