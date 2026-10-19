const INITIAL_BUILDINGS = [
  { id: 1, name: "Block A - Freshmen" },
  { id: 2, name: "Block B - Seniors" }
];

const INITIAL_FLOORS = [
  { id: 101, buildingId: 1, floorNumber: 1, name: "Ground Floor" },
  { id: 102, buildingId: 1, floorNumber: 2, name: "First Floor" },
  { id: 201, buildingId: 2, floorNumber: 1, name: "Ground Floor" }
];

const INITIAL_ROOMS = [
  { id: 1011, floorId: 101, roomNumber: "A-G01", type: "4-Sharing" },
  { id: 1012, floorId: 101, roomNumber: "A-G02", type: "4-Sharing" },
  { id: 1013, floorId: 101, roomNumber: "A-G03", type: "2-Sharing" },
  { id: 1021, floorId: 102, roomNumber: "A-101", type: "4-Sharing" },
  { id: 1022, floorId: 102, roomNumber: "A-102", type: "4-Sharing" },
];

const INITIAL_BEDS = [
  { id: "b1", roomId: 1011, identifier: "Bed 1 (Window)", status: "available", bookedBy: null },
  { id: "b2", roomId: 1011, identifier: "Bed 2", status: "booked", bookedBy: "jane@kgkite.ac.in" },
  { id: "b3", roomId: 1011, identifier: "Bed 3", status: "available", bookedBy: null },
  { id: "b4", roomId: 1011, identifier: "Bed 4 (Door)", status: "available", bookedBy: null },
  { id: "b5", roomId: 1012, identifier: "Bed 1 (Window)", status: "booked", bookedBy: "ravi@kgkite.ac.in" },
  { id: "b6", roomId: 1012, identifier: "Bed 2", status: "booked", bookedBy: "priya@kgkite.ac.in" },
  { id: "b7", roomId: 1012, identifier: "Bed 3", status: "booked", bookedBy: "john@kgkite.ac.in" },
  { id: "b8", roomId: 1012, identifier: "Bed 4 (Door)", status: "available", bookedBy: null },
  { id: "b9", roomId: 1013, identifier: "Bed 1", status: "available", bookedBy: null },
  { id: "b10", roomId: 1013, identifier: "Bed 2", status: "booked", bookedBy: "sathasivam@kgkite.ac.in" },
];

const INITIAL_STUDENTS = [
  { id: 1, name: "John Doe", email: "john@kgkite.ac.in", room: "A-G02", bed: "Bed 3" },
  { id: 2, name: "Jane Smith", email: "jane@kgkite.ac.in", room: "A-G01", bed: "Bed 2" },
  { id: 3, name: "Ravi Kumar", email: "ravi@kgkite.ac.in", room: "A-G02", bed: "Bed 1 (Window)" },
  { id: 4, name: "Priya Sharma", email: "priya@kgkite.ac.in", room: "A-G02", bed: "Bed 2" },
  { id: 5, name: "Sathasivam B", email: "sathasivam@kgkite.ac.in", room: "A-G03", bed: "Bed 2" },
];

const INITIAL_COMPLAINTS = [
  { id: 1, studentName: "Jane Smith", studentEmail: "jane@kgkite.ac.in", room: "A-G01", subject: "Water Leakage", message: "Water leaking from ceiling.", date: "2026-06-20", status: "pending" },
  { id: 2, studentName: "Ravi Kumar", studentEmail: "ravi@kgkite.ac.in", room: "A-G02", subject: "Fan Not Working", message: "The ceiling fan stopped working.", date: "2026-06-21", status: "resolved" },
];

// Helper to initialize local storage if empty
const initStorage = (key, initialData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

export const getBuildings = () => initStorage('hostel_buildings', INITIAL_BUILDINGS);
export const setBuildings = (data) => localStorage.setItem('hostel_buildings', JSON.stringify(data));

export const getFloors = () => initStorage('hostel_floors', INITIAL_FLOORS);
export const setFloors = (data) => localStorage.setItem('hostel_floors', JSON.stringify(data));

export const getRooms = () => initStorage('hostel_rooms', INITIAL_ROOMS);
export const setRooms = (data) => localStorage.setItem('hostel_rooms', JSON.stringify(data));

export const getBeds = () => initStorage('hostel_beds', INITIAL_BEDS);
export const setBeds = (data) => localStorage.setItem('hostel_beds', JSON.stringify(data));

export const getStudents = () => initStorage('hostel_students', INITIAL_STUDENTS);
export const setStudents = (data) => localStorage.setItem('hostel_students', JSON.stringify(data));

export const getComplaints = () => initStorage('hostel_complaints', INITIAL_COMPLAINTS);
export const setComplaints = (data) => localStorage.setItem('hostel_complaints', JSON.stringify(data));
