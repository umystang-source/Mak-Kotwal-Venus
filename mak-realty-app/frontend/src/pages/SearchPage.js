import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../utils/api';
import {
  Building2, Search, ArrowLeft, Filter, X, MapPin,
  IndianRupee, Home, Tag, CheckCircle, Loader2,
  Eye, EyeOff, Download, Video, FileText,
  Shield, User, LogOut, ExternalLink, Edit, Trash2,
  Square, Plus, Copy
} from 'lucide-react';

const SearchPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const [filters, setFilters] = useState({
    project_name: '',
    developer_name: '',
    location: '',
    budget_min: '',
    budget_max: '',
    carpet_area_min: 0,
    carpet_area_max: 99999,
    rate_psf_min: 0,
    rate_psf_max: 999999,
    configurations: [],
    availability_status: '',
    client_tags: ''
  });

  // Multi-select input states
  const [developerInput, setDeveloperInput] = useState('');
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Media upload states for edit mode
  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [editMediaType, setEditMediaType] = useState('floor_plan');
  const [editMediaConfig, setEditMediaConfig] = useState('');

  const configOptions = ['2 BHK', '3 BHK', '4 BHK', '5 BHK', '6 BHK', 'Penthouse', 'Villa'];
  const statusOptions = ['Ready', 'Under Construction', 'Coming Soon', 'Sold Out'];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Toggle configuration selection (AND-type multi-select)
  const toggleConfiguration = (config) => {
    setFilters(prev => ({
      ...prev,
      configurations: prev.configurations.includes(config)
        ? prev.configurations.filter(c => c !== config)
        : [...prev.configurations, config]
    }));
  };

  // Add developer to OR filter list
  const addDeveloper = () => {
    if (developerInput.trim() && !selectedDevelopers.includes(developerInput.trim())) {
      setSelectedDevelopers(prev => [...prev, developerInput.trim()]);
      setDeveloperInput('');
    }
  };

  const removeDeveloper = (dev) => {
    setSelectedDevelopers(prev => prev.filter(d => d !== dev));
  };

  // Add location to OR filter list
  const addLocation = () => {
    if (locationInput.trim() && !selectedLocations.includes(locationInput.trim())) {
      setSelectedLocations(prev => [...prev, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const removeLocation = (loc) => {
    setSelectedLocations(prev => prev.filter(l => l !== loc));
  };

  // Handle Enter key to trigger search
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(1);
    }
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    setSearched(true);

    try {
      const searchFilters = { page, limit: 10 };

      // Add basic filters
      if (filters.project_name) searchFilters.project_name = filters.project_name;
      if (filters.budget_min) searchFilters.budget_min = filters.budget_min;
      if (filters.budget_max) searchFilters.budget_max = filters.budget_max;
      if (filters.client_tags) searchFilters.client_tags = filters.client_tags;

      // Carpet area filter
      if (filters.carpet_area_min > 0) searchFilters.carpet_area_min = filters.carpet_area_min;
      if (filters.carpet_area_max < 99999) searchFilters.carpet_area_max = filters.carpet_area_max;

      // Rate PSF filter
      if (filters.rate_psf_min > 0) searchFilters.rate_psf_min = filters.rate_psf_min;
      if (filters.rate_psf_max < 999999) searchFilters.rate_psf_max = filters.rate_psf_max;

      // OR-type developer filter
      if (selectedDevelopers.length > 0) {
        searchFilters.developers_or = selectedDevelopers.join(',');
      } else if (filters.developer_name) {
        searchFilters.developer_name = filters.developer_name;
      }

      // OR-type location filter
      if (selectedLocations.length > 0) {
        searchFilters.locations_or = selectedLocations.join(',');
      } else if (filters.location) {
        searchFilters.location = filters.location;
      }

      // AND-type configuration filter
      if (filters.configurations.length > 0) {
        searchFilters.configurations_and = filters.configurations.join(',');
      }

      // Simple availability status filter (single select)
      if (filters.availability_status) {
        searchFilters.availability_status = filters.availability_status;
      }

      const data = await projectsAPI.search(searchFilters);
      setResults(data.projects);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      project_name: '',
      developer_name: '',
      location: '',
      budget_min: '',
      budget_max: '',
      carpet_area_min: 0,
      carpet_area_max: 99999,
      rate_psf_min: 0,
      rate_psf_max: 999999,
      configurations: [],
      availability_status: '',
      client_tags: ''
    });
    setSelectedDevelopers([]);
    setSelectedLocations([]);
    setDeveloperInput('');
    setLocationInput('');
  };

  const toggleProjectVisibility = async (projectId, currentVisibility) => {
    try {
      await projectsAPI.toggleProjectVisibility(projectId, !currentVisibility);
      handleSearch(pagination.page);
    } catch (error) {
      console.error('Toggle visibility error:', error);
    }
  };

  const toggleFieldVisibility = async (projectId, field, currentVisibility) => {
    try {
      await projectsAPI.updateVisibility(projectId, field, !currentVisibility);
      handleSearch(pagination.page);
    } catch (error) {
      console.error('Toggle field visibility error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditedProject({...selectedProject});
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedProject(null);
    setEditMediaFiles([]);
    setEditMediaConfig('');
  };

  const handleEditChange = (field, value) => {
    setEditedProject(prev => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await projectsAPI.update(editedProject.id, editedProject);

      // Upload media files if any were selected
      if (editMediaFiles.length > 0) {
        await projectsAPI.uploadMedia(editedProject.id, editMediaFiles, editMediaType, editMediaConfig);
        setEditMediaFiles([]);
        setEditMediaConfig('');
      }

      // Fetch updated project with new media
      const updatedData = await projectsAPI.search({ project_name: editedProject.project_name, limit: 1 });
      const updatedProject = updatedData.projects.find(p => p.id === editedProject.id) || editedProject;

      setSelectedProject(updatedProject);
      setEditMode(false);
      handleSearch(pagination.page); // Refresh the list
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Handle media file selection in edit mode
  const handleEditMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setEditMediaFiles(prev => [...prev, ...files]);
  };

  const removeEditMediaFile = (index) => {
    setEditMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsAPI.delete(selectedProject.id);
      setSelectedProject(null);
      handleSearch(pagination.page); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project');
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects([]);
      setSelectAll(false);
    } else {
      setSelectedProjects(results.map(p => p.id));
      setSelectAll(true);
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        const newSelection = prev.filter(id => id !== projectId);
        if (newSelection.length === 0) setSelectAll(false);
        return newSelection;
      } else {
        const newSelection = [...prev, projectId];
        if (newSelection.length === results.length) setSelectAll(true);
        return newSelection;
      }
    });
  };

  const handleExportSelected = async () => {
    if (selectedProjects.length === 0) {
      alert('Please select at least one project to export');
      return;
    }
    try {
      setExporting(true);
      const blob = await projectsAPI.exportProjects(selectedProjects);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export projects');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setExporting(true);
      const blob = await projectsAPI.exportProjects([]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_projects_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export all projects');
    } finally {
      setExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) {
      alert('Please select at least one project to delete');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeleting(true);
      const result = await projectsAPI.bulkDelete(selectedProjects);
      alert(result.message);
      setSelectedProjects([]);
      handleSearch(pagination.page);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete projects');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await projectsAPI.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download template error:', error);
      alert('Failed to download template');
    }
  };

  const handleDeleteMedia = async (mediaId, mediaName) => {
    if (!window.confirm(`Are you sure you want to delete "${mediaName}"?`)) {
      return;
    }
    try {
      await projectsAPI.deleteMedia(mediaId);
      // Update the selected project's media list
      if (selectedProject) {
        setSelectedProject({
          ...selectedProject,
          media: selectedProject.media.filter(m => m.id !== mediaId)
        });
      }
      // Refresh search results
      handleSearch(pagination.page);
    } catch (error) {
      console.error('Delete media error:', error);
      alert('Failed to delete media');
    }
  };

  const formatBudget = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lac`;
    return `₹${amount.toLocaleString()}`;
  };

  const formatProjectForWhatsApp = (project) => {
    const lines = [];
    lines.push(`🏢 *${project.project_name}*`);
    if (project.developer_name) lines.push(`👷 ${project.developer_name}`);
    if (project.location) lines.push(`📍 ${project.location}`);
    if (project.configurations?.length > 0) {
      lines.push(`🏠 ${project.configurations.join(', ')}`);
    }
    if (project.budget_min || project.budget_max) {
      const budgetRange = project.budget_min && project.budget_max
        ? `${formatBudget(project.budget_min)} - ${formatBudget(project.budget_max)}`
        : formatBudget(project.budget_min || project.budget_max);
      lines.push(`💰 ${budgetRange}`);
    }
    if (project.carpet_area_min || project.carpet_area_max) {
      const areaRange = project.carpet_area_min && project.carpet_area_max
        ? `${project.carpet_area_min} - ${project.carpet_area_max} sq.ft`
        : `${project.carpet_area_min || project.carpet_area_max} sq.ft`;
      lines.push(`📐 ${areaRange}`);
    }
    if (project.possession) lines.push(`📅 Possession: ${project.possession}`);
    if (project.availability_status) lines.push(`✅ ${project.availability_status}`);
    if (project.google_maps_link) lines.push(`🗺️ ${project.google_maps_link}`);
    return lines.join('\n');
  };

  const handleCopyForWhatsApp = async () => {
    if (selectedProjects.length === 0) {
      alert('Please select at least one project to copy');
      return;
    }

    const selectedProjectData = results.filter(p => selectedProjects.includes(p.id));
    const textContent = selectedProjectData.map(formatProjectForWhatsApp).join('\n\n─────────────\n\n');
    const header = `*MAK Kotwal Venus - ${selectedProjectData.length} Project(s)*\n\n`;

    try {
      await navigator.clipboard.writeText(header + textContent);
      alert(`Copied ${selectedProjectData.length} project(s) to clipboard! Ready to paste in WhatsApp.`);
    } catch (error) {
      console.error('Copy error:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = header + textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Copied ${selectedProjectData.length} project(s) to clipboard! Ready to paste in WhatsApp.`);
    }
  };

  return (
    <div className="search-page">
      <div className="page-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <nav className="page-nav">
        <div className="nav-left">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={20} />
          </Link>
          <Link to="/" className="nav-logo">
            <Building2 size={24} strokeWidth={1.5} />
            <span>MAK Kotwal Venus</span>
          </Link>
        </div>
        <div className="nav-right">
          <div className="user-badge">
            {isAdmin() ? <Shield size={16} /> : <User size={16} />}
            <span>{user?.name}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="search-content">
        <div className="search-header">
          <h1>
            <Search size={28} />
            <span>Search Projects</span>
          </h1>
          <p>Find projects matching your client requirements</p>
        </div>

        <div className="search-layout">
          {/* Filters Panel */}
          <aside
            className={`filters-panel ${showFilters ? 'open' : ''}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target === e.currentTarget) {
                e.preventDefault();
                handleSearch(1);
              }
            }}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(1); }}>
            <div className="filters-header">
              <h2>
                <Filter size={18} />
                <span>Filters</span>
              </h2>
              <button type="button" className="clear-btn" onClick={clearFilters}>
                <X size={16} />
                <span>Clear</span>
              </button>
            </div>

            <div className="filters-body">
              <div className="filter-group">
                <label>Project Name</label>
                <input
                  type="text"
                  name="project_name"
                  value={filters.project_name}
                  onChange={handleFilterChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search by name..."
                />
              </div>

              {/* Developer - OR type multi-select */}
              <div className="filter-group">
                <label>
                  Developer
                  <span className="filter-type-badge or-badge">OR</span>
                </label>
                <div className="multi-input-wrapper">
                  <input
                    type="text"
                    value={developerInput}
                    onChange={(e) => setDeveloperInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        addDeveloper();
                      }
                    }}
                    placeholder="Add developer..."
                  />
                  <button type="button" className="add-btn" onClick={addDeveloper}>
                    <Plus size={16} />
                  </button>
                </div>
                {selectedDevelopers.length > 0 && (
                  <div className="selected-tags">
                    {selectedDevelopers.map(dev => (
                      <span key={dev} className="selected-tag">
                        {dev}
                        <button onClick={() => removeDeveloper(dev)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Location - OR type multi-select */}
              <div className="filter-group">
                <label>
                  <MapPin size={14} />
                  Location
                  <span className="filter-type-badge or-badge">OR</span>
                </label>
                <div className="multi-input-wrapper">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        addLocation();
                      }
                    }}
                    placeholder="Add location..."
                  />
                  <button type="button" className="add-btn" onClick={addLocation}>
                    <Plus size={16} />
                  </button>
                </div>
                {selectedLocations.length > 0 && (
                  <div className="selected-tags">
                    {selectedLocations.map(loc => (
                      <span key={loc} className="selected-tag">
                        {loc}
                        <button onClick={() => removeLocation(loc)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="filter-group">
                <label>
                  <IndianRupee size={14} />
                  Budget Range
                </label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="budget_min"
                    value={filters.budget_min}
                    onChange={handleFilterChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="budget_max"
                    value={filters.budget_max}
                    onChange={handleFilterChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Carpet Area Slider */}
              <div className="filter-group">
                <label>
                  <Square size={14} />
                  Carpet Area (sq.ft)
                </label>
                <div className="slider-container">
                  <div className="slider-values">
                    <span>{filters.carpet_area_min.toLocaleString()}</span>
                    <span>{filters.carpet_area_max.toLocaleString()}</span>
                  </div>
                  <div className="dual-slider">
                    <input
                      type="range"
                      min="0"
                      max="99999"
                      step="100"
                      value={filters.carpet_area_min}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val <= filters.carpet_area_max) {
                          setFilters(prev => ({ ...prev, carpet_area_min: val }));
                        }
                      }}
                      className="slider slider-min"
                    />
                    <input
                      type="range"
                      min="0"
                      max="99999"
                      step="100"
                      value={filters.carpet_area_max}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= filters.carpet_area_min) {
                          setFilters(prev => ({ ...prev, carpet_area_max: val }));
                        }
                      }}
                      className="slider slider-max"
                    />
                  </div>
                  <div className="range-inputs">
                    <input
                      type="number"
                      value={filters.carpet_area_min === 0 ? '' : filters.carpet_area_min}
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        if (inputVal === '') {
                          setFilters(prev => ({ ...prev, carpet_area_min: 0 }));
                          return;
                        }
                        const val = parseInt(inputVal, 10);
                        if (!isNaN(val) && val >= 0) {
                          setFilters(prev => ({ ...prev, carpet_area_min: val }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(1);
                        }
                      }}
                      placeholder="Min"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={filters.carpet_area_max === 99999 ? '' : filters.carpet_area_max}
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        if (inputVal === '') {
                          setFilters(prev => ({ ...prev, carpet_area_max: 99999 }));
                          return;
                        }
                        const val = parseInt(inputVal, 10);
                        if (!isNaN(val) && val >= 0) {
                          setFilters(prev => ({ ...prev, carpet_area_max: val }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(1);
                        }
                      }}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Rate PSF Slider */}
              <div className="filter-group">
                <label>
                  <IndianRupee size={14} />
                  Rate per sq.ft
                </label>
                <div className="slider-container">
                  <div className="slider-values">
                    <span>{filters.rate_psf_min.toLocaleString()}</span>
                    <span>{filters.rate_psf_max.toLocaleString()}</span>
                  </div>
                  <div className="dual-slider">
                    <input
                      type="range"
                      min="0"
                      max="999999"
                      step="1000"
                      value={filters.rate_psf_min}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val <= filters.rate_psf_max) {
                          setFilters(prev => ({ ...prev, rate_psf_min: val }));
                        }
                      }}
                      className="slider slider-min"
                    />
                    <input
                      type="range"
                      min="0"
                      max="999999"
                      step="1000"
                      value={filters.rate_psf_max}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= filters.rate_psf_min) {
                          setFilters(prev => ({ ...prev, rate_psf_max: val }));
                        }
                      }}
                      className="slider slider-max"
                    />
                  </div>
                  <div className="range-inputs">
                    <input
                      type="number"
                      value={filters.rate_psf_min === 0 ? '' : filters.rate_psf_min}
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        if (inputVal === '') {
                          setFilters(prev => ({ ...prev, rate_psf_min: 0 }));
                          return;
                        }
                        const val = parseInt(inputVal, 10);
                        if (!isNaN(val) && val >= 0) {
                          setFilters(prev => ({ ...prev, rate_psf_min: val }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(1);
                        }
                      }}
                      placeholder="Min"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={filters.rate_psf_max === 999999 ? '' : filters.rate_psf_max}
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        if (inputVal === '') {
                          setFilters(prev => ({ ...prev, rate_psf_max: 999999 }));
                          return;
                        }
                        const val = parseInt(inputVal, 10);
                        if (!isNaN(val) && val >= 0) {
                          setFilters(prev => ({ ...prev, rate_psf_max: val }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(1);
                        }
                      }}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Configuration - AND type checkbox multi-select */}
              <div className="filter-group">
                <label>
                  <Home size={14} />
                  Configuration
                  <span className="filter-type-badge">AND</span>
                </label>
                <div className="checkbox-grid">
                  {configOptions.map(opt => (
                    <label key={opt} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.configurations.includes(opt)}
                        onChange={() => toggleConfiguration(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability - Simple dropdown */}
              <div className="filter-group">
                <label>
                  <CheckCircle size={14} />
                  Availability
                </label>
                <select
                  name="availability_status"
                  value={filters.availability_status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>
                  <Tag size={14} />
                  Client Tags
                </label>
                <input
                  type="text"
                  name="client_tags"
                  value={filters.client_tags}
                  onChange={handleFilterChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Tags (comma separated)"
                />
              </div>
            </div>

            <div className="filters-footer">
              <button type="submit" className="search-btn">
                {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
                <span>Search</span>
              </button>
            </div>
            </form>
          </aside>

          {/* Results Panel */}
          <div className="results-panel">
            <div className="results-header">
              <button
                className="toggle-filters-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>

              {searched && (
                <span className="results-count">
                  {pagination.total} project{pagination.total !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            {searched && results.length > 0 && (
              <div className="bulk-actions-bar">
                <div className="select-all-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span>Select All ({results.length})</span>
                  </label>
                  {selectedProjects.length > 0 && (
                    <span className="selected-count">
                      {selectedProjects.length} selected
                    </span>
                  )}
                </div>
                <div className="export-buttons">
                  <button
                    className="template-btn"
                    onClick={handleDownloadTemplate}
                  >
                    <Download size={16} />
                    <span>Template</span>
                  </button>
                  <button
                    className="export-btn"
                    onClick={handleExportSelected}
                    disabled={selectedProjects.length === 0 || exporting}
                  >
                    <Download size={16} />
                    <span>{exporting ? 'Exporting...' : 'Export Selected'}</span>
                  </button>
                  <button
                    className="whatsapp-btn"
                    onClick={handleCopyForWhatsApp}
                    disabled={selectedProjects.length === 0}
                    title="Copy for WhatsApp"
                  >
                    <Copy size={16} />
                    <span>Copy for WhatsApp</span>
                  </button>
                  <button
                    className="export-all-btn"
                    onClick={handleExportAll}
                    disabled={exporting}
                  >
                    <Download size={16} />
                    <span>{exporting ? 'Exporting...' : 'Export All'}</span>
                  </button>
                  {isAdmin() && (
                    <button
                      className="delete-selected-btn"
                      onClick={handleBulkDelete}
                      disabled={selectedProjects.length === 0 || deleting}
                    >
                      <Trash2 size={16} />
                      <span>{deleting ? 'Deleting...' : 'Delete Selected'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="results-grid">
              {loading ? (
                <div className="loading-state">
                  <Loader2 className="spin" size={32} />
                  <p>Searching projects...</p>
                </div>
              ) : !searched ? (
                <div className="empty-state">
                  <Search size={48} />
                  <h3>Start Your Search</h3>
                  <p>Use the filters to find projects matching your requirements</p>
                </div>
              ) : results.length === 0 ? (
                <div className="empty-state">
                  <Building2 size={48} />
                  <h3>No Projects Found</h3>
                  <p>Try adjusting your filters for better results</p>
                </div>
              ) : (
                results.map(project => (
                  <div
                    key={project.id}
                    className={`project-card ${!project.is_visible && isAdmin() ? 'hidden-card' : ''} ${selectedProjects.includes(project.id) ? 'selected' : ''}`}
                  >
                    <label className="project-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleSelectProject(project.id)}
                      />
                    </label>

                    {isAdmin() && (
                      <button
                        className="visibility-toggle main-toggle"
                        onClick={() => toggleProjectVisibility(project.id, project.is_visible)}
                        title={project.is_visible ? 'Hide from users' : 'Show to users'}
                      >
                        {project.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}

                    <div className="card-header">
                      <h3>{project.project_name}</h3>
                      {project.developer_name && (
                        <span className="developer">by {project.developer_name}</span>
                      )}
                    </div>

                    <div className="card-body">
                      <div className="card-row">
                        <MapPin size={14} />
                        <span>{project.location || project.micro_market || 'N/A'}</span>
                        {isAdmin() && (
                          <button 
                            className="field-toggle"
                            onClick={() => toggleFieldVisibility(
                              project.id, 
                              'location', 
                              project.visibility_settings?.location !== false
                            )}
                          >
                            {project.visibility_settings?.location !== false 
                              ? <Eye size={12} /> 
                              : <EyeOff size={12} />
                            }
                          </button>
                        )}
                      </div>

                      <div className="card-row">
                        <IndianRupee size={14} />
                        <span>
                          {formatBudget(project.budget_min)} - {formatBudget(project.budget_max)}
                        </span>
                        {isAdmin() && (
                          <button 
                            className="field-toggle"
                            onClick={() => toggleFieldVisibility(
                              project.id, 
                              'budget', 
                              project.visibility_settings?.budget !== false
                            )}
                          >
                            {project.visibility_settings?.budget !== false 
                              ? <Eye size={12} /> 
                              : <EyeOff size={12} />
                            }
                          </button>
                        )}
                      </div>

                      <div className="card-row">
                        <Home size={14} />
                        <span>
                          {project.configurations?.length > 0 
                            ? project.configurations.join(', ') 
                            : 'N/A'
                          }
                        </span>
                        {isAdmin() && (
                          <button 
                            className="field-toggle"
                            onClick={() => toggleFieldVisibility(
                              project.id, 
                              'configurations', 
                              project.visibility_settings?.configurations !== false
                            )}
                          >
                            {project.visibility_settings?.configurations !== false 
                              ? <Eye size={12} /> 
                              : <EyeOff size={12} />
                            }
                          </button>
                        )}
                      </div>

                      <div className="status-badge" data-status={project.availability_status}>
                        {project.availability_status || 'Available'}
                      </div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedProject(project)}
                      >
                        View Details
                      </button>
                      
                      <div className="download-btns">
                        {project.media?.some(m => m?.media_type === 'floor_plan') && (
                          <a
                            href={projectsAPI.getMediaDownloadUrl(
                              project.media.find(m => m?.media_type === 'floor_plan')?.id
                            )}
                            className="download-btn"
                            title="Download Floor Plan"
                          >
                            <FileText size={16} />
                          </a>
                        )}
                        {project.media?.some(m => m?.media_type === 'video') && (
                          <a
                            href={projectsAPI.getMediaDownloadUrl(
                              project.media.find(m => m?.media_type === 'video')?.id
                            )}
                            className="download-btn"
                            title="Download Video"
                          >
                            <Video size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={pagination.page === i + 1 ? 'active' : ''}
                    onClick={() => handleSearch(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)}>
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <h2>{editMode ? 'Edit Project' : selectedProject.project_name}</h2>
              {!editMode && selectedProject.developer_name && (
                <span className="developer">by {selectedProject.developer_name}</span>
              )}
              {!editMode && (
                <div className="modal-actions">
                  <button className="edit-btn" onClick={handleEdit}>
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  {isAdmin() && (
                    <button className="delete-btn" onClick={handleDelete}>
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
              {editMode && (
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="modal-body">
              {!editMode ? (
                <>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label><MapPin size={16} /> Location</label>
                      <span>{selectedProject.location || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><Building2 size={16} /> Plot Size</label>
                      <span>{selectedProject.plot_size || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><Building2 size={16} /> Total Towers</label>
                      <span>{selectedProject.total_towers || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><Building2 size={16} /> Total Floors</label>
                      <span>{selectedProject.total_floors || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><CheckCircle size={16} /> Possession</label>
                      <span>{selectedProject.possession || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><IndianRupee size={16} /> Budget Min</label>
                      <span>{formatBudget(selectedProject.budget_min)}</span>
                    </div>
                    <div className="detail-item">
                      <label><IndianRupee size={16} /> Budget Max</label>
                      <span>{formatBudget(selectedProject.budget_max)}</span>
                    </div>
                    <div className="detail-item">
                      <label><Square size={16} /> Carpet Area Min</label>
                      <span>{selectedProject.carpet_area_min ? `${selectedProject.carpet_area_min.toLocaleString()} sq.ft` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><Square size={16} /> Carpet Area Max</label>
                      <span>{selectedProject.carpet_area_max ? `${selectedProject.carpet_area_max.toLocaleString()} sq.ft` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><Home size={16} /> Configurations</label>
                      <span>{selectedProject.configurations?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><IndianRupee size={16} /> Rate PSF Min</label>
                      <span>{selectedProject.rate_psf_min ? `₹${parseFloat(selectedProject.rate_psf_min).toLocaleString()}` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><IndianRupee size={16} /> Rate PSF Max</label>
                      <span>{selectedProject.rate_psf_max ? `₹${parseFloat(selectedProject.rate_psf_max).toLocaleString()}` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label><CheckCircle size={16} /> Status</label>
                      <span>{selectedProject.availability_status || 'Available'}</span>
                    </div>
                    {selectedProject.notes && (
                      <div className="detail-item full-width">
                        <label>Notes</label>
                        <span>{selectedProject.notes}</span>
                      </div>
                    )}
                    {selectedProject.google_maps_link && (
                      <div className="detail-item full-width">
                        <label><MapPin size={16} /> Google Maps</label>
                        <a
                          href={selectedProject.google_maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="maps-link"
                        >
                          <span>View on Google Maps</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Additional Attributes Section - View Mode */}
                  {(() => {
                    const attributeLabels = {
                      1: 'Apartments Per Floor',
                      2: 'Elevator',
                      3: 'Apartments In The Project',
                      4: 'Floor Plate',
                      5: 'Apartment Height',
                      6: 'First Habitable Floor',
                      7: 'Permissions',
                      8: 'Payment Due',
                      9: 'Floor Rise',
                      10: 'Car Park',
                      11: 'Maintenance Charges',
                      12: 'Apartment Type',
                      13: 'Construction Status'
                    };
                    const visibleAttributes = user?.visible_attributes || {};
                    const attributesToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                      .filter(num => visibleAttributes[num] !== false);

                    if (attributesToShow.length === 0) return null;

                    return (
                      <div className="attributes-section">
                        <h3>
                          Additional Details
                          {isAdmin() && <span className="admin-badge">(Admin Only)</span>}
                        </h3>
                        <div className="attributes-grid">
                          {attributesToShow.map(num => {
                            const attrValue = selectedProject[`attribute_${num}`];
                            return (
                              <div key={num} className="attribute-item">
                                <label>{attributeLabels[num]}</label>
                                <span>{attrValue || 'Not set'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Project Name *</label>
                    <input
                      type="text"
                      value={editedProject?.project_name || ''}
                      onChange={(e) => handleEditChange('project_name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Developer Name</label>
                    <input
                      type="text"
                      value={editedProject?.developer_name || ''}
                      onChange={(e) => handleEditChange('developer_name', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={editedProject?.location || ''}
                        onChange={(e) => handleEditChange('location', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Plot Size</label>
                      <input
                        type="text"
                        value={editedProject?.plot_size || ''}
                        onChange={(e) => handleEditChange('plot_size', e.target.value)}
                        placeholder="e.g. 5 Acres"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Total Towers</label>
                      <input
                        type="number"
                        value={editedProject?.total_towers || ''}
                        onChange={(e) => handleEditChange('total_towers', parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Floors</label>
                      <input
                        type="text"
                        value={editedProject?.total_floors || ''}
                        onChange={(e) => handleEditChange('total_floors', e.target.value || null)}
                        placeholder="e.g. G+14 or 15"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Possession</label>
                    <input
                      type="text"
                      value={editedProject?.possession || ''}
                      onChange={(e) => handleEditChange('possession', e.target.value)}
                      placeholder="e.g. Dec 2025"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Budget Min</label>
                      <input
                        type="number"
                        value={editedProject?.budget_min || ''}
                        onChange={(e) => handleEditChange('budget_min', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Budget Max</label>
                      <input
                        type="number"
                        value={editedProject?.budget_max || ''}
                        onChange={(e) => handleEditChange('budget_max', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Carpet Area Min (sq.ft)</label>
                      <input
                        type="number"
                        value={editedProject?.carpet_area_min || ''}
                        onChange={(e) => handleEditChange('carpet_area_min', parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Carpet Area Max (sq.ft)</label>
                      <input
                        type="number"
                        value={editedProject?.carpet_area_max || ''}
                        onChange={(e) => handleEditChange('carpet_area_max', parseInt(e.target.value) || null)}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Rate PSF Min</label>
                      <input
                        type="number"
                        value={editedProject?.rate_psf_min || ''}
                        onChange={(e) => handleEditChange('rate_psf_min', parseFloat(e.target.value) || null)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Rate PSF Max</label>
                      <input
                        type="number"
                        value={editedProject?.rate_psf_max || ''}
                        onChange={(e) => handleEditChange('rate_psf_max', parseFloat(e.target.value) || null)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Configurations</label>
                    <div className="checkbox-group edit-checkbox-group">
                      {configOptions.map(opt => (
                        <label key={opt} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={editedProject?.configurations?.includes(opt) || false}
                            onChange={(e) => {
                              const current = editedProject?.configurations || [];
                              if (e.target.checked) {
                                handleEditChange('configurations', [...current, opt]);
                              } else {
                                handleEditChange('configurations', current.filter(c => c !== opt));
                              }
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Availability Status</label>
                    <select
                      value={editedProject?.availability_status || 'Ready'}
                      onChange={(e) => handleEditChange('availability_status', e.target.value)}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Google Maps Link</label>
                    <input
                      type="url"
                      value={editedProject?.google_maps_link || ''}
                      onChange={(e) => handleEditChange('google_maps_link', e.target.value)}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={editedProject?.notes || ''}
                      onChange={(e) => handleEditChange('notes', e.target.value)}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Tags (comma separated)</label>
                    <input
                      type="text"
                      value={editedProject?.client_requirement_tags?.join(', ') || ''}
                      onChange={(e) => handleEditChange('client_requirement_tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      placeholder="e.g., Family, Investment, Luxury"
                    />
                  </div>

                  {/* Additional Details Edit Section - Admin Only */}
                  {isAdmin() && (
                    <div className="attributes-edit-section">
                      <h3>Additional Details <span className="admin-badge">(Admin Only)</span></h3>
                      <div className="attributes-edit-grid">
                        <div className="form-group">
                          <label>Apartments Per Floor</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_1 || ''}
                            onChange={(e) => handleEditChange('attribute_1', e.target.value)}
                            placeholder="e.g., 4 apartments"
                          />
                        </div>
                        <div className="form-group">
                          <label>Elevator</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_2 || ''}
                            onChange={(e) => handleEditChange('attribute_2', e.target.value)}
                            placeholder="e.g., 3 High-speed"
                          />
                        </div>
                        <div className="form-group">
                          <label>Apartments In The Project</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_3 || ''}
                            onChange={(e) => handleEditChange('attribute_3', e.target.value)}
                            placeholder="e.g., 200 apartments"
                          />
                        </div>
                        <div className="form-group">
                          <label>Floor Plate</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_4 || ''}
                            onChange={(e) => handleEditChange('attribute_4', e.target.value)}
                            placeholder="e.g., 8000 sq ft"
                          />
                        </div>
                        <div className="form-group">
                          <label>Apartment Height</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_5 || ''}
                            onChange={(e) => handleEditChange('attribute_5', e.target.value)}
                            placeholder="e.g., 12 ft"
                          />
                        </div>
                        <div className="form-group">
                          <label>First Habitable Floor</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_6 || ''}
                            onChange={(e) => handleEditChange('attribute_6', e.target.value)}
                            placeholder="e.g., 7th floor"
                          />
                        </div>
                        <div className="form-group">
                          <label>Permissions</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_7 || ''}
                            onChange={(e) => handleEditChange('attribute_7', e.target.value)}
                            placeholder="e.g., OC Received"
                          />
                        </div>
                        <div className="form-group">
                          <label>Payment Due</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_8 || ''}
                            onChange={(e) => handleEditChange('attribute_8', e.target.value)}
                            placeholder="e.g., 20:80"
                          />
                        </div>
                        <div className="form-group">
                          <label>Floor Rise</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_9 || ''}
                            onChange={(e) => handleEditChange('attribute_9', e.target.value)}
                            placeholder="e.g., ₹100/sq ft"
                          />
                        </div>
                        <div className="form-group">
                          <label>Car Park</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_10 || ''}
                            onChange={(e) => handleEditChange('attribute_10', e.target.value)}
                            placeholder="e.g., 2 Basement"
                          />
                        </div>
                        <div className="form-group">
                          <label>Maintenance Charges</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_11 || ''}
                            onChange={(e) => handleEditChange('attribute_11', e.target.value)}
                            placeholder="e.g., ₹25/sq ft"
                          />
                        </div>
                        <div className="form-group">
                          <label>Apartment Type</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_12 || ''}
                            onChange={(e) => handleEditChange('attribute_12', e.target.value)}
                            placeholder="e.g., Simplex"
                          />
                        </div>
                        <div className="form-group full-width">
                          <label>Construction Status</label>
                          <input
                            type="text"
                            value={editedProject?.attribute_13 || ''}
                            onChange={(e) => handleEditChange('attribute_13', e.target.value)}
                            placeholder="e.g., Nearing Completion"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media Upload Section */}
                  <div className="media-upload-section">
                    <h3><FileText size={18} /> Upload Floor Plans & Videos</h3>
                    <div className="media-upload-controls">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Media Type</label>
                          <select
                            value={editMediaType}
                            onChange={(e) => setEditMediaType(e.target.value)}
                          >
                            <option value="floor_plan">Floor Plan (PDF/Image)</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Configuration (Optional)</label>
                          <select
                            value={editMediaConfig}
                            onChange={(e) => setEditMediaConfig(e.target.value)}
                          >
                            <option value="">Select Configuration</option>
                            {configOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          id="edit-media-upload"
                          multiple
                          accept={editMediaType === 'video' ? 'video/*' : 'image/*,.pdf'}
                          onChange={handleEditMediaChange}
                        />
                        <label htmlFor="edit-media-upload" className="file-upload-label">
                          <Plus size={20} />
                          <span>Click to add {editMediaType === 'video' ? 'videos' : 'floor plans'}</span>
                        </label>
                      </div>
                      {editMediaFiles.length > 0 && (
                        <div className="selected-files">
                          {editMediaFiles.map((file, index) => (
                            <div key={index} className="selected-file-item">
                              {editMediaType === 'video' ? <Video size={16} /> : <FileText size={16} />}
                              <span>{file.name}</span>
                              <button type="button" onClick={() => removeEditMediaFile(index)}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedProject.client_requirement_tags?.length > 0 && (
                <div className="tags-section">
                  <h3>Client Tags</h3>
                  <div className="tags">
                    {selectedProject.client_requirement_tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor Plans & Videos Download Buttons */}
              {selectedProject.media?.some(m => m?.id && (m.media_type === 'floor_plan' || m.media_type === 'video')) && (
                <div className="media-section">
                  <h3>Downloads</h3>
                  <div className="download-buttons">
                    {selectedProject.media.filter(m => m?.id && m.media_type === 'floor_plan').map(media => (
                      <div key={media.id} className="media-item">
                        <a
                          href={projectsAPI.getMediaDownloadUrl(media.id)}
                          className="download-btn floor-plan-btn"
                          download
                        >
                          <FileText size={20} />
                          <span>{media.configuration ? `Floor Plan - ${media.configuration}` : media.file_name}</span>
                          <Download size={16} />
                        </a>
                        {isAdmin() && (
                          <button
                            className="delete-media-btn"
                            onClick={() => handleDeleteMedia(media.id, media.file_name)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {selectedProject.media.filter(m => m?.id && m.media_type === 'video').map(media => (
                      <div key={media.id} className="media-item">
                        <a
                          href={projectsAPI.getMediaDownloadUrl(media.id)}
                          className="download-btn video-btn"
                          download
                        >
                          <Video size={20} />
                          <span>{media.configuration ? `Video - ${media.configuration}` : media.file_name}</span>
                          <Download size={16} />
                        </a>
                        {isAdmin() && (
                          <button
                            className="delete-media-btn"
                            onClick={() => handleDeleteMedia(media.id, media.file_name)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-page {
          min-height: 100vh;
          background: #0a0a0f;
          position: relative;
        }

        .page-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.2;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #2d4a3e 0%, #1a2f25 100%);
          top: -100px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #c9a962 0%, #8b7355 100%);
          bottom: -100px;
          left: -100px;
        }

        .page-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(10, 10, 15, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #c9a962;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .user-badge svg {
          color: #c9a962;
        }

        .logout-btn {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.1);
          border-color: rgba(220, 38, 38, 0.3);
          color: #fca5a5;
        }

        .search-content {
          position: relative;
          z-index: 10;
          padding: 2rem;
        }

        .search-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .search-header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .search-header h1 svg {
          color: #2d4a3e;
        }

        .search-header p {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.5);
        }

        .search-layout {
          display: flex;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .filters-panel {
          width: 300px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .filters-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .clear-btn:hover {
          color: #fca5a5;
        }

        .filters-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .filter-group input,
        .filter-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .filter-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: rgba(45, 74, 62, 0.5);
        }

        .filter-group select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
        }

        .filter-group select option {
          background: #1a1a1f;
          color: #fff;
          padding: 0.75rem;
        }

        .filter-group select option:hover,
        .filter-group select option:focus {
          background: rgba(45, 74, 62, 0.5);
        }

        .range-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .range-inputs input {
          flex: 1;
        }

        .range-inputs span {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
        }

        /* Filter type badges */
        .filter-type-badge {
          margin-left: auto;
          padding: 0.15rem 0.4rem;
          background: rgba(201, 169, 98, 0.15);
          border: 1px solid rgba(201, 169, 98, 0.3);
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          color: #c9a962;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-type-badge.or-badge {
          background: rgba(96, 165, 250, 0.15);
          border-color: rgba(96, 165, 250, 0.3);
          color: #60a5fa;
        }

        /* Multi-input wrapper for AND filters */
        .multi-input-wrapper {
          display: flex;
          gap: 0.5rem;
        }

        .multi-input-wrapper input {
          flex: 1;
        }

        .add-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(45, 74, 62, 0.3);
          border: 1px solid rgba(45, 74, 62, 0.5);
          border-radius: 8px;
          color: #4ade80;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .add-btn:hover {
          background: rgba(45, 74, 62, 0.5);
        }

        /* Selected tags display */
        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .selected-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.5rem 0.3rem 0.75rem;
          background: rgba(45, 74, 62, 0.2);
          border: 1px solid rgba(45, 74, 62, 0.4);
          border-radius: 20px;
          font-size: 0.8rem;
          color: #4ade80;
        }

        .selected-tag button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .selected-tag button:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        /* Slider container */
        .slider-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .slider-values {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #4ade80;
          font-weight: 500;
        }

        .dual-slider {
          position: relative;
          height: 24px;
          display: flex;
          align-items: center;
          margin: 0.5rem 0;
        }

        .dual-slider::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .slider {
          position: absolute;
          width: 100%;
          height: 24px;
          background: transparent;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        }

        .slider::-webkit-slider-runnable-track {
          height: 6px;
          background: transparent;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3d5a4c 0%, #2d4a3e 100%);
          border: 2px solid #4ade80;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          margin-top: -7px;
        }

        .slider::-moz-range-track {
          height: 6px;
          background: transparent;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3d5a4c 0%, #2d4a3e 100%);
          border: 2px solid #4ade80;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .slider-min {
          z-index: 1;
        }

        .slider-max {
          z-index: 2;
        }

        /* Checkbox grid for multi-select */
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .checkbox-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .checkbox-item:has(input:checked) {
          background: rgba(45, 74, 62, 0.2);
          border-color: rgba(45, 74, 62, 0.5);
        }

        .checkbox-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #2d4a3e;
          cursor: pointer;
        }

        .checkbox-item span {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .filters-footer {
          padding: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .search-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #3d5a4c 0%, #2d4a3e 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(45, 74, 62, 0.3);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .results-panel {
          flex: 1;
          min-width: 0;
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .toggle-filters-btn {
          display: none;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .results-count {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .loading-state,
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-state svg,
        .empty-state svg {
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 1rem;
        }

        .loading-state p,
        .empty-state h3 {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.5rem;
        }

        .project-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .project-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .project-card.hidden-card {
          opacity: 0.6;
          border-style: dashed;
        }

        .project-card.selected {
          border-color: rgba(45, 74, 62, 0.6);
          background: rgba(45, 74, 62, 0.1);
        }

        .project-checkbox {
          position: absolute;
          top: 1rem;
          left: 1rem;
          cursor: pointer;
        }

        .project-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #2d4a3e;
        }

        .bulk-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }

        .select-all-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #2d4a3e;
        }

        .selected-count {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: #4ade80;
          padding: 0.25rem 0.75rem;
          background: rgba(45, 74, 62, 0.2);
          border-radius: 12px;
        }

        .export-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .template-btn,
        .export-btn,
        .export-all-btn,
        .whatsapp-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
        }

        .template-btn {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .template-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .export-btn {
          background: rgba(201, 169, 98, 0.1);
          border-color: rgba(201, 169, 98, 0.3);
          color: #c9a962;
        }

        .export-btn:hover:not(:disabled) {
          background: rgba(201, 169, 98, 0.2);
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .whatsapp-btn {
          background: rgba(37, 211, 102, 0.15);
          border-color: rgba(37, 211, 102, 0.4);
          color: #25d366;
        }

        .whatsapp-btn:hover:not(:disabled) {
          background: rgba(37, 211, 102, 0.25);
          border-color: rgba(37, 211, 102, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);
        }

        .whatsapp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-all-btn {
          background: linear-gradient(135deg, #3d5a4c 0%, #2d4a3e 100%);
          border-color: rgba(45, 74, 62, 0.5);
          color: #fff;
        }

        .export-all-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 74, 62, 0.3);
        }

        .export-all-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .delete-selected-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
        }

        .delete-selected-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.3) 100%);
          border-color: rgba(239, 68, 68, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .delete-selected-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .visibility-toggle {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 169, 98, 0.1);
          border: 1px solid rgba(201, 169, 98, 0.3);
          border-radius: 8px;
          color: #c9a962;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .visibility-toggle:hover {
          background: rgba(201, 169, 98, 0.2);
        }

        .card-header {
          margin-bottom: 1rem;
          padding-right: 3rem;
          padding-left: 2.5rem;
        }

        .card-header h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .card-header .developer {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .card-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .card-row svg:first-child {
          color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }

        .card-row span {
          flex: 1;
        }

        .field-toggle {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .field-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.5rem;
          width: fit-content;
        }

        .status-badge[data-status="Available"] {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
        }

        .status-badge[data-status="Sold Out"] {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        .status-badge[data-status="Limited Inventory"] {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .status-badge[data-status="Coming Soon"] {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .view-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .download-btns {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          flex-shrink: 1;
          min-width: 0;
        }

        .card-footer .download-btn {
          width: 32px;
          height: 32px;
          min-width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(45, 74, 62, 0.2);
          border: 1px solid rgba(45, 74, 62, 0.4);
          border-radius: 8px;
          color: #4ade80;
          text-decoration: none;
          transition: all 0.2s ease;
          padding: 0;
        }

        .card-footer .download-btn:hover {
          background: rgba(45, 74, 62, 0.4);
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .pagination button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination button:hover,
        .pagination button.active {
          background: rgba(45, 74, 62, 0.3);
          border-color: rgba(45, 74, 62, 0.5);
          color: #fff;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          position: relative;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          background: #141419;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .modal-header {
          margin-bottom: 1.5rem;
          padding-right: 3rem;
        }

        .modal-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .modal-header .developer {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .edit-btn, .delete-btn, .save-btn, .cancel-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
        }

        .edit-btn {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .save-btn {
          background: linear-gradient(135deg, #3d5a4c 0%, #2d4a3e 100%);
          border-color: rgba(45, 74, 62, 0.5);
          color: #fff;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 74, 62, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
        }

        .form-group select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
        }

        .form-group select option {
          background: #1a1a1f;
          color: #fff;
          padding: 0.75rem;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: rgba(45, 74, 62, 0.5);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .edit-checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .edit-checkbox-group .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-checkbox-group .checkbox-label:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .edit-checkbox-group .checkbox-label:has(input:checked) {
          background: rgba(45, 74, 62, 0.2);
          border-color: rgba(45, 74, 62, 0.5);
        }

        .edit-checkbox-group .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #2d4a3e;
          cursor: pointer;
        }

        .edit-checkbox-group .checkbox-label span {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .attributes-edit-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .attributes-edit-section h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #c9a962;
          margin-bottom: 1rem;
        }

        .attributes-edit-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .attributes-edit-grid .form-group.full-width {
          grid-column: 1 / -1;
        }

        .attributes-edit-grid .form-group label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.35rem;
        }

        .attributes-edit-grid .form-group input {
          padding: 0.6rem 0.8rem;
          font-size: 0.85rem;
        }

        .media-upload-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .media-upload-section h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .media-upload-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .file-upload-area {
          position: relative;
        }

        .file-upload-area input[type="file"] {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: rgba(59, 130, 246, 0.1);
          border: 2px dashed rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          color: #93c5fd;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .file-upload-label:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .selected-files {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .selected-file-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .selected-file-item svg:first-child {
          color: #3b82f6;
        }

        .selected-file-item span {
          flex: 1;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .selected-file-item button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          background: rgba(239, 68, 68, 0.2);
          border: none;
          border-radius: 4px;
          color: #f87171;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .selected-file-item button:hover {
          background: rgba(239, 68, 68, 0.4);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          padding: 1rem;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-item label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.5rem;
        }

        .detail-item span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: #fff;
        }

        .description-section,
        .tags-section,
        .media-section {
          margin-bottom: 1.5rem;
        }

        .description-section h3,
        .tags-section h3,
        .media-section h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.75rem;
        }

        .description-section p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          padding: 0.35rem 0.75rem;
          background: rgba(201, 169, 98, 0.1);
          border: 1px solid rgba(201, 169, 98, 0.3);
          border-radius: 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          color: #c9a962;
        }

        .download-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .media-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .media-item .download-btn {
          flex: 1;
        }

        .delete-media-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #f87171;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .delete-media-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          border-radius: 10px;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 150px;
        }

        .download-btn span {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .download-btn svg:last-child {
          opacity: 0.7;
          transition: all 0.2s ease;
        }

        .download-btn:hover svg:last-child {
          opacity: 1;
          transform: translateY(2px);
        }

        /* Floor Plan Button - Blue theme */
        .floor-plan-btn {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }

        .floor-plan-btn:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.2) 100%);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }

        .floor-plan-btn svg:first-child {
          color: #3b82f6;
        }

        /* Video Button - Purple theme */
        .video-btn {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #d8b4fe;
        }

        .video-btn:hover {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.2);
        }

        .video-btn svg:first-child {
          color: #a855f7;
        }

        .maps-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4ade80;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .maps-link:hover {
          color: #22c55e;
          text-decoration: underline;
        }

        .attributes-section {
          margin-bottom: 1.5rem;
        }

        .attributes-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 1rem;
        }

        .admin-badge {
          font-size: 0.7rem;
          font-weight: 400;
          padding: 0.25rem 0.5rem;
          background: rgba(201, 169, 98, 0.1);
          border: 1px solid rgba(201, 169, 98, 0.3);
          border-radius: 12px;
          color: #c9a962;
        }

        .attributes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .attribute-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 0.75rem;
        }

        .attribute-item label {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.35rem;
        }

        .attribute-item span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
        }

        @media (max-width: 1024px) {
          .filters-panel {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 320px;
            border-radius: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .filters-panel.open {
            transform: translateX(0);
          }

          .toggle-filters-btn {
            display: flex;
          }
        }

        @media (max-width: 640px) {
          .search-content {
            padding: 1rem;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .attributes-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            padding: 1.5rem;
          }

          .bulk-actions-bar {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .export-buttons {
            flex-wrap: wrap;
          }

          .template-btn,
          .export-btn,
          .export-all-btn {
            flex: 1;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchPage;
