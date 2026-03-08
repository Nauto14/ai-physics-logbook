'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ExperimentDetail() {
  const params = useParams();
  const id = params.id;
  const [experiment, setExperiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchExperiment() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiments/${id}`);
        if (!res.ok) throw new Error('Failed to fetch experiment');
        const data = await res.json();
        setExperiment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchExperiment();
  }, [id]);

  if (loading) return (
      <div className="max-w-5xl mx-auto pb-12 text-center py-24">
         <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         <p className="mt-4 text-slate-500">Loading session details...</p>
      </div>
  );

  if (error || !experiment) return (
      <div className="max-w-5xl mx-auto pb-12">
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
             <h3 className="text-sm font-medium text-red-800">Error</h3>
             <div className="mt-2 text-sm text-red-700">{error || 'Experiment not found'}</div>
          </div>
          <div className="mt-4"><Link href="/" className="text-indigo-600 hover:text-indigo-800">&larr; Back to Dashboard</Link></div>
      </div>
  );

  const getAttachmentUrl = (filename: string, category: string) => {
    const att = experiment.attachments?.find((a: any) => a.file_name === filename && a.attachment_category === category);
    if (!att) return null;
    // file_path is now stored as a relative path like "experiments/EXP-001/datasets/file.txt"
    // Serve it via the backend's /api/files/ static mount
    const relativePath = att.file_path.replace(/\\/g, '/');
    return `${process.env.NEXT_PUBLIC_API_URL}/api/files/${relativePath}`;
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 print:max-w-none print:pb-0">
      <div className="mb-6 flex justify-between items-end pb-4 border-b border-border-custom print:hidden">
          <div>
            <Link href="/" className="text-sm font-semibold text-text-secondary hover:text-accent mb-2 inline-block transition-colors">&larr; Dashboard</Link>
            <h2 className="text-3xl font-bold leading-7 text-text-primary sm:truncate sm:tracking-tight">
              {experiment.title || 'Untitled Session'}
            </h2>
            <p className="mt-2 text-sm text-text-secondary flex items-center gap-4 font-medium">
               <span>ID: <span className="font-mono text-accent">{experiment.experiment_id}</span></span>
               <span className="text-border-custom">|</span>
               <span>{experiment.date} {experiment.start_time}</span>
               <span className="text-border-custom">|</span>
               <span>{experiment.researcher}</span>
            </p>
          </div>
          <div className="flex gap-2">
             <Link href={`/experiment/${id}/edit`} className="px-4 py-2 text-sm font-semibold bg-white border border-border-custom text-text-primary rounded-lg shadow-sm hover:bg-slate-50 transition-colors">Edit</Link>
             <button onClick={() => window.print()} className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Export Print</button>
          </div>
      </div>
      
      {/* Print header visible only when printing */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-bold mb-2">{experiment.title || 'Untitled Session'}</h1>
          <p className="text-sm text-slate-600">ID: {experiment.experiment_id} | {experiment.date} {experiment.start_time} | {experiment.researcher}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
              <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8 print:shadow-none print:border-slate-300">
                  <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent print:text-slate-800">Scientific Context</h3>
                  <div className="space-y-5 text-base text-text-primary">
                      <div><strong className="block text-sm text-label mb-1">Objective</strong> {experiment.objective_short}</div>
                      {experiment.research_question && <div><strong className="block text-sm text-label mb-1">Research Question</strong> {experiment.research_question}</div>}
                      <div><strong className="block text-sm text-label mb-1">Motivation</strong> {experiment.motivation}</div>
                      {experiment.expected_outcome && <div><strong className="block text-sm text-label mb-1">Expected Outcome</strong> {experiment.expected_outcome}</div>}
                  </div>
              </div>

              <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8 print:shadow-none print:border-slate-300">
                  <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent print:text-slate-800">Session Notes & Images</h3>
                  {experiment.timeline_entries && experiment.timeline_entries.length > 0 ? (
                      <div className="space-y-6">
                         {experiment.timeline_entries.map((tl: any) => (
                            <div key={tl.id} className="text-base text-text-primary bg-slate-50/50 p-4 rounded-xl border border-slate-100 print:border-slate-300 print:bg-white">
                               <div className="mb-2">
                                 <span className="text-text-secondary font-mono text-xs mr-3">{tl.timestamp.replace('T', ' ')}</span>
                                 <span className="px-2 py-0.5 bg-indigo-100/50 rounded text-[10px] font-bold tracking-wider text-accent border border-indigo-200/50 mr-2 uppercase print:border-slate-300 print:text-slate-800">{tl.entry_type}</span>
                               </div>
                               <p className="whitespace-pre-wrap">{tl.text}</p>
                               {tl.image_attachments && (
                                 <div className="mt-3 grid grid-cols-2 gap-4">
                                     {tl.image_attachments.split(',').map((imgName: string, i: number) => {
                                         const trimName = imgName.trim();
                                         const url = getAttachmentUrl(trimName, 'note_image');
                                         return url ? (
                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block max-w-sm border border-slate-200 rounded overflow-hidden">
                                               <img src={url} alt={trimName} className="w-full h-auto" />
                                            </a>
                                         ) : (
                                            <div key={i} className="text-sm text-accent italic"><svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{trimName}</div>
                                         );
                                     })}
                                 </div>
                               )}
                            </div>
                         ))}
                      </div>
                  ) : <p className="text-base text-text-secondary italic">No timeline entries recorded.</p>}
                  
                  <div className="mt-8 pt-6 border-t border-border-custom bg-slate-50 rounded-xl p-6 print:bg-white print:border-slate-300">
                     <h3 className="text-lg font-semibold mb-4 text-accent border-b border-border-custom pb-2">Session Reflection</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-label mb-1">Preliminary Impressions</h4>
                          <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.preliminary_impression || 'None'}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-semibold text-label mb-1">Challenges</h4>
                           <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.challenges_faced || 'None'}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-semibold text-label mb-1">Things That Worked</h4>
                           <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.things_that_worked_nicely || 'None'}</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-semibold text-label mb-1">Areas for Improvement</h4>
                           <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.things_to_improve || 'None'}</p>
                        </div>
                     </div>
                     {experiment.reflection_image_attachments && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                           <h4 className="text-sm font-semibold text-label mb-2">Reflection Images</h4>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {experiment.reflection_image_attachments.split(',').map((imgName: string, i: number) => {
                                  const trimName = imgName.trim();
                                  const url = getAttachmentUrl(trimName, 'reflection_image');
                                  return url ? (
                                     <a key={i} href={url} target="_blank" rel="noreferrer" className="block border border-slate-200 rounded overflow-hidden">
                                        <img src={url} alt={trimName} className="w-full h-auto object-cover" />
                                     </a>
                                  ) : <div key={i} className="text-sm italic">{trimName}</div>;
                              })}
                           </div>
                        </div>
                     )}
                  </div>
              </div>
              
              <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8">
                  <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent">Datasets</h3>
                  {experiment.datasets && experiment.datasets.length > 0 ? (
                      <div className="space-y-4">
                         {experiment.datasets.map((ds: any) => (
                             <div key={ds.id} className="text-sm p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="font-semibold text-text-primary flex justify-between items-center mb-2">
                                  <span>{ds.file_name}</span>
                                  {ds.dataset_group_name && <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-xs text-text-secondary">{ds.dataset_group_name}</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                                   {ds.integration_time_s && <div><span className="font-semibold text-label">Int Time:</span> {ds.integration_time_s}s</div>}
                                   {ds.accumulations && <div><span className="font-semibold text-label">Accums:</span> {ds.accumulations}</div>}
                                   {ds.laser_power_mW && <div><span className="font-semibold text-label">Power:</span> {ds.laser_power_mW}mW</div>}
                                   {ds.temperature_K && <div><span className="font-semibold text-label">Temp:</span> {ds.temperature_K}K</div>}
                                   {ds.pressure_GPa && <div><span className="font-semibold text-label">Press:</span> {ds.pressure_GPa}GPa</div>}
                                </div>
                                {ds.comments && <div className="mt-2 text-text-primary italic border-t border-slate-200 pt-2">{ds.comments}</div>}
                             </div>
                         ))}
                      </div>
                  ) : <p className="text-base text-text-secondary italic">No datasets attached yet.</p>}
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8">
                  <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent">Sample</h3>
                  {experiment.sample ? (
                      <dl className="text-base space-y-4">
                          <div><dt className="text-sm font-semibold text-label">Name</dt><dd className="font-medium text-text-primary">{experiment.sample.sample_name}</dd></div>
                          <div><dt className="text-sm font-semibold text-label">Formula</dt><dd className="font-medium text-text-primary">{experiment.sample.chemical_formula || '-'}</dd></div>
                          <div><dt className="text-sm font-semibold text-label">Type</dt><dd className="font-medium text-text-primary">{experiment.sample.sample_type || '-'}</dd></div>
                          {experiment.sample.mounting_notes && <div><dt className="text-sm font-semibold text-label">Mounting Notes</dt><dd className="font-medium text-text-primary bg-slate-50 p-2 rounded mt-1 border border-slate-100">{experiment.sample.mounting_notes}</dd></div>}
                          {experiment.sample.preparation_notes && <div><dt className="text-sm font-semibold text-label">Prep Notes</dt><dd className="font-medium text-text-primary">{experiment.sample.preparation_notes}</dd></div>}
                          {experiment.sample.sample_images && (
                             <div className="mt-2">
                                <dt className="text-sm font-semibold text-label mb-2">Sample Images</dt>
                                <dd className="grid grid-cols-2 gap-2">
                                  {experiment.sample.sample_images.split(',').map((imgName: string, i: number) => {
                                      const trimName = imgName.trim();
                                      const url = getAttachmentUrl(trimName, 'sample_image');
                                      return url ? (
                                         <a key={i} href={url} target="_blank" rel="noreferrer" className="block border border-slate-200 rounded overflow-hidden">
                                            <img src={url} alt={trimName} className="w-full h-auto object-cover" />
                                         </a>
                                      ) : <div key={i} className="text-sm italic">{trimName}</div>;
                                  })}
                                </dd>
                             </div>
                          )}
                      </dl>
                  ) : <p className="text-base text-text-secondary italic">No sample linked.</p>}
              </div>

              <div className="bg-slate-50/80 shadow-inner border border-border-custom rounded-2xl p-8">
                  <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-text-primary">Instrument Setup</h3>
                  
                  {experiment.laser_optics_module && (
                     <div className="mb-4 bg-white p-4 rounded-xl shadow-sm text-base border border-slate-200">
                        <h4 className="font-semibold mb-3 text-indigo-900 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>Laser Optics</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                           <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">&lambda;</span>{experiment.laser_optics_module.laser_wavelength_nm} nm</div>
                           <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">Default Power</span>{experiment.laser_optics_module.laser_power_mW || 'N/A'} mW</div>
                           <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">Obj</span>{experiment.laser_optics_module.objective}</div>
                           <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">Grating</span>{experiment.laser_optics_module.grating}</div>
                        </div>
                     </div>
                  )}

                  {experiment.temperature_module && (
                      <div className="mb-4 bg-orange-50/80 p-4 rounded-xl shadow-sm text-base border border-orange-200/60">
                        <h4 className="font-semibold mb-2 text-orange-900 border-b border-orange-200/50 pb-1">Temperature</h4>
                        <div className="text-sm text-orange-800 font-medium">
                           {experiment.temperature_module.scan_direction}: {experiment.temperature_module.start_temperature_K}K &rarr; {experiment.temperature_module.end_temperature_K}K <span className="opacity-75 font-normal">(step: {experiment.temperature_module.temperature_step_K}K)</span>
                        </div>
                      </div>
                  )}

                  {experiment.pressure_module && (
                      <div className="mb-4 bg-blue-50/80 p-4 rounded-xl shadow-sm text-base border border-blue-200/60">
                        <h4 className="font-semibold mb-2 text-blue-900 border-b border-blue-200/50 pb-1">High Pressure (DAC)</h4>
                        <div className="text-sm text-blue-800 space-y-1.5 font-medium">
                           <div>Range: {experiment.pressure_module.start_pressure_GPa} &rarr; {experiment.pressure_module.end_pressure_GPa} GPa</div>
                           <div className="font-normal opacity-90"><strong className="font-semibold">Cell:</strong> {experiment.pressure_module.cell_type}</div>
                           <div className="font-normal opacity-90"><strong className="font-semibold">Medium:</strong> {experiment.pressure_module.pressure_medium}</div>
                           <div className="font-normal opacity-90"><strong className="font-semibold">Calib:</strong> {experiment.pressure_module.pressure_calibration_method}</div>
                           {experiment.pressure_module.sample_length_um && (
                              <div className="mt-2 pt-2 border-t border-blue-200/50">
                                <strong className="font-semibold block mb-1">Sample Dimensions:</strong>
                                <div className="grid grid-cols-3 gap-1 text-xs">
                                  {experiment.pressure_module.sample_length_um && <div>L: {experiment.pressure_module.sample_length_um} µm</div>}
                                  {experiment.pressure_module.sample_width_um && <div>W: {experiment.pressure_module.sample_width_um} µm</div>}
                                  {experiment.pressure_module.sample_thickness_um && <div>T: {experiment.pressure_module.sample_thickness_um} µm</div>}
                                </div>
                                {experiment.pressure_module.sample_dimensions_notes && <div className="mt-1 italic text-xs">{experiment.pressure_module.sample_dimensions_notes}</div>}
                              </div>
                           )}
                        </div>
                      </div>
                  )}
                  
                  {experiment.polarization_module && (
                      <div className="mb-4 bg-purple-50/80 p-4 rounded-xl shadow-sm text-base border border-purple-200/60">
                         <h4 className="font-semibold mb-2 text-purple-900 border-b border-purple-200/50 pb-1">Polarization</h4>
                         <div className="text-sm text-purple-800 space-y-1.5 font-medium">
                            <div>Config: {experiment.polarization_module.selected_polarizations}</div>
                            {experiment.polarization_module.custom_polarization_optional && <div className="font-normal opacity-90">Custom: {experiment.polarization_module.custom_polarization_optional}</div>}
                            {experiment.polarization_module.crystal_orientation_reference && <div className="font-normal opacity-90"><strong className="font-semibold">Context:</strong> {experiment.polarization_module.crystal_orientation_reference}</div>}
                         </div>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}
