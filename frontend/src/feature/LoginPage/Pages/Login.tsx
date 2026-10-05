import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { loginUser } from '../api/login.api';
import { useNavigate } from 'react-router-dom';
import { sharedSteps, workerPath , customerPath } from '../../../ui/FlowNode';
import FlowNode from '../../../ui/FlowNode';
import { useAuth } from '../../../context/authContext';


interface FormField{
    email?:string;
    password?:string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors , setErrors] = useState<FormField>({})
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser }= useAuth();


  function validate(){
    const newErrors: typeof errors = {};
    if(!email.trim()) newErrors.email = "Email is required";
     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';

  if (!password) newErrors.password = 'Password is required';
  else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  }
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if(!validate()) return ;
    setError(null);
    setLoading(true);
    try {
      console.log("email:",email)
      const  res = await loginUser({email , password})
      toast("Login Successfully!")
      navigate("/dashboard");
      refreshUser()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:5000/auth/google';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] min-h-screen font-body text-[#14171A] ">
      {/* Left: flow panel */}
      <aside className="hidden md:block bg-charcoal text-paper">
        <div className="flow-scroll h-screen overflow-y-auto px-12 py-16 pb-24 scroll-smooth">
          <div className="mb-10 max-w-md">
            <p className="text-sm text-paper/50 mb-2">How it works</p>
            <h1 className="font-display text-3xl font-semibold leading-tight mb-3">
              Two paths, one platform
            </h1>
            <p className="text-paper/60 text-sm">
              Every account starts the same way — where you end up is your call.
            </p>
          </div>

          {sharedSteps.map((step, i) => (
            <FlowNode key={step.label} step={step} index={i} isFirst={i === 0} />
          ))}

          <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
              <p className="font-display text-sm font-semibold text-amber mb-5 pb-2 border-b border-white/10">
                Worker
              </p>
              {workerPath.map((step, i) => (
                <FlowNode key={step.label} step={step} accent="amber" index={i + 2} />
              ))}
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-teal mb-5 pb-2 border-b border-white/10">
                Customer
              </p>
              {customerPath.map((step, i) => (
                <FlowNode key={step.label} step={step} accent="teal" index={i + 2} />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Right: form panel */}
      <main className="bg-paper flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 font-display font-semibold mb-10">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-amber to-teal" />
            <span>Worker Connect</span>
          </div>

          <h2 className="font-display text-2xl mb-1">Welcome back</h2>
          <p className="text-[#5B6058] mb-8 text-sm">
            Sign in to find work or get something fixed.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mt-4 mb-1.5" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-3 border border-[#DAD5CB] rounded-lg text-sm bg-white focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
            />
            
{errors.email && <p className="text-[#C4453B] text-xs mt-1">{errors.email}</p>}

            <label className="block text-sm font-medium mt-4 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-3 border border-[#DAD5CB] rounded-lg text-sm bg-white focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
              />
              {errors.password && <p className="text-[#C4453B] text-xs mt-1">{errors.password}</p>}

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8578]"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 4 10 7-1 2-1.5 3.5-3 5M6.3 6.3C4.1 7.7 2.5 9.6 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm my-5">
              <label className="flex items-center gap-1.5 text-[#5B6058]">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                Keep me signed in
              </label>
              <a href="/forgot-password" className="text-teal">
                Forgot password?
              </a>
            </div>

            {error && <p className="text-[#C4453B] text-sm -mt-2 mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-charcoal text-paper font-semibold text-sm hover:bg-[#2A2F2C] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 text-[#A8A398] text-xs my-6">
            <span className="flex-1 h-px bg-[#E3DED2]" />
            or
            <span className="flex-1 h-px bg-[#E3DED2]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 border border-[#DAD5CB] rounded-lg bg-white flex items-center justify-center gap-2.5 text-sm font-medium hover:bg-[#FAF8F4] transition"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 01-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" />
              <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.7H.9v2.3A9 9 0 009 18z" />
              <path fill="#FBBC05" d="M3.9 10.8a5.4 5.4 0 010-3.6V4.9H.9a9 9 0 000 8.2l3-2.3z" />
              <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0A9 9 0 00.9 4.9l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-[#5B6058] mt-6">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-teal font-medium">
              Create one
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}