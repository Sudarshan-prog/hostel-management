import React, { useState, useEffect } from 'react';
import { LogOut, Building2, Layers, DoorOpen, Users, Plus, Edit2, Trash2, X, MessageSquareWarning, CheckCircle, Clock, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/apiService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buildings'); 
  
  // Real State from API
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRolloverEnabled, setAutoRolloverEnabled] = useState(false);
  const [rolloverSchedule, setRolloverSchedule] = useState('');

  // Fetch data on mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bData, fData, rData, sData, cData, bedData] = await Promise.all([
        api.getBuildingsAPI(),
        api.getFloorsAPI(),
        api.getRoomsAPI(),
        api.getStudentsAPI(),
        api.getComplaintsAPI(),
        api.getBedsAPI()
      ]);
      setBuildings(bData || []);
      setFloors(fData || []);
      setRooms(rData || []);
      setStudents(sData || []);
      setComplaints(cData || []);
      setBeds(bedData || []);

      try {
        const rolloverSettings = await api.getRolloverSettingsAPI();
        setAutoRolloverEnabled(rolloverSettings.enabled);
        setRolloverSchedule(rolloverSettings.schedule || '');
      } catch (settingsErr) {
        console.warn('Could not load rollover settings:', settingsErr);
      }
    } catch (err) {
      console.error("Failed to load data from API. Is the Spring Boot backend running?", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [viewingComplaint, setViewingComplaint] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);

  const handleLogout = () => navigate('/admin');

  // Open Modal Helpers
  const openAddModal = () => {
    setModalMode('add');
    setCurrentItem({});
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setCurrentItem({ ...item });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  // CRUD Operations with Real Backend
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'buildings') {
        if (modalMode === 'add') {
          await api.createBuildingAPI(currentItem);
        } else {
          await api.updateBuildingAPI(currentItem.id, currentItem);
        }
      } else if (activeTab === 'floors') {
        if (modalMode === 'add') {
          await api.createFloorAPI(currentItem);
        } else {
          await api.updateFloorAPI(currentItem.id, currentItem);
        }
      } else if (activeTab === 'rooms') {
        if (modalMode === 'add') {
          await api.createRoomAPI(currentItem);
        } else {
          await api.updateRoomAPI(currentItem.id, currentItem);
        }
      } else if (activeTab === 'students') {
        if (modalMode === 'add') {
          await api.uploadStudentsCSVAPI([{
            name: currentItem.name,
            email: currentItem.email,
            phone: currentItem.phone || ''
          }]);
        }
      }
      await loadData(); // Reload from backend
      closeModal();
    } catch (err) {
      console.error("Failed to save data:", err);
      alert("Failed to save: " + (err.message || "Unknown error. Make sure backend is running."));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) return alert("Invalid CSV: Must have a header row and at least one data row.");
      
      // Smart header detection - find name, email, phone columns regardless of order
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const nameCol = headers.findIndex(h => h.includes('name') || h.includes('student'));
      const emailCol = headers.findIndex(h => h.includes('email') || h.includes('mail'));
      const phoneCol = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));

      if (nameCol === -1 || emailCol === -1) {
        return alert("CSV Error: Could not find 'Name' and 'Email' columns in the header row.\n\nExpected headers like: Name, Email, Phone");
      }
      
      const studentsToUpload = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/['"]/g, ''));
        return { 
          name: cols[nameCol] || '', 
          email: cols[emailCol] || '', 
          phone: phoneCol !== -1 ? (cols[phoneCol] || '') : '' 
        };
      }).filter(s => s.name && s.email); // Skip empty rows

      try {
        await api.uploadStudentsCSVAPI(studentsToUpload);
        alert("Students uploaded successfully!");
        loadData();
      } catch (err) {
        alert("Failed to upload students");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeTab === 'buildings') await api.deleteBuildingAPI(id);
      else if (activeTab === 'floors') await api.deleteFloorAPI(id);
      else if (activeTab === 'rooms') await api.deleteRoomAPI(id);
      
      await loadData(); // Reload from backend
    } catch (err) {
      console.error("Failed to delete:", err);
      alert(err.message || "Failed to delete.");
    }
  };

  const handleResolveComplaint = async (id) => {
    try {
      await api.resolveComplaintAPI(id);
      await loadData();
    } catch (err) {
      console.error("Failed to resolve:", err);
    }
  };

  const handleAutoRolloverToggle = async (e) => {
    const enabled = e.target.checked;
    try {
      const updated = await api.updateRolloverSettingsAPI({ enabled });
      setAutoRolloverEnabled(updated.enabled);
      setRolloverSchedule(updated.schedule || '');
    } catch (err) {
      console.error('Failed to update rollover setting:', err);
      alert('Failed to update automatic rollover setting.');
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar glass-panel">
        <div className="admin-logo">
          <Building2 size={28} className="icon-admin" />
          <h2 className="text-gradient">HostelAdmin</h2>
        </div>
        
        <nav className="admin-nav-links">
          <button className={`admin-nav-btn ${activeTab === 'buildings' ? 'active' : ''}`} onClick={() => setActiveTab('buildings')}>
            <Building2 size={20} /> Buildings
          </button>
          <button className={`admin-nav-btn ${activeTab === 'floors' ? 'active' : ''}`} onClick={() => setActiveTab('floors')}>
            <Layers size={20} /> Floors
          </button>
          <button className={`admin-nav-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            <DoorOpen size={20} /> Rooms & Beds
          </button>
          <button className={`admin-nav-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <Users size={20} /> Students
          </button>
          <button className={`admin-nav-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
            <MessageSquareWarning size={20} /> Complaints
            {complaints.filter(c => c.status === 'pending').length > 0 && (
              <span className="complaint-badge">{complaints.filter(c => c.status === 'pending').length}</span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="btn-secondary" onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main animate-fade-in">
        <header className="admin-header">
          <div>
            <h1>Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="subtitle">
              {activeTab === 'complaints' ? 'Review and manage student complaints.' : activeTab === 'students' ? 'View registered students and their allocations.' : "Configure your hostel's physical structure."}
            </p>
          </div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            {activeTab !== 'complaints' && (
              <button className="btn-primary" onClick={openAddModal}>
                <Plus size={20} /> Add New
              </button>
            )}
            {activeTab === 'students' && (
              <div>
                <input type="file" id="csv-upload" accept=".csv" style={{display: 'none'}} onChange={handleFileUpload} />
                <label htmlFor="csv-upload" className="btn-secondary" style={{cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>
                  <Plus size={20} /> Bulk Upload Freshers (1st Year)
                </label>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Content Based on Tab */}
        <div className="admin-content glass-panel">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading data from backend...</div>
          ) : (
            <>
              {activeTab === 'buildings' && (
            <div className="data-table">
              <div className="table-header">
                <div>ID</div>
                <div>Building Name</div>
                <div className="text-right">Actions</div>
              </div>
              {buildings.map((b, index) => (
                <div className="table-row" key={b.id}>
                  <div>#{index + 1}</div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="actions text-right">
                    <button className="icon-btn text-blue" onClick={() => openEditModal(b)}><Edit2 size={18} /></button>
                    <button className="icon-btn text-red" onClick={() => handleDelete(b.id)}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'floors' && (
            <div className="data-table floors-table">
              <div className="table-header">
                <div>Floor ID</div>
                <div>Building</div>
                <div>Floor Name</div>
                <div>Target Year</div>
                <div className="text-right">Actions</div>
              </div>
              {floors.map((f, index) => {
                const building = buildings.find(b => b.id === f.buildingId);
                return (
                  <div className="table-row" key={f.id}>
                    <div>#{index + 1}</div>
                    <div>{building?.name || 'Unknown'}</div>
                    <div className="font-semibold">{f.name}</div>
                    <div>Year {f.targetYear || '—'}</div>
                    <div className="actions text-right">
                      <button className="icon-btn text-blue" onClick={() => openEditModal(f)}><Edit2 size={18} /></button>
                      <button className="icon-btn text-red" onClick={() => handleDelete(f.id)}><Trash2 size={18} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="data-table">
              <div className="table-header">
                <div>Room Number</div>
                <div>Floor</div>
                <div>Type</div>
                <div className="text-right">Actions</div>
              </div>
              {rooms.map(r => {
                const floor = floors.find(f => f.id === r.floorId);
                return (
                  <div className="table-row" key={r.id}>
                    <div className="font-semibold">{r.roomNumber}</div>
                    <div>{floor?.name || 'Unknown'}</div>
                    <div><span className="room-type-badge">{r.type}</span></div>
                    <div className="actions text-right">
                      <button className="icon-btn text-blue" onClick={() => openEditModal(r)}><Edit2 size={18} /></button>
                      <button className="icon-btn text-red" onClick={() => handleDelete(r.id)}><Trash2 size={18} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'students' && (
            <>
              {/* Academic Rollover Settings Panel */}
              <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #3b82f6', background: 'var(--bg-primary)' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <RefreshCw size={20} className="text-blue" /> Academic Year Rollover
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Promote all students to the next year, delete passed-out 4th years, and clear all bed allocations.
                  </p>
                  
                  <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <input 
                        type="checkbox" 
                        checked={autoRolloverEnabled} 
                        onChange={handleAutoRolloverToggle} 
                        style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: '#3b82f6' }} 
                      />
                      Auto-Rollover
                    </label>
                  </div>
                </div>
                
                <button className="btn-primary" onClick={async () => {
                    if (window.confirm("WARNING: Academic Year Rollover will promote all students, delete 4th years, and unbook all beds. Are you sure you want to proceed?")) {
                      try {
                        await api.rolloverAPI();
                        alert("Academic Year Rollover completed successfully!");
                        loadData();
                      } catch (e) {
                        alert("Error during rollover: " + e.message);
                      }
                    }
                  }} 
                  style={{ background: '#ef4444', border: 'none', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} /> Run Manual Rollover
                </button>
              </div>

              {/* Data Table */}
              <div className="data-table students-table">
              <div className="table-header">
                <div>ID</div>
                <div>Name</div>
                <div>Email</div>
                <div>Year</div>
                <div>Room</div>
                <div>Bed</div>
              </div>
              {students.map((s, index) => {
                const bookedBed = beds.find(b => b.bookedByStudentId === s.id);
                const bookedRoom = bookedBed ? rooms.find(r => r.id === bookedBed.roomId) : null;
                return (
                  <div className="table-row" key={s.id}>
                    <div>#{index + 1}</div>
                    <div className="font-semibold">{s.name}</div>
                    <div>{s.email}</div>
                    <div>Year {s.yearOfStudy || 1}</div>
                    <div>{bookedRoom ? <span className="room-type-badge">{bookedRoom.roomNumber}</span> : <span style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}>Not booked</span>}</div>
                    <div>{bookedBed ? bookedBed.identifier : <span style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}>—</span>}</div>
                  </div>
                );
              })}
            </div>
            </>
          )}

          {activeTab === 'complaints' && (
            <div className="data-table complaints-table">
              <div className="table-header">
                <div>ID</div>
                <div>Student</div>
                <div>Subject</div>
                <div>Date</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>
              {complaints.map((c, index) => (
                <div className="table-row" key={c.id}>
                  <div>#{index + 1}</div>
                  <div className="font-semibold">{c.studentEmail}<br/><span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Room {c.room}</span></div>
                  <div className="font-semibold">{c.subject}</div>
                  <div>{c.date}</div>
                  <div>
                    <span className={`status-badge status-${c.status}`}>
                      {c.status === 'pending' ? <Clock size={14} /> : <CheckCircle size={14} />}
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                  <div className="actions text-right">
                    <button className="icon-btn text-blue" onClick={() => setViewingComplaint(c)} title="View Details"><Eye size={18} /></button>
                    {c.status === 'pending' && (
                      <button className="icon-btn text-green" onClick={() => handleResolveComplaint(c.id)} title="Mark Resolved"><CheckCircle size={18} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
        )}
        </div>
      </main>

      {/* View Complaint Modal */}
      {viewingComplaint && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <button className="icon-btn" onClick={() => setViewingComplaint(null)}><X size={24} /></button>
            </div>
            <div className="modal-form" style={{ gap: '1rem' }}>
              <div><strong>Student:</strong> {viewingComplaint.studentName} ({viewingComplaint.studentEmail})</div>
              <div><strong>Room:</strong> {viewingComplaint.room}</div>
              <div><strong>Subject:</strong> {viewingComplaint.subject}</div>
              <div><strong>Date:</strong> {viewingComplaint.date}</div>
              <div><strong>Status:</strong> {viewingComplaint.status}</div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <strong>Message:</strong><br/><br/>
                <div className="upload-container glass-panel">
                <h4>Upload Freshers (1st Year)</h4>
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Upload a JSON file of new 1st-year students. Ensure it's an array of objects: <code>{`{ "name": "...", "email": "..." }`}</code>.<br/>
                  <em>They will automatically be assigned as 1st Year students.</em>
                </p></div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '2rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setViewingComplaint(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New' : 'Edit'} {activeTab.slice(0, -1)}</h2>
              <button className="icon-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form">
              {activeTab === 'buildings' && (
                <div className="form-group">
                  <label>Building Name</label>
                  <input 
                    type="text" 
                    value={currentItem?.name || ''} 
                    onChange={e => setCurrentItem({...currentItem, name: e.target.value})} 
                    required 
                  />
                </div>
              )}

              {activeTab === 'floors' && (
                <>
                  <div className="form-group">
                    <label>Floor Name</label>
                    <input 
                      type="text" 
                      value={currentItem?.name || ''} 
                      onChange={e => setCurrentItem({...currentItem, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Belongs to Building</label>
                    <select 
                      value={currentItem?.buildingId || ''} 
                      onChange={e => setCurrentItem({...currentItem, buildingId: parseInt(e.target.value)})}
                      required
                    >
                      <option value="" disabled>Select Building</option>
                      {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Target Year of Study</label>
                    <select 
                      value={currentItem?.targetYear || ''} 
                      onChange={e => setCurrentItem({...currentItem, targetYear: parseInt(e.target.value)})}
                      required
                    >
                      <option value="" disabled>Select Target Year</option>
                      <option value={1}>1st Year (Freshers)</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'rooms' && (
                <>
                  <div className="form-group">
                    <label>Room Number</label>
                    <input 
                      type="text" 
                      value={currentItem?.roomNumber || ''} 
                      onChange={e => setCurrentItem({...currentItem, roomNumber: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select 
                      value={currentItem?.type || ''} 
                      onChange={e => setCurrentItem({...currentItem, type: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="1-Sharing">1-Sharing</option>
                      <option value="2-Sharing">2-Sharing</option>
                      <option value="4-Sharing">4-Sharing</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Belongs to Floor</label>
                    <select 
                      value={currentItem?.floorId || ''} 
                      onChange={e => setCurrentItem({...currentItem, floorId: parseInt(e.target.value)})}
                      required
                    >
                      <option value="" disabled>Select Floor</option>
                      {floors.map(f => {
                        const buildingName = buildings.find(b => b.id === f.buildingId)?.name || 'Unknown Building';
                        return <option key={f.id} value={f.id}>{buildingName} - {f.name}</option>
                      })}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'students' && (
                <>
                  <div className="form-group">
                    <label>Student Name</label>
                    <input 
                      type="text" 
                      value={currentItem?.name || ''} 
                      onChange={e => setCurrentItem({...currentItem, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>College Email</label>
                    <input 
                      type="email" 
                      value={currentItem?.email || ''} 
                      onChange={e => setCurrentItem({...currentItem, email: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number (Optional)</label>
                    <input 
                      type="text" 
                      value={currentItem?.phone || ''} 
                      onChange={e => setCurrentItem({...currentItem, phone: e.target.value})} 
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
