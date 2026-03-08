'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { InstrumentModule } from '@/components/InstrumentModule';
import { ConditionModules } from '@/components/ConditionModules';
import { TimelineNotes } from '@/components/TimelineNotes';
import { DatasetUploader } from '@/components/DatasetUploader';
import { PolarizationModule } from '@/components/PolarizationModule';

export default function EditExperiment() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Metadata & Scientific Context
  const [metadata, setMetadata] = useState({
    experiment_id: `EXP-V2-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: new Date().toTimeString().split(' ')[0].substring(0, 5) + ":00",
    researcher: '',
    collaborators: '',
    lab_system: '',
    technique: 'Raman Spectroscopy',
    status: 'planned',
    objective_short: '',
    motivation: '',
    research_question: '',
    expected_outcome: '',
    tags: '',
  });

  // 2. Sample
  const [sample, setSample] = useState({
    sample_id: `SAMP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    sample_name: '',
    chemical_formula: '',
    sample_type: '',
    dimensions: '',
    preparation_notes: '',
    mounting_notes: ''
  });
  
  const [existingSamples, setExistingSamples] = useState<any[]>([]);
  const [isNewSample, setIsNewSample] = useState(true);

  // Fetch existing samples
  useEffect(() => {
    async function fetchSamples() {
       try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/samples/`);
         if (res.ok) {
            const uniqueSamples = await res.json();
            setExistingSamples(uniqueSamples);
         }
       } catch (e) { console.error('Failed to load samples', e); }
    }
    fetchSamples();
  }, []);

  // Fetch Existing Experiment to Edit
  useEffect(() => {
    async function fetchExp() {
      if (!id) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiments/${id}`);
        if (res.ok) {
           const data = await res.json();
           
           setMetadata({
             experiment_id: data.experiment_id,
             title: data.title,
             date: data.date,
             start_time: data.start_time,
             researcher: data.researcher,
             collaborators: data.collaborators || '',
             lab_system: data.lab_system,
             technique: data.technique,
             status: data.status,
             objective_short: data.objective_short,
             motivation: data.motivation,
             research_question: data.research_question || '',
             expected_outcome: data.expected_outcome || '',
             tags: data.tags
           });

           if (data.sample) {
             setSample({
               sample_id: data.sample.sample_id,
               sample_name: data.sample.sample_name,
               chemical_formula: data.sample.chemical_formula || '',
               sample_type: data.sample.sample_type || '',
               dimensions: data.sample.dimensions || '',
               preparation_notes: data.sample.preparation_notes || '',
               mounting_notes: data.sample.mounting_notes || ''
             });
             setIsNewSample(true); // Treat as editing the sample attached
           }

           setReflection({
             general_setup_notes: data.general_setup_notes || '',
             preliminary_impression: data.preliminary_impression || '',
             challenges_faced: data.challenges_faced || '',
             things_to_improve: data.things_to_improve || '',
             things_that_worked_nicely: data.things_that_worked_nicely || ''
           });

           if (data.module_selection) {
             setModules({
               temperature_enabled: data.module_selection.temperature_enabled || false,
               pressure_enabled: data.module_selection.pressure_enabled || false,
               polarization_enabled: data.module_selection.polarization_enabled || false,
               mapping_enabled: data.module_selection.mapping_enabled || false
             });
           }

           if (data.temperature_module) setTempData({ ...data.temperature_module });
           if (data.pressure_module) setPressureData({ ...data.pressure_module });
           if (data.laser_optics_module) setOpticsData({ ...data.laser_optics_module });
           if (data.polarization_module) setPolarData({ ...data.polarization_module });
           
           if (data.timeline_entries?.length > 0) setTimeline(data.timeline_entries);
           if (data.datasets?.length > 0) setDatasets(data.datasets);
        }
      } catch(e) {}
    }
    fetchExp();
  }, [id]);

  // 3. Module Selection State
  const [modules, setModules] = useState({
    temperature_enabled: false,
    pressure_enabled: false,
    polarization_enabled: false,
    mapping_enabled: false
  });

  // 4. Module Data States
  const [tempData, setTempData] = useState({ enabled: true, start_temperature_K: '', end_temperature_K: '', temperature_step_K: '', scan_direction: 'cooling' });
  const [pressureData, setPressureData] = useState({ enabled: true, start_pressure_GPa: '', end_pressure_GPa: '', pressure_step_GPa: '', cell_type: '', pressure_medium: '', pressure_calibration_method: '' });
  const [opticsData, setOpticsData] = useState({ laser_wavelength_nm: '532', laser_power_mW: '1', objective: '50x', grating: '1800', spectrometer: 'LabRAM HR' });
  const [polarData, setPolarData] = useState({ selected_polarizations: '', custom_polarization_optional: '', crystal_orientation_reference: '', alignment_notes: '' });
  
  // 5. Timeline (simplified for MVP entry)
  const [timeline, setTimeline] = useState([{
    entry_id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString().slice(0, 19),
    author: '',
    entry_type: 'preparation',
    text: ''
  }]);
  
  // 6. Datasets
  const [datasets, setDatasets] = useState<any[]>([]);

  // 7. Reflection
  const [reflection, setReflection] = useState({
    general_setup_notes: '',
    preliminary_impression: '',
    challenges_faced: '',
    things_to_improve: '',
    things_that_worked_nicely: ''
  });

  // 8. Physical Files State
  const [sampleImages, setSampleImages] = useState<File[]>([]);
  const [reflectionImages, setReflectionImages] = useState<File[]>([]);
  // We'll manage timeline images uniquely natively inside the Timeline Component soon, or attach them blindly here for MVP
  const [timelineImages, setTimelineImages] = useState<File[]>([]);

  const handleMetadataChange = (e: any) => setMetadata({ ...metadata, [e.target.name]: e.target.value });
  const handleSampleChange = (e: any) => setSample({ ...sample, [e.target.name]: e.target.value });
  const handleReflectionChange = (e: any) => setReflection({ ...reflection, [e.target.name]: e.target.value });
  const toggleModule = (modName: string) => setModules({ ...modules, [modName]: !modules[modName as keyof typeof modules] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Construct heavy V2 payload
    const payload = {
      ...metadata,
      ...reflection,
      sample: {
        ...sample,
        chemical_formula: sample.chemical_formula || null,
        dimensions: sample.dimensions || null,
        preparation_notes: sample.preparation_notes || null,
        mounting_notes: sample.mounting_notes || null,
      },
      module_selection: modules,
      
      ...(modules.temperature_enabled && { temperature_module: {
          enabled: true,
          start_temperature_K: Number(tempData.start_temperature_K) || 0,
          end_temperature_K: Number(tempData.end_temperature_K) || 0,
          temperature_step_K: Number(tempData.temperature_step_K) || 0,
          scan_direction: tempData.scan_direction || 'cooling'
      }}),
      
      ...(modules.pressure_enabled && { pressure_module: {
          enabled: true,
          start_pressure_GPa: Number(pressureData.start_pressure_GPa) || 0,
          end_pressure_GPa: Number(pressureData.end_pressure_GPa) || 0,
          pressure_step_GPa: Number(pressureData.pressure_step_GPa) || null,
          cell_type: pressureData.cell_type || '',
          pressure_medium: pressureData.pressure_medium || '',
          pressure_calibration_method: pressureData.pressure_calibration_method || ''
      }}),

      ...(modules.polarization_enabled && { polarization_module: {
          enabled: true,
          selected_polarizations: polarData.selected_polarizations || '',
          custom_polarization_optional: polarData.custom_polarization_optional || null,
          crystal_orientation_reference: polarData.crystal_orientation_reference || '',
          alignment_notes: polarData.alignment_notes || null
      }}),
      
      laser_optics_module: {
          laser_wavelength_nm: Number(opticsData.laser_wavelength_nm) || 532,
          objective: opticsData.objective || '50x',
          grating: opticsData.grating || '1800',
          spectrometer: opticsData.spectrometer || 'LabRAM HR'
      },
      
      // Cleanup timeline array
      timeline_entries: timeline.filter(t => t.text.trim() !== ''),
      datasets: datasets.map(d => {
         const { fileObj, ...rest } = d;
         return rest; // Strip physical file object before JSON dumping metadata
      })
    };

    const formData = new FormData();
    formData.append("metadata", JSON.stringify(payload));
    
    // Append Dataset physical files
    datasets.forEach(d => {
       if (d.fileObj) formData.append("dataset_files", d.fileObj);
    });
    
    // Append Image attachments
    sampleImages.forEach(f => formData.append("sample_images", f));
    reflectionImages.forEach(f => formData.append("reflection_images", f));
    timelineImages.forEach(f => formData.append("timeline_images", f));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiments/${metadata.experiment_id}`, {
        method: 'PUT',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData.detail) || 'Failed to save experiment');
      }

      router.push(`/experiment/${metadata.experiment_id}`);
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
            Edit Raman Experiment Session
          </h2>
          <p className="mt-2 text-base text-text-secondary">Configure your campaign, modular conditions, and session context.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50/50 p-4 mb-6 border border-red-200">
          <h3 className="text-sm font-semibold text-red-800">Error saving session</h3>
          <div className="mt-2 text-sm text-red-700 whitespace-pre-wrap"><p>{error}</p></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Metadata Card */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8 transition-colors">
          <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4 text-accent">Experiment Overview</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-4 sm:gap-x-6">
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Project Title</label>
              <input required type="text" name="title" value={metadata.title} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-label">Date</label>
              <input required type="date" name="date" value={metadata.date} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-label">Time</label>
              <input required type="time" name="start_time" step="1" value={metadata.start_time} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Lead Researcher</label>
              <input required type="text" name="researcher" value={metadata.researcher} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Tags (comma separated)</label>
              <input type="text" name="tags" value={metadata.tags} onChange={handleMetadataChange} placeholder="high-pressure, DAC, raman"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div className="sm:col-span-4">
              <label className="block text-sm font-semibold text-label">Lab / System</label>
              <input required type="text" name="lab_system" value={metadata.lab_system} onChange={handleMetadataChange} placeholder="LabRAM HR Evolution"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-4">
               <label className="block text-sm font-semibold text-label">Short Objective</label>
               <input required type="text" name="objective_short" value={metadata.objective_short} onChange={handleMetadataChange}
                 className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm font-semibold text-label">Scientific Motivation / Research Question</label>
              <textarea required rows={3} name="motivation" value={metadata.motivation} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
          </div>
        </div>

        {/* Sample Card */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8 transition-colors">
          <div className="flex justify-between items-center border-b border-border-custom pb-4 mb-6">
            <h3 className="text-xl font-semibold leading-6 text-text-primary text-accent">Sample Information</h3>
            <div className="flex items-center space-x-2 text-sm bg-slate-50 p-1.5 rounded-lg border border-border-custom">
               <button type="button" onClick={() => setIsNewSample(true)} className={`px-4 py-1.5 rounded-md transition-colors ${isNewSample ? 'bg-white shadow-sm font-semibold text-accent border border-border-custom' : 'text-text-secondary hover:text-text-primary'}`}>New Sample</button>
               <button type="button" onClick={() => setIsNewSample(false)} className={`px-4 py-1.5 rounded-md transition-colors ${!isNewSample ? 'bg-white shadow-sm font-semibold text-accent border border-border-custom' : 'text-text-secondary hover:text-text-primary'}`}>Existing Sample</button>
            </div>
          </div>
          
          {!isNewSample && existingSamples.length > 0 ? (
             <div className="mb-8 bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl">
                <label className="block text-sm font-semibold text-indigo-900 mb-2">Select From Previous Sessions</label>
                <select onChange={(e) => {
                   const s = existingSamples.find(x => x.sample_name === e.target.value);
                   if(s) setSample({...s, sample_id: `SAMP-REUSE-${Math.floor(Math.random()*1000)}`});
                }} className="mt-1 block w-full rounded-md border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 text-base p-2.5 bg-white">
                  <option value="">-- Choose Sample --</option>
                  {existingSamples.map((s:any, i) => <option key={i} value={s.sample_name}>{s.sample_name} ({s.chemical_formula || 'Unknown'})</option>)}
                </select>
             </div>
          ) : !isNewSample && existingSamples.length === 0 ? (
             <p className="text-sm text-text-secondary italic mb-6">No previous samples found in history.</p>
          ) : null}

          <div className={`grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-6 ${!isNewSample ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-semibold text-label">Sample Name</label>
              <input required={isNewSample} type="text" name="sample_name" value={sample.sample_name} onChange={handleSampleChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-label">Formula</label>
              <input type="text" name="chemical_formula" value={sample.chemical_formula} onChange={handleSampleChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-label">Type</label>
              <select name="sample_type" value={sample.sample_type} onChange={handleSampleChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white">
                <option value="">Select...</option>
                <option value="single crystal">Single Crystal</option>
                <option value="thin film">Thin Film</option>
                <option value="powder">Powder</option>
                <option value="pellet">Pellet</option>
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-label">Mounting, Cell & Storage Notes</label>
              <input type="text" name="mounting_notes" value={sample.mounting_notes || ''} onChange={handleSampleChange} placeholder="e.g. Loaded in symmetric DAC with Argon"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div className="sm:col-span-3">
               <label className="block text-sm font-semibold text-label mb-2">Sample Images (Microscope / Loading)</label>
               <div className="flex items-center gap-4">
                 <label className="cursor-pointer text-sm font-medium text-accent hover:text-indigo-800 flex items-center bg-indigo-50/50 px-4 py-2 rounded-md border border-indigo-100 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Upload Images
                    <input type="file" multiple className="hidden" onChange={(e) => { if(e.target.files) setSampleImages(Array.from(e.target.files)); }} />
                 </label>
                 <span className="text-xs text-text-secondary italic">{sampleImages.length > 0 ? `${sampleImages.length} images selected.` : 'Image attachments will be linked to the Sample entity.'}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="bg-slate-50/50 shadow-inner border border-slate-200 sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4">Experimental Setup Modules</h3>
          <p className="text-base text-text-secondary mt-2 mb-6">Enable the conditional modules relevant for this session to unhide their fields.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent hover:shadow-md transition-all">
              <input type="checkbox" checked={modules.temperature_enabled} onChange={() => toggleModule('temperature_enabled')} className="form-checkbox h-5 w-5 text-accent rounded border-border-custom focus:ring-accent" />
              <span className="text-text-primary font-semibold">Temperature</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent hover:shadow-md transition-all">
              <input type="checkbox" checked={modules.pressure_enabled} onChange={() => toggleModule('pressure_enabled')} className="form-checkbox h-5 w-5 text-accent rounded border-border-custom focus:ring-accent" />
              <span className="text-text-primary font-semibold">Pressure</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent hover:shadow-md transition-all">
               <input type="checkbox" checked={modules.polarization_enabled} onChange={() => toggleModule('polarization_enabled')} className="form-checkbox h-5 w-5 text-accent rounded border-border-custom focus:ring-accent" />
               <span className="text-text-primary font-semibold">Polarization</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:bg-slate-50 transition opacity-50">
               <input disabled type="checkbox" className="form-checkbox h-5 w-5 rounded border-border-custom" />
               <span className="text-text-secondary">Mapping (Soon)</span>
            </label>
          </div>

          <div className="space-y-6">
            <InstrumentModule opticsData={opticsData} setOpticsData={setOpticsData} />
            <ConditionModules 
              modules={modules} 
              tempData={tempData} setTempData={setTempData}
              pressureData={pressureData} setPressureData={setPressureData} 
            />
            <PolarizationModule modules={modules} polarData={polarData} setPolarData={setPolarData} />
          </div>
        </div>

        {/* Experimental Datasets */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
           <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4">Attach Spectroscopic Scans</h3>
           <p className="text-base text-text-secondary mt-2 mb-6">Upload the raw or processed data files acquired during this session.</p>
           <DatasetUploader datasets={datasets} setDatasets={setDatasets} />
        </div>

        {/* Timeline Notes */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
           <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4">Session Notes & Images</h3>
           <div className="mt-4">
               <TimelineNotes 
                 timeline={timeline} 
                 setTimeline={setTimeline} 
                 researcher={metadata.researcher}
                 timelineImages={timelineImages}
                 setTimelineImages={setTimelineImages}
               />
           </div>
        </div>

        {/* Reflections */}
        <div className="bg-slate-50/50 shadow-sm border border-border-custom sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4 text-accent">Session Reflection</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-label">General Setup Details</label>
               <textarea rows={2} name="general_setup_notes" value={reflection.general_setup_notes || ''} onChange={handleReflectionChange}
                 className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Preliminary Impressions</label>
              <textarea rows={3} name="preliminary_impression" value={reflection.preliminary_impression} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Challenges Faced</label>
              <textarea rows={3} name="challenges_faced" value={reflection.challenges_faced} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Things That Worked Nicely</label>
              <textarea rows={3} name="things_that_worked_nicely" value={reflection.things_that_worked_nicely || ''} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Areas for Improvement Next Time</label>
              <textarea rows={3} name="things_to_improve" value={reflection.things_to_improve || ''} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div className="md:col-span-2 mt-2">
               <label className="block text-sm font-semibold text-label mb-2">Final Session Images (e.g. Sample post-measurement)</label>
               <div className="flex items-center gap-4">
                 <label className="cursor-pointer text-sm font-medium text-accent hover:text-indigo-800 flex items-center bg-indigo-50/50 px-4 py-2 rounded-md border border-indigo-100 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Upload Session Images
                    <input type="file" multiple className="hidden" onChange={(e) => { if(e.target.files) setReflectionImages(Array.from(e.target.files)); }} />
                 </label>
                 <span className="text-xs text-text-secondary italic">{reflectionImages.length > 0 ? `${reflectionImages.length} images selected.` : ''}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-x-4 sticky bottom-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button type="button" onClick={() => router.push('/')}
            className="rounded-lg bg-white py-2.5 px-6 text-sm font-semibold text-text-primary shadow-sm border border-border-custom hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="rounded-lg bg-accent py-2.5 px-8 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors">
            {loading ? 'Saving Campaign...' : 'Update Raman Session'}
          </button>
        </div>

      </form>
    </div>
  );
}
