import React, { useState } from 'react';
import { BedDouble, CheckCircle } from 'lucide-react';
import './MapViewer.css';

const MapViewer = ({ rooms, allBeds, myBookings, onBookBed, onCancelBed }) => {
  const [selectedBed, setSelectedBed] = useState(null);

  const handleBedClick = (bed) => {
    // Cannot select already booked beds unless it's booked by me
    const isMyBooking = myBookings.includes(bed.id);
    if (bed.status === 'booked' && !isMyBooking) return;
    
    // Select the bed for booking or cancellation
    setSelectedBed(bed.id === selectedBed ? null : bed.id);
  };

  const handleConfirmBooking = () => {
    if (!selectedBed) return;
    onBookBed(selectedBed);
    setSelectedBed(null);
  };

  const handleCancelBooking = () => {
    if (!selectedBed) return;
    onCancelBed(selectedBed);
    setSelectedBed(null);
  };

  return (
    <div className="map-viewer-wrapper">
      <div className="floor-plan glass-panel">
        <div className="rooms-grid">
          {rooms.map(room => {
            const roomBeds = allBeds.filter(b => b.roomId === room.id);
            return (
              <div key={room.id} className="room-container">
                <div className="room-header">
                  <h4>{room.roomNumber}</h4>
                  <span className="room-type">{room.type}</span>
                </div>
                
                <div className="beds-grid">
                  {roomBeds.map(bed => {
                    const isSelected = selectedBed === bed.id;
                    const isMyBooking = myBookings.includes(bed.id);
                    let displayStatus = bed.status;
                    if (isMyBooking) displayStatus = 'my-booking';
                    
                    return (
                      <div 
                        key={bed.id} 
                        className={`bed-item status-${displayStatus} ${isSelected ? 'status-selected' : ''}`}
                        onClick={() => handleBedClick(bed)}
                        title={bed.identifier}
                      >
                        <BedDouble size={24} />
                        <span className="bed-id">{bed.identifier}</span>
                        {(isSelected || isMyBooking) && <CheckCircle size={16} className="selected-icon" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Panel Overlay */}
      {selectedBed && (
        <div className="booking-panel glass-panel animate-fade-in">
          <div className="booking-details">
            <h3>{myBookings.includes(selectedBed) ? 'Cancel Booking' : 'Confirm Booking'}</h3>
            <p>You have selected <strong>{allBeds.find(b => b.id === selectedBed)?.identifier}</strong></p>
            {myBookings.includes(selectedBed) && (
              <p style={{ color: 'var(--status-booked)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                *Note: Cancellation is subject to hostel rules & regulations. Your warden will be notified.
              </p>
            )}
          </div>
          {myBookings.includes(selectedBed) ? (
            <button className="btn-primary" style={{ background: 'var(--status-booked)' }} onClick={handleCancelBooking}>
              Cancel Allocation
            </button>
          ) : (
            <button className="btn-primary" onClick={handleConfirmBooking}>
              Confirm & Book
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MapViewer;
