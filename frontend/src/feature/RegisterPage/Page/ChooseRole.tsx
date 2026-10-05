import { useState } from 'react';
import toast from 'react-hot-toast';
import { selectRole } from '../api/register.api';
import { ROLES, type Role } from '../../../api';

export default function ChooseRolePage() {
  const [loading, setLoading] = useState<Role|null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pickRole(role: Role) {
    setLoading(role);
    setError(null);
    try {
      const res = await selectRole({role})
      toast.success("Profile updated !") ;
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Something went wrong.');
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper font-body">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-2xl mb-2">One more thing</h1>
        <p className="text-[#5B6058] mb-8">Are you here to find work, or get something done?</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => pickRole(ROLES.WORKER)}
            disabled={loading !== null}
            className="py-3 rounded-lg border border-amber text-amber font-medium hover:bg-amber/10 transition disabled:opacity-50"
          >
            {loading === 'worker' ? 'Setting up…' : "I'm a Worker"}
          </button>
          <button
            onClick={() => pickRole(ROLES.CUSTOMER)}
            disabled={loading !== null}
            className="py-3 rounded-lg border border-teal text-teal font-medium hover:bg-teal/10 transition disabled:opacity-50"
          >
            {loading === 'customer' ? 'Setting up…' : "I'm a Customer"}
          </button>
           <button
            onClick={() => pickRole(ROLES.ADMIN)}
            disabled={loading !== null}
            className="py-3 rounded-lg border border-amber text-amber font-medium hover:bg-amber/10 transition disabled:opacity-50"
          >
            {loading === 'admin' ? 'Setting up…' : "I'm a Admin"}
          </button>
        </div>

        {error && <p className="text-[#C4453B] text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}