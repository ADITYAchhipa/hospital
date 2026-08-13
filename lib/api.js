/**
 * API client for Hospital Portal
 */

export async function fetchHospitals() {
  const res = await fetch('/api/auth/hospitals');
  return res.json();
}

export async function sendHospitalOtp(hospitalId) {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hospitalId }),
  });
  return res.json();
}

export async function verifyHospitalOtp(hospitalId, otp, personnelId) {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hospitalId, otp, personnelId }),
  });
  return res.json();
}

export async function fetchPatients(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/patients${query ? `?${query}` : ''}`);
  return res.json();
}

export async function fetchPatientById(id) {
  const res = await fetch(`/api/patients/${id}`);
  return res.json();
}

export async function createPatient(data) {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePatient(id, updates) {
  const res = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function addPrescription(patientId, prescriptionData) {
  const res = await fetch(`/api/patients/${patientId}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prescriptionData),
  });
  return res.json();
}

export async function addMedicalReport(patientId, reportData) {
  const res = await fetch(`/api/patients/${patientId}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  return res.json();
}

export async function getPatientReports(patientId) {
  const res = await fetch(`/api/patients/${patientId}/reports`);
  return res.json();
}

export async function fetchNfcToken(patientId) {
  const res = await fetch(`/api/patients/${patientId}/nfc-token`);
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch('/api/stats');
  return res.json();
}

export async function fetchBloodRequests() {
  const res = await fetch('/api/blood-requests');
  return res.json();
}

export async function createBloodRequest(data) {
  const res = await fetch('/api/blood-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
