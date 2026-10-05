import React from 'react';
import { get_worker, type Worker} from '../api/dashboard.api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
function WorkerDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorker();
  }, []);

  const fetchWorker = async () => {
    try {
      setLoading(true);
      const res = await get_worker();
      console.log(res.data)
      setWorkers(res.data);
      
    } catch (error) {
      console.log('error:', error);
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 ">
      <div className="mx-auto max-w-6xl lg:ml-80">
        {/* Header */}
       
        <div className="mb-10 flex items-baseline justify-between border-b-2 border-[#1A1B1F] pb-6">
          <h1 className="font-serif text-3xl text-[#1A1B1F]">Available workers</h1>
          <span className="font-mono text-sm text-[#6B6D76]">
            {loading ? '—' : `${workers.length} listed`}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse border border-[#E4E4E7] bg-[#FAFAFA]"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && workers.length === 0 && (
          <div className="border border-[#E4E4E7] py-16 text-center">
            <p className="font-serif text-lg text-[#1A1B1F]">No workers listed yet</p>
            <p className="mt-1 text-sm text-[#6B6D76]">Check back once profiles are added.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && workers.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workers?.map((w) => (
              <div
                key={w.user_id}
                className="group border border-[#E4E4E7] p-5 transition-colors hover:border-[#1A1B1F]"
              >
                {/* Name + rate */}
                <div className="flex items-start justify-between gap-3 border-b border-[#E4E4E7] pb-4">
                  <div>
                    <h2 className="font-serif text-xl leading-tight text-[#1A1B1F]">
                      {w.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#6B6D76]">{w.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-lg tabular-nums text-[#B5622C]">
                      ${w.hourly_rate}
                    </p>
                    <p className="text-xs text-[#6B6D76]">per hour</p>
                  </div>
                </div>

                {/* Employment type */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4F7864]" />
                  <span className="text-sm text-[#3F4048]">
                    {w.employment_type}
                  </span>
                </div>

                {/* Services */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {w.services?.map((s) => (
                    <span
                      key={s.id}
                      className="border border-[#E4E4E7] px-2 py-0.5 text-xs text-[#3F4048]"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>

<Link
  to={`/view/user/${w.user_id}`}
>
             <button   className="group mt-5 flex w-full items-center justify-between border-t border-[#E4E4E7] pt-3 text-sm"
>
 
  <span className="text-[#1A1B1F] transition-colors group-hover:text-[#B5622C]">
    View profile
  </span>

  <span className="shrink-0 font-mono text-[#1A1B1F] transition-all group-hover:translate-x-1 group-hover:text-[#B5622C]">
    →
  </span>
  </button>
</Link>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerDashboard;