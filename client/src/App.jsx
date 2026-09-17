import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

const emptyDoctor = {
  name: "",
  specialization: "",
  availability: "",
};

const emptyPatient = {
  name: "",
  phone: "",
  email: "",
};

const emptyAppointment = {
  doctorId: "",
  patientId: "",
  startTime: "",
  endTime: "",
  reason: "",
};

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function App() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [patientForm, setPatientForm] = useState(emptyPatient);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchData = async () => {
    setLoading(true);

    try {
      const [doctorResponse, patientResponse, appointmentResponse] = await Promise.all([
        fetch(`${API_URL}/api/doctors`),
        fetch(`${API_URL}/api/patients`),
        fetch(`${API_URL}/api/appointments`),
      ]);

      const [doctorData, patientData, appointmentData] = await Promise.all([
        doctorResponse.json(),
        patientResponse.json(),
        appointmentResponse.json(),
      ]);

      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setPatients(Array.isArray(patientData) ? patientData : []);
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Unable to load clinic data. Please check the backend server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(
    () => ({
      doctors: doctors.length,
      patients: patients.length,
      booked: appointments.filter((appointment) => appointment.status === "Booked").length,
      cancelled: appointments.filter((appointment) => appointment.status === "Cancelled").length,
    }),
    [doctors.length, patients.length, appointments]
  );

  const handleDoctorSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Failed to add doctor." });
        return;
      }

      setMessage({ type: "success", text: data.message || "Doctor added successfully." });
      setDoctorForm(emptyDoctor);
      await fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Could not add the doctor." });
    }
  };

  const handlePatientSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Failed to add patient." });
        return;
      }

      setMessage({ type: "success", text: data.message || "Patient added successfully." });
      setPatientForm(emptyPatient);
      await fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Could not add the patient." });
    }
  };

  const handleAppointmentSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...appointmentForm,
          doctorId: Number(appointmentForm.doctorId),
          patientId: Number(appointmentForm.patientId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Could not create appointment." });
        return;
      }

      setMessage({ type: "success", text: data.message || "Appointment booked successfully." });
      setAppointmentForm(emptyAppointment);
      await fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Unable to book appointment." });
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Failed to cancel appointment." });
        return;
      }

      setMessage({ type: "success", text: data.message || "Appointment cancelled." });
      await fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Could not cancel appointment." });
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Clinic operations</span>
          <h1>MediPulse</h1>
        </div>
        <div className="status-pill">{loading ? "Refreshing data..." : "System online"}</div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Doctors</span>
          <strong>{stats.doctors}</strong>
        </div>
        <div className="stat-card">
          <span>Patients</span>
          <strong>{stats.patients}</strong>
        </div>
        <div className="stat-card">
          <span>Booked</span>
          <strong>{stats.booked}</strong>
        </div>
        <div className="stat-card">
          <span>Cancelled</span>
          <strong>{stats.cancelled}</strong>
        </div>
      </section>

      {message.text ? (
        <div className={`notice ${message.type}`}>{message.text}</div>
      ) : null}

      <main className="content-grid">
        <section className="panel">
          <h2>Add Doctor</h2>
          <form className="form-grid" onSubmit={handleDoctorSubmit}>
            <input
              type="text"
              placeholder="Doctor name"
              value={doctorForm.name}
              onChange={(event) => setDoctorForm({ ...doctorForm, name: event.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Specialization"
              value={doctorForm.specialization}
              onChange={(event) =>
                setDoctorForm({ ...doctorForm, specialization: event.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Availability"
              value={doctorForm.availability}
              onChange={(event) =>
                setDoctorForm({ ...doctorForm, availability: event.target.value })
              }
              required
            />
            <button type="submit">Add doctor</button>
          </form>
        </section>

        <section className="panel">
          <h2>Add Patient</h2>
          <form className="form-grid" onSubmit={handlePatientSubmit}>
            <input
              type="text"
              placeholder="Patient name"
              value={patientForm.name}
              onChange={(event) => setPatientForm({ ...patientForm, name: event.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={patientForm.phone}
              onChange={(event) => setPatientForm({ ...patientForm, phone: event.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={patientForm.email}
              onChange={(event) => setPatientForm({ ...patientForm, email: event.target.value })}
              required
            />
            <button type="submit">Add patient</button>
          </form>
        </section>

        <section className="panel full-panel">
          <h2>Book Appointment</h2>
          <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
            <select
              value={appointmentForm.doctorId}
              onChange={(event) =>
                setAppointmentForm({ ...appointmentForm, doctorId: event.target.value })
              }
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} • {doctor.specialization}
                </option>
              ))}
            </select>

            <select
              value={appointmentForm.patientId}
              onChange={(event) =>
                setAppointmentForm({ ...appointmentForm, patientId: event.target.value })
              }
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={appointmentForm.startTime}
              onChange={(event) =>
                setAppointmentForm({ ...appointmentForm, startTime: event.target.value })
              }
              required
            />

            <input
              type="datetime-local"
              value={appointmentForm.endTime}
              onChange={(event) =>
                setAppointmentForm({ ...appointmentForm, endTime: event.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Visit reason"
              value={appointmentForm.reason}
              onChange={(event) =>
                setAppointmentForm({ ...appointmentForm, reason: event.target.value })
              }
            />

            <button type="submit">Book appointment</button>
          </form>
        </section>

        <section className="panel full-panel">
          <div className="section-header">
            <h2>Appointments</h2>
            <span>{appointments.length} total</span>
          </div>

          {appointments.length === 0 ? (
            <p className="empty-state">No appointments scheduled yet.</p>
          ) : (
            <div className="appointment-list">
              {appointments.map((appointment) => {
                const doctor = doctors.find((item) => item.id === appointment.doctorId);
                const patient = patients.find((item) => item.id === appointment.patientId);

                return (
                  <article key={appointment.id} className="appointment-card">
                    <div className="card-header">
                      <div>
                        <span className="label">Appointment</span>
                        <h3>{doctor ? doctor.name : "Unknown doctor"}</h3>
                      </div>
                      <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <p>
                      <strong>Patient:</strong> {patient ? patient.name : "Unknown patient"}
                    </p>
                    <p>
                      <strong>Time:</strong> {formatDate(appointment.startTime)} — {formatDate(appointment.endTime)}
                    </p>
                    <p>
                      <strong>Reason:</strong> {appointment.reason || "General consultation"}
                    </p>

                    {appointment.status !== "Cancelled" ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
