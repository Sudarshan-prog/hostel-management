import React, { useState } from 'react';
import * as api from '../services/apiService';
import { LogOut, Building, LayoutGrid, MessageSquarePlus, X, List, Clock, CheckCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapViewer from '../components/MapViewer';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  
  const studentId = parseInt(localStorage.getItem('studentId')) || 1;
  const studentEmail = localStorage.getItem('studentEmail') || '';
  const [studentYear, setStudentYear] = useState(parseInt(localStorage.getItem('studentYear')) || 1);
  
  const [myBookings, setMyBookings] = useState([]);

  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isMyComplaintsModalOpen, setIsMyComplaintsModalOpen] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);
  const [complaintForm, setComplaintForm] = useState({ subject: '', message: '', room: '' });

  const handlePassedOut = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentYear');
    alert('Your access has expired. You are no longer an enrolled student.');
    navigate('/login');
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const profile = await api.getStudentAPI(studentId);
      if (!profile) {
        handlePassedOut();
        return;
      }

      const currentYear = profile.yearOfStudy || 1;
      setStudentYear(currentYear);
      localStorage.setItem('studentYear', currentYear);

      const [bData, fData, rData, bedData, cData] = await Promise.all([
        api.getBuildingsAPI(),
        api.getFloorsAPI(),
        api.getRoomsAPI(),
        api.getBedsByYearAPI(currentYear),
        api.getComplaintsAPI()
      ]);

      const yearFloors = (fData || []).filter(f => f.targetYear === currentYear);
      const allowedFloorIds = new Set(yearFloors.map(f => f.id));

      setBuildings(bData || []);
      setFloors(yearFloors);
      setRooms((rData || []).filter(r => allowedFloorIds.has(r.floorId)));
      setBeds(bedData || []);

      if (bData.length > 0) {
        const buildingWithFloors = bData.find(b => yearFloors.some(f => f.buildingId === b.id));
        if (buildingWithFloors) {
          setSelectedBuilding(buildingWithFloors.id);
          const firstFloor = yearFloors.find(f => f.buildingId === buildingWithFloors.id);
          if (firstFloor) setSelectedFloor(firstFloor.id);
        }
      }
      
      const myBookedBeds = (bedData || []).filter(b => b.bookedByStudentId === studentId).map(b => b.id);
      setMyBookings(myBookedBeds);

      if (cData) {
        const studentComplaints = cData.filter(c => c.studentEmail === studentEmail);
        setMyComplaints(studentComplaints.reverse());
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleBookBed = async (bedId) => {
    if (myBookings.length > 0) {
      const bookedBedId = myBookings[0];
      const bookedBed = beds.find(b => b.id === bookedBedId);
      const bookedRoom = bookedBed ? rooms.find(r => r.id === bookedBed.roomId) : null;
      const bookedFloor = bookedRoom ? floors.find(f => f.id === bookedRoom.floorId) : null;
      const bookedBuilding = bookedFloor ? buildings.find(b => b.id === bookedFloor.buildingId) : null;
      
      let alertMsg = 'You have already booked a bed! Please cancel your current booking before selecting a new one.';
      if (bookedBed && bookedRoom && bookedFloor && bookedBuilding) {
        alertMsg = `You have already booked a bed!\n\nCurrently booked: ${bookedBuilding.name} - ${bookedFloor.name} - Room ${bookedRoom.roomNumber}\n\nPlease cancel your current booking first.`;
      }
      alert(alertMsg);
      return;
    }
    try {
      await api.bookBedAPI(bedId, studentId);
      await loadData();
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book bed.");
    }
  };

  const handleCancelBed = async (bedId) => {
    try {
      await api.unbookBedAPI(bedId);
      await loadData();
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert("Failed to cancel bed.");
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createComplaintAPI({
        studentName: studentEmail.split('@')[0],
        studentEmail: studentEmail,
        room: complaintForm.room,
        subject: complaintForm.subject,
        message: complaintForm.message,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
      alert('Your complaint has been submitted successfully to the admin.');
      setIsComplaintModalOpen(false);
      setComplaintForm({ subject: '', message: '', room: '' });
    } catch (err) {
      console.error("Complaint failed:", err);
      alert("Failed to submit complaint.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentYear');
    navigate('/login');
  };

  const floorsInBuilding = floors.filter(f => f.buildingId === selectedBuilding);
  
  React.useEffect(() => {
    if (!floorsInBuilding.find(f => f.id === selectedFloor)) {
      if (floorsInBuilding.length > 0) {
        setSelectedFloor(floorsInBuilding[0].id);
      }
    }
  }, [selectedBuilding, floorsInBuilding, selectedFloor]);

  const roomsOnFloor = rooms.filter(r => r.floorId === selectedFloor);

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav glass-panel">
        <div className="nav-logo">
          <Building size={28} className="icon-primary" />
          <h2>HostelBook</h2>
        </div>
          <div className="nav-actions">
            <button className="btn-secondary" onClick={() => setIsMyComplaintsModalOpen(true)} title="My Complaints">
              <List size={18} /> My Complaints
            </button>
            <button className="btn-secondary" onClick={() => setIsComplaintModalOpen(true)} title="Register Complaint">
              <MessageSquarePlus size={18} /> New Complaint
            </button>
            <div className="user-profile">
              <span className="profile-badge"><User size={16}/> {studentEmail} (Year {studentYear})</span>
            </div>
            <button className="btn-secondary logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
      </nav>

      <main className="dashboard-main animate-fade-in">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard data...</div>
        ) : floors.length === 0 ? (
          <div className="empty-state glass-panel" style={{ margin: '2rem' }}>
            <LayoutGrid size={48} />
            <h3>No floor assigned for your year</h3>
            <p>Please contact the hostel administration. Your year (Year {studentYear}) does not have a configured floor yet.</p>
          </div>
        ) : (
          <>
            <header className="dashboard-header">
          <div>
            <h1 className="text-gradient">Select Your Bed</h1>
            <p className="subtitle">Book a bed on your assigned floor (Year {studentYear}).</p>
          </div>
          
          <div className="dashboard-controls glass-panel">
            <div className="control-group">
              <label>Building</label>
              <select 
                value={selectedBuilding || ''} 
                onChange={(e) => setSelectedBuilding(Number(e.target.value))}
              >
                {buildings.filter(b => floors.some(f => f.buildingId === b.id)).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Floor</label>
              <select 
                value={selectedFloor || ''} 
                onChange={(e) => setSelectedFloor(Number(e.target.value))}
                disabled={floorsInBuilding.length === 0}
              >
                {floorsInBuilding.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--status-available)'}}></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--status-booked)'}}></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--status-selected)'}}></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--accent-primary)'}}></div>
            <span>My Booking</span>
          </div>
        </div>

        <div className="map-container">
          {roomsOnFloor.length > 0 ? (
            <MapViewer 
              rooms={roomsOnFloor} 
              allBeds={beds} 
              myBookings={myBookings}
              onBookBed={handleBookBed}
              onCancelBed={handleCancelBed}
            />
          ) : (
            <div className="empty-state glass-panel">
              <LayoutGrid size={48} />
              <h3>No rooms available</h3>
              <p>This floor currently has no rooms configured.</p>
            </div>
          )}
        </div>
        </>
        )}
      </main>

      {isMyComplaintsModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>My Complaints</h2>
              <button className="icon-btn" onClick={() => setIsMyComplaintsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {myComplaints.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>You have not submitted any complaints.</p>
              ) : (
                myComplaints.map(c => (
                  <div key={c.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{c.subject}</strong>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: c.status === 'resolved' ? 'var(--status-available)' : 'var(--status-selected)', fontSize: '0.85rem', fontWeight: '500' }}>
                        {c.status === 'resolved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Date: {c.date} • Room: {c.room}
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }}>
                      {c.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isComplaintModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Register a Complaint</h2>
              <button className="icon-btn" onClick={() => setIsComplaintModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleComplaintSubmit}>
              <div className="form-group">
                <label>Room Number</label>
                <input 
                  type="text" 
                  value={complaintForm.room} 
                  onChange={(e) => setComplaintForm({...complaintForm, room: e.target.value})}
                  required 
                  placeholder="e.g. A-G01"
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  value={complaintForm.subject} 
                  onChange={(e) => setComplaintForm({...complaintForm, subject: e.target.value})}
                  required 
                  placeholder="What is the issue about?"
                />
              </div>
              <div className="form-group">
                <label>Details</label>
                <textarea 
                  value={complaintForm.message} 
                  onChange={(e) => setComplaintForm({...complaintForm, message: e.target.value})}
                  required 
                  placeholder="Describe the issue in detail..."
                  rows="4"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'black' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsComplaintModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
