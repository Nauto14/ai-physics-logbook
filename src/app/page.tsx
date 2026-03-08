'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchExperiments() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiments/`);
        if (!res.ok) throw new Error('Failed to fetch experiments');
        const data = await res.json();
        setExperiments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="md:flex md:items-center md:justify-between mb-8 pb-4 border-b border-border-custom">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold leading-7 text-text-primary sm:truncate sm:tracking-tight">
            Laboratory Dashboard
          </h2>
          <p className="mt-2 text-base text-text-secondary">Your recent Raman experiment sessions.</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/new" className="ml-3 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:focus-visible:outline hover:focus-visible:outline-2 hover:focus-visible:outline-offset-2 hover:focus-visible:outline-accent transition-colors">
            <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Session
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24">
           <svg className="animate-spin mx-auto h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <p className="mt-4 text-text-secondary">Loading sessions...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50/50 p-6 border border-red-200">
           <h3 className="text-base font-semibold text-red-800">Connection Error</h3>
           <div className="mt-2 text-sm text-red-700">
             <p>{error}</p>
             <p className="mt-2 text-red-600 font-medium">Please ensure the FastAPI backend is running.</p>
           </div>
        </div>
      ) : experiments.length === 0 ? (
        <div className="text-center rounded-2xl border-2 border-dashed border-border-custom bg-card-bg/50 py-20 px-6">
           <svg className="mx-auto h-12 w-12 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
           </svg>
           <h3 className="mt-5 text-base font-semibold text-text-primary">No sessions logged</h3>
           <p className="mt-2 text-sm text-text-secondary">Get started by creating a new experiment session.</p>
           <div className="mt-8">
             <Link href="/new" className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent/90 transition-colors">
               <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
               </svg>
               New Session
             </Link>
           </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
           {experiments.map((exp: any) => (
              <div key={exp.experiment_id} className="relative group overflow-hidden rounded-2xl border border-border-custom bg-card-bg shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 flex flex-col">
                <div className="px-6 py-6 flex-1">
                   <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-accent border border-indigo-100">
                        {exp.experiment_id}
                      </span>
                      <span className="text-xs text-text-secondary font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {exp.date}
                      </span>
                   </div>
                   
                   <h3 className="text-lg font-bold leading-6 text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                     {exp.title || 'Untitled Session'}
                   </h3>
                   <p className="text-sm text-text-secondary mb-5 line-clamp-2">{exp.objective_short}</p>
                   
                   <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                     <div>
                       <dt className="text-label font-bold tracking-wide text-[10px] uppercase">Type</dt>
                       <dd className="text-text-primary font-medium mt-0.5 truncate">{exp.technique}</dd>
                     </div>
                     <div>
                       <dt className="text-label font-bold tracking-wide text-[10px] uppercase">Sample</dt>
                       <dd className="text-text-primary font-medium mt-0.5 truncate">{exp.sample?.sample_name || 'N/A'}</dd>
                     </div>
                     <div className="col-span-2">
                       <dt className="text-label font-bold tracking-wide text-[10px] uppercase">Active Modules</dt>
                       <dd className="mt-1.5 flex gap-1.5 flex-wrap">
                         {exp.module_selection?.temperature_enabled && <span className="inline-flex items-center rounded bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-800 border border-orange-200">Temp</span>}
                         {exp.module_selection?.pressure_enabled && <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">Press</span>}
                         {exp.module_selection?.polarization_enabled && <span className="inline-flex items-center rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-800 border border-purple-200">Polar</span>}
                         {!exp.module_selection?.temperature_enabled && !exp.module_selection?.pressure_enabled && !exp.module_selection?.polarization_enabled && <span className="text-text-secondary text-xs italic bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Optics Only</span>}
                       </dd>
                     </div>
                   </dl>
                </div>
                <div className="bg-slate-50/80 border-t border-border-custom px-6 py-3.5 flex items-center justify-between mt-auto">
                   <div className="text-xs text-text-secondary font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {exp.researcher}
                   </div>
                   <Link href={`/experiment/${exp.experiment_id}`} className="text-sm font-semibold text-accent hover:text-indigo-800 flex items-center group-hover:underline">
                      View details 
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </Link>
                </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
