import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../utils/api';
import { 
  Building2, ArrowLeft, Upload, FileSpreadsheet, 
  Plus, X, Check, Loader2, File, Video, Image as ImageIcon,
  Shield, User, LogOut, AlertCircle, CheckCircle
} from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  const [uploadMode, setUploadMode] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    project_name: '',
    developer_name: '',
    location: '',
    plot_size: '',
    total_towers: '',
    total_floors: '',
    possession: '',
    budget_min: '',
    budget_max: '',
    carpet_area_min: '',
    carpet_area_max: '',
    configurations: [],
    rate_psf_min: '',
    rate_psf_max: '',
    availability_status: 'Ready',
    notes: '',
    client_requirement_tags: '',
    google_maps_link: ''
  });
  
  const [excelFile, setExcelFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaType, setMediaType] = useState('floor_plan');
  const [mediaConfig, setMediaConfig] = useState('');
  
  const configOptions = ['2 BHK', '3 BHK', '4 BHK', '5 BHK', '6 BHK', 'Penthouse', 'Villa'];
  const statusOptions = ['Ready', 'Under Construction', 'Coming Soon', 'Sold Out'];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleConfigToggle = (config) => {
    setFormData(prev => ({
      ...prev,
      configurations: prev.configurations.includes(config)
        ? prev.configurations.filter(c => c !== config)
        : [...prev.configurations, config]
    }));
  };

  const handleMediaFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const projectData = {
        ...formData,
        total_towers: formData.total_towers ? parseInt(formData.total_towers) : null,
        total_floors: formData.total_floors || null,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        carpet_area_min: formData.carpet_area_min ? parseInt(formData.carpet_area_min) : null,
        carpet_area_max: formData.carpet_area_max ? parseInt(formData.carpet_area_max) : null,
        rate_psf_min: formData.rate_psf_min ? parseFloat(formData.rate_psf_min) : null,
        rate_psf_max: formData.rate_psf_max ? parseFloat(formData.rate_psf_max) : null,
        client_requirement_tags: formData.client_requirement_tags
          ? formData.client_requirement_tags.split(',').map(t => t.trim())
          : []
      };

      const result = await projectsAPI.create(projectData);

      if (mediaFiles.length > 0) {
        await projectsAPI.uploadMedia(result.project.id, mediaFiles, mediaType, mediaConfig);
      }

      setSuccess('Project created successfully!');
      setFormData({
        project_name: '', developer_name: '', location: '', plot_size: '',
        total_towers: '', total_floors: '', possession: '',
        budget_min: '', budget_max: '', carpet_area_min: '', carpet_area_max: '',
        configurations: [], rate_psf_min: '', rate_psf_max: '',
        availability_status: 'Ready', notes: '', client_requirement_tags: '', google_maps_link: ''
      });
      setMediaFiles([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) { setError('Please select an Excel file'); return; }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await projectsAPI.bulkUpload(excelFile);

      if (result.results.errors && result.results.errors.length > 0) {
        console.error('Upload errors:', result.results.errors);
        const firstError = result.results.errors[0];
        setError(`Row ${firstError.row} failed: ${firstError.error}`);
        if (result.results.success > 0) {
          setSuccess(`${result.results.success} projects created successfully.`);
        }
      } else {
        setSuccess(`Upload complete! ${result.results.success} projects created, ${result.results.failed} failed.`);
      }

      setExcelFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to upload Excel file';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await projectsAPI.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'projects-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Template download error:', err);
      setError('Failed to download template');
    }
  };

  return (
    <div className="upload-page">
      <div className="page-bg"><div className="gradient-orb orb-1"></div><div className="gradient-orb orb-2"></div></div>

      <nav className="page-nav">
        <div className="nav-left">
          <Link to="/dashboard" className="back-btn"><ArrowLeft size={20} /></Link>
          <Link to="/" className="nav-logo"><Building2 size={24} strokeWidth={1.5} /><span>MAK Kotwal Venus</span></Link>
        </div>
        <div className="nav-right">
          <div className="user-badge">{isAdmin() ? <Shield size={16} /> : <User size={16} />}<span>{user?.name}</span></div>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /></button>
        </div>
      </nav>

      <main className="upload-content">
        <div className="upload-header">
          <h1><Upload size={28} /><span>Upload Projects</span></h1>
          <p>Add new projects manually or bulk import via Excel</p>
        </div>

        <div className="mode-toggle">
          <button className={uploadMode === 'manual' ? 'active' : ''} onClick={() => setUploadMode('manual')}>
            <Plus size={18} /><span>Manual Entry</span>
          </button>
          <button className={uploadMode === 'excel' ? 'active' : ''} onClick={() => setUploadMode('excel')}>
            <FileSpreadsheet size={18} /><span>Excel Import</span>
          </button>
        </div>

        {error && <div className="alert error"><AlertCircle size={18} /><span>{error}</span><button onClick={() => setError('')}><X size={16} /></button></div>}
        {success && <div className="alert success"><CheckCircle size={18} /><span>{success}</span><button onClick={() => setSuccess('')}><X size={16} /></button></div>}

        {uploadMode === 'manual' && (
          <form className="upload-form" onSubmit={handleManualSubmit}>
            <div className="form-section">
              <h2>Project Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name *</label>
                  <input type="text" name="project_name" value={formData.project_name} onChange={handleFormChange} placeholder="Enter project name" required />
                </div>
                <div className="form-group">
                  <label>Developer Name</label>
                  <input type="text" name="developer_name" value={formData.developer_name} onChange={handleFormChange} placeholder="Enter developer name" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleFormChange} placeholder="City or area" />
                </div>
                <div className="form-group">
                  <label>Plot Size</label>
                  <input type="text" name="plot_size" value={formData.plot_size} onChange={handleFormChange} placeholder="e.g. 5 Acres" />
                </div>
                <div className="form-group">
                  <label>Total Towers</label>
                  <input type="number" name="total_towers" value={formData.total_towers} onChange={handleFormChange} placeholder="Number of towers" />
                </div>
                <div className="form-group">
                  <label>Total Floors</label>
                  <input type="text" name="total_floors" value={formData.total_floors} onChange={handleFormChange} placeholder="e.g. G+14 or 15" />
                </div>
                <div className="form-group">
                  <label>Possession</label>
                  <input type="text" name="possession" value={formData.possession} onChange={handleFormChange} placeholder="e.g. Dec 2025" />
                </div>
                <div className="form-group">
                  <label>Budget Min (₹)</label>
                  <input type="number" name="budget_min" value={formData.budget_min} onChange={handleFormChange} placeholder="Minimum budget" />
                </div>
                <div className="form-group">
                  <label>Budget Max (₹)</label>
                  <input type="number" name="budget_max" value={formData.budget_max} onChange={handleFormChange} placeholder="Maximum budget" />
                </div>
                <div className="form-group">
                  <label>Carpet Area Min (sq.ft)</label>
                  <input type="number" name="carpet_area_min" value={formData.carpet_area_min} onChange={handleFormChange} placeholder="e.g. 800" />
                </div>
                <div className="form-group">
                  <label>Carpet Area Max (sq.ft)</label>
                  <input type="number" name="carpet_area_max" value={formData.carpet_area_max} onChange={handleFormChange} placeholder="e.g. 1500" />
                </div>
                <div className="form-group">
                  <label>Rate PSF Min (₹)</label>
                  <input type="number" name="rate_psf_min" value={formData.rate_psf_min} onChange={handleFormChange} placeholder="e.g. 15000" />
                </div>
                <div className="form-group">
                  <label>Rate PSF Max (₹)</label>
                  <input type="number" name="rate_psf_max" value={formData.rate_psf_max} onChange={handleFormChange} placeholder="e.g. 20000" />
                </div>
                <div className="form-group">
                  <label>Availability Status</label>
                  <select name="availability_status" value={formData.availability_status} onChange={handleFormChange}>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Client Tags</label>
                  <input type="text" name="client_requirement_tags" value={formData.client_requirement_tags} onChange={handleFormChange} placeholder="Tags (comma separated)" />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Configurations</label>
                <div className="config-options">
                  {configOptions.map(config => (
                    <button key={config} type="button" className={`config-btn ${formData.configurations.includes(config) ? 'selected' : ''}`} onClick={() => handleConfigToggle(config)}>
                      {formData.configurations.includes(config) && <Check size={14} />}<span>{config}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Additional notes..." rows={3} />
              </div>
              <div className="form-group full-width">
                <label>Google Maps Link</label>
                <input type="url" name="google_maps_link" value={formData.google_maps_link} onChange={handleFormChange} placeholder="https://maps.google.com/?q=..." />
              </div>
            </div>

            <div className="form-section">
              <h2>Attachments</h2>
              <p className="section-note">Upload floor plans, videos, brochures. Media files cannot be bulk uploaded via Excel.</p>
              <div className="media-upload-area">
                <div className="media-controls">
                  <div className="form-group">
                    <label>Media Type</label>
                    <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                      <option value="floor_plan">Floor Plan</option>
                      <option value="video">Video</option>
                      <option value="brochure">Brochure</option>
                      <option value="image">Image</option>
                      <option value="pdf">PDF Document</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Configuration (optional)</label>
                    <select value={mediaConfig} onChange={(e) => setMediaConfig(e.target.value)}>
                      <option value="">Select configuration</option>
                      {configOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <div className="file-drop-zone">
                  <input type="file" id="media-files" multiple onChange={handleMediaFileChange} accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mov" />
                  <label htmlFor="media-files"><Upload size={32} /><span>Click to upload or drag files here</span><small>PDF, Images, Videos (max 100MB each)</small></label>
                </div>
                {mediaFiles.length > 0 && (
                  <div className="file-list">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        {file.type.includes('video') ? <Video size={18} /> : file.type.includes('image') ? <ImageIcon size={18} /> : <File size={18} />}
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button type="button" className="remove-file" onClick={() => removeMediaFile(index)}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><Loader2 className="spin" size={18} /><span>Creating...</span></> : <><Plus size={18} /><span>Create Project</span></>}
              </button>
            </div>
          </form>
        )}

        {uploadMode === 'excel' && (
          <form className="upload-form" onSubmit={handleExcelUpload}>
            <div className="form-section">
              <h2>Bulk Import via Excel</h2>
              <p className="section-note">Upload an Excel file (.xlsx) with project data.</p>
              <div className="template-download">
                <FileSpreadsheet size={24} />
                <div className="template-info"><span>Excel Template</span><small>Download and fill in your project data</small></div>
                <button type="button" onClick={handleDownloadTemplate} className="download-template-btn">Download Template</button>
              </div>
              <div className="excel-columns">
                <h3>Required Columns:</h3>
                <div className="columns-list">
                  <span>Project Name *</span><span>Developer Name</span><span>Location</span><span>Plot Size</span>
                  <span>Total Towers</span><span>Total Floors</span><span>Possession</span>
                  <span>Budget Min</span><span>Budget Max</span><span>Carpet Area Min</span><span>Carpet Area Max</span>
                  <span>Configurations</span><span>Rate psf Min</span><span>Rate psf Max</span>
                  <span>Availability Status</span><span>Notes</span><span>Client Tags</span><span>Google Maps Link</span>
                </div>
              </div>
              <div className="file-drop-zone excel-zone">
                <input type="file" id="excel-file" accept=".xlsx,.xls" onChange={(e) => setExcelFile(e.target.files[0])} />
                <label htmlFor="excel-file">
                  <FileSpreadsheet size={40} />
                  {excelFile ? <><span className="selected-file">{excelFile.name}</span><small>Click to change file</small></> : <><span>Click to select Excel file</span><small>.xlsx or .xls format</small></>}
                </label>
              </div>
              <div className="excel-note"><AlertCircle size={16} /><span>Note: Floor plans, videos, and other media files must be uploaded manually after bulk import.</span></div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading || !excelFile}>
                {loading ? <><Loader2 className="spin" size={18} /><span>Uploading...</span></> : <><Upload size={18} /><span>Import Projects</span></>}
              </button>
            </div>
          </form>
        )}
      </main>

      <style>{`
        .upload-page { min-height: 100vh; background: #0a0a0f; position: relative; }
        .page-bg { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
        .gradient-orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.2; }
        .orb-1 { width: 500px; height: 500px; background: linear-gradient(135deg, #c9a962 0%, #8b7355 100%); top: -100px; right: -100px; }
        .orb-2 { width: 400px; height: 400px; background: linear-gradient(135deg, #2d4a3e 0%, #1a2f25 100%); bottom: -100px; left: -100px; }
        .page-nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: rgba(10, 10, 15, 0.9); border-bottom: 1px solid rgba(255, 255, 255, 0.06); backdrop-filter: blur(10px); }
        .nav-left { display: flex; align-items: center; gap: 1rem; }
        .back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; color: rgba(255, 255, 255, 0.7); transition: all 0.2s ease; }
        .back-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .nav-logo { display: flex; align-items: center; gap: 0.75rem; color: #c9a962; text-decoration: none; font-family: 'Outfit', sans-serif; font-weight: 600; }
        .nav-right { display: flex; align-items: center; gap: 1rem; }
        .user-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 20px; font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }
        .user-badge svg { color: #c9a962; }
        .logout-btn { width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.6); cursor: pointer; transition: all 0.2s ease; }
        .logout-btn:hover { background: rgba(220, 38, 38, 0.1); border-color: rgba(220, 38, 38, 0.3); color: #fca5a5; }
        .upload-content { position: relative; z-index: 10; max-width: 900px; margin: 0 auto; padding: 2rem; }
        .upload-header { text-align: center; margin-bottom: 2rem; }
        .upload-header h1 { display: flex; align-items: center; justify-content: center; gap: 0.75rem; font-family: 'Cormorant Garamond', serif; font-size: 2rem; color: #fff; margin-bottom: 0.5rem; }
        .upload-header h1 svg { color: #c9a962; }
        .upload-header p { font-family: 'Outfit', sans-serif; color: rgba(255, 255, 255, 0.5); }
        .mode-toggle { display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
        .mode-toggle button { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.5rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; color: rgba(255, 255, 255, 0.6); font-family: 'Outfit', sans-serif; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; }
        .mode-toggle button:hover { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.8); }
        .mode-toggle button.active { background: rgba(201, 169, 98, 0.1); border-color: rgba(201, 169, 98, 0.4); color: #c9a962; }
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; border-radius: 10px; margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif; font-size: 0.9rem; }
        .alert.error { background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); color: #fca5a5; }
        .alert.success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; }
        .alert span { flex: 1; }
        .alert button { background: none; border: none; color: inherit; cursor: pointer; opacity: 0.7; }
        .upload-form { display: flex; flex-direction: column; gap: 2rem; }
        .form-section { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.5rem; }
        .form-section h2 { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
        .section-note { font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); margin-bottom: 1.5rem; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { font-family: 'Outfit', sans-serif; font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-family: 'Outfit', sans-serif; font-size: 0.9rem; transition: all 0.2s ease; }
        .form-group input::placeholder, .form-group textarea::placeholder { color: rgba(255, 255, 255, 0.3); }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: rgba(201, 169, 98, 0.5); }
        .form-group select { cursor: pointer; }
        .form-group textarea { resize: vertical; min-height: 80px; }
        .config-options { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .config-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; color: rgba(255, 255, 255, 0.6); font-family: 'Outfit', sans-serif; font-size: 0.85rem; cursor: pointer; transition: all 0.2s ease; }
        .config-btn:hover { background: rgba(255, 255, 255, 0.08); }
        .config-btn.selected { background: rgba(45, 74, 62, 0.3); border-color: rgba(45, 74, 62, 0.6); color: #4ade80; }
        .media-upload-area { display: flex; flex-direction: column; gap: 1rem; }
        .media-controls { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .file-drop-zone { position: relative; border: 2px dashed rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; text-align: center; transition: all 0.2s ease; }
        .file-drop-zone:hover { border-color: rgba(201, 169, 98, 0.4); background: rgba(201, 169, 98, 0.05); }
        .file-drop-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .file-drop-zone label { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; pointer-events: none; }
        .file-drop-zone svg { color: rgba(255, 255, 255, 0.3); }
        .file-drop-zone span { font-family: 'Outfit', sans-serif; font-size: 0.95rem; color: rgba(255, 255, 255, 0.7); }
        .file-drop-zone small { font-family: 'Outfit', sans-serif; font-size: 0.8rem; color: rgba(255, 255, 255, 0.4); }
        .file-drop-zone .selected-file { color: #c9a962; font-weight: 500; }
        .file-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .file-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; }
        .file-item svg:first-child { color: rgba(255, 255, 255, 0.5); }
        .file-name { flex: 1; font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .file-size { font-family: 'Outfit', sans-serif; font-size: 0.8rem; color: rgba(255, 255, 255, 0.4); }
        .remove-file { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(220, 38, 38, 0.1); border: none; border-radius: 6px; color: #fca5a5; cursor: pointer; }
        .template-download { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 1.5rem; }
        .template-download svg { color: #c9a962; }
        .template-info { flex: 1; display: flex; flex-direction: column; }
        .template-info span { font-family: 'Outfit', sans-serif; font-size: 0.95rem; color: #fff; }
        .template-info small { font-family: 'Outfit', sans-serif; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }
        .download-template-btn { padding: 0.5rem 1rem; background: rgba(201, 169, 98, 0.1); border: 1px solid rgba(201, 169, 98, 0.3); border-radius: 8px; color: #c9a962; font-family: 'Outfit', sans-serif; font-size: 0.85rem; text-decoration: none; }
        .excel-columns { margin-bottom: 1.5rem; }
        .excel-columns h3 { font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 500; color: rgba(255, 255, 255, 0.7); margin-bottom: 0.75rem; }
        .columns-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .columns-list span { padding: 0.35rem 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 20px; font-family: 'Outfit', sans-serif; font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); }
        .excel-zone { padding: 3rem 2rem; }
        .excel-zone svg { color: #c9a962; }
        .excel-note { display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 10px; margin-top: 1.5rem; }
        .excel-note svg { color: #fbbf24; flex-shrink: 0; }
        .excel-note span { font-family: 'Outfit', sans-serif; font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); }
        .form-actions { display: flex; justify-content: flex-end; }
        .submit-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem 2rem; background: linear-gradient(135deg, #c9a962 0%, #a38a4f 100%); border: none; border-radius: 10px; color: #0a0a0f; font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; min-width: 180px; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(201, 169, 98, 0.3); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .upload-content { padding: 1.5rem; } .form-grid, .media-controls { grid-template-columns: 1fr; } .mode-toggle { flex-direction: column; } }
      `}</style>
    </div>
  );
};

export default UploadPage;
