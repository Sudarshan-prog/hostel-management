const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// --- Auth ---
export const loginAPI = async (credentials) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
};

export const ssoLoginAPI = async (email) => {
    const res = await fetch(`${BASE_URL}/auth/sso-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'SSO Login failed');
    }
    return res.json();
};

// --- Buildings ---
export const getBuildingsAPI = async () => {
    const res = await fetch(`${BASE_URL}/buildings`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const createBuildingAPI = async (building) => {
    const res = await fetch(`${BASE_URL}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(building)
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to create building');
    }
    return res.json();
};

export const updateBuildingAPI = async (id, building) => {
    const res = await fetch(`${BASE_URL}/buildings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(building)
    });
    return res.json();
};

export const deleteBuildingAPI = async (id) => {
    const res = await fetch(`${BASE_URL}/buildings/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to delete building');
    }
};

// --- Floors ---
export const getFloorsAPI = async () => {
    const res = await fetch(`${BASE_URL}/floors`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const createFloorAPI = async (floor) => {
    const res = await fetch(`${BASE_URL}/floors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(floor)
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to create floor');
    }
    return res.json();
};

export const updateFloorAPI = async (id, floor) => {
    const res = await fetch(`${BASE_URL}/floors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(floor)
    });
    return res.json();
};

export const deleteFloorAPI = async (id) => {
    const res = await fetch(`${BASE_URL}/floors/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to delete floor');
    }
};

// --- Rooms ---
export const getRoomsAPI = async () => {
    const res = await fetch(`${BASE_URL}/rooms`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const createRoomAPI = async (room) => {
    const res = await fetch(`${BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to create room');
    }
    return res.json();
};

export const updateRoomAPI = async (id, room) => {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
    });
    return res.json();
};

export const deleteRoomAPI = async (id) => {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to delete room');
    }
};

// --- Beds ---
export const getBedsAPI = async () => {
    const res = await fetch(`${BASE_URL}/beds`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const getBedsByYearAPI = async (yearOfStudy) => {
    const res = await fetch(`${BASE_URL}/beds/year/${yearOfStudy}`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const bookBedAPI = async (bedId, studentId) => {
    const res = await fetch(`${BASE_URL}/beds/${bedId}/book/${studentId}`, { method: 'POST' });
    return res.json();
};

export const unbookBedAPI = async (bedId) => {
    const res = await fetch(`${BASE_URL}/beds/${bedId}/unbook`, { method: 'POST' });
    return res.json();
};

// --- Students ---
export const getStudentsAPI = async () => {
    const res = await fetch(`${BASE_URL}/students`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const getStudentAPI = async (id) => {
    const res = await fetch(`${BASE_URL}/students/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const uploadStudentsCSVAPI = async (students) => {
    const res = await fetch(`${BASE_URL}/students/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students)
    });
    if (!res.ok) throw new Error('Failed to upload students');
    return res.text();
};

export const rolloverAPI = async () => {
    const res = await fetch(`${BASE_URL}/students/rollover`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run rollover');
    return res.text();
};

// --- Settings ---
export const getRolloverSettingsAPI = async () => {
    const res = await fetch(`${BASE_URL}/settings/rollover`);
    if (!res.ok) throw new Error('Failed to load rollover settings');
    return res.json();
};

export const updateRolloverSettingsAPI = async (settings) => {
    const res = await fetch(`${BASE_URL}/settings/rollover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update rollover settings');
    return res.json();
};

// --- Complaints ---
export const getComplaintsAPI = async () => {
    const res = await fetch(`${BASE_URL}/complaints`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const createComplaintAPI = async (complaint) => {
    const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint)
    });
    return res.json();
};

export const resolveComplaintAPI = async (id) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}/resolve`, { method: 'PUT' });
    return res.json();
};
