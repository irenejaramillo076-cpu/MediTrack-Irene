

$(function () {
    "use strict";

   
    const demoPatients = [
        { id: 1, expediente: "MED-2026-0001", nombre: "Ana González", edad: 34, identificacion: "8-000-000", sangre: "O+", telefono: "+507 6000-0000", correo: "ana@demo.test", ultima: "28/08/2026", estado: "ACTIVO", seguimiento: ["28 AGO · Consulta general · Seguimiento", "15 JUL · Control médico · Finalizada", "03 JUN · Primera consulta · Finalizada"], ultimaConsulta: "Dolor de cabeza recurrente. Se mantiene seguimiento." },
        { id: 2, expediente: "MED-2026-0002", nombre: "Carlos Méndez", edad: 48, identificacion: "8-111-111", sangre: "A+", telefono: "+507 6111-1111", correo: "carlos@demo.test", ultima: "27/08/2026", estado: "SEGUIMIENTO", seguimiento: ["27 AGO · Consulta general · Seguimiento", "02 AGO · Evaluación · Finalizada"], ultimaConsulta: "Control de signos vitales y evaluación general." },
        { id: 3, expediente: "MED-2026-0003", nombre: "Laura Díaz", edad: 29, identificacion: "8-222-222", sangre: "B+", telefono: "+507 6222-2222", correo: "laura@demo.test", ultima: "25/08/2026", estado: "ACTIVO", seguimiento: ["25 AGO · Consulta · Finalizada"], ultimaConsulta: "Consulta de rutina." },
        { id: 4, expediente: "MED-2026-0004", nombre: "José Martínez", edad: 61, identificacion: "8-333-333", sangre: "O-", telefono: "+507 6333-3333", correo: "jose@demo.test", ultima: "22/08/2026", estado: "CONTROL", seguimiento: ["22 AGO · Control · Programado"], ultimaConsulta: "Paciente programado para control." },
        { id: 5, expediente: "MED-2026-0005", nombre: "Sofía Herrera", edad: 17, identificacion: "8-444-444", sangre: "AB+", telefono: "+507 6444-4444", correo: "sofia@demo.test", ultima: "20/08/2026", estado: "ACTIVO", seguimiento: ["20 AGO · Pediatría · Finalizada"], ultimaConsulta: "Seguimiento pediátrico." }
    ];

    const demoDoctors = [
        { id: 1, nombre: "Dra. Ana Ruiz", especialidad: "Cardiología", registro: "MED-0041", turno: "08:00–16:00", estado: "DISPONIBLE" },
        { id: 2, nombre: "Dr. José Díaz", especialidad: "Pediatría", registro: "MED-0036", turno: "07:00–15:00", estado: "EN CONSULTA" },
        { id: 3, nombre: "Dra. Carla Méndez", especialidad: "Dermatología", registro: "MED-0055", turno: "09:00–17:00", estado: "DISPONIBLE" },
        { id: 4, nombre: "Dr. Luis Herrera", especialidad: "Medicina General", registro: "MED-0028", turno: "12:00–20:00", estado: "PRÓXIMO TURNO" },
        { id: 5, nombre: "Dra. Sofía Pérez", especialidad: "Ginecología", registro: "MED-0062", turno: "08:00–16:00", estado: "DISPONIBLE" }
    ];

    const demoAppointments = [
        { id: 1, pacienteId: 1, paciente: "Ana González", especialidad: "Medicina General", medico: "Dr. Luis Herrera", fecha: "2026-09-07", hora: "08:30", estado: "CONFIRMADA" },
        { id: 2, pacienteId: 2, paciente: "Carlos Méndez", especialidad: "Pediatría", medico: "Dr. José Díaz", fecha: "2026-09-07", hora: "09:00", estado: "EN ESPERA" },
        { id: 3, pacienteId: 3, paciente: "Laura Díaz", especialidad: "Cardiología", medico: "Dra. Ana Ruiz", fecha: "2026-09-07", hora: "09:30", estado: "CONFIRMADA" },
        { id: 4, pacienteId: 4, paciente: "José Martínez", especialidad: "Medicina General", medico: "Dr. Luis Herrera", fecha: "2026-09-07", hora: "10:15", estado: "PROGRAMADA" }
    ];

    const demoUsers = [
        { id: 1, nombre: "María Pérez", rol: "Administrador", area: "Sistemas", estado: "ACTIVO" },
        { id: 2, nombre: "Luis Gómez", rol: "Recepción", area: "Admisión", estado: "ACTIVO" },
        { id: 3, nombre: "Dra. Ana Ruiz", rol: "Médico", area: "Cardiología", estado: "ACTIVO" },
        { id: 4, nombre: "Dr. José Díaz", rol: "Médico", area: "Pediatría", estado: "ACTIVO" },
        { id: 5, nombre: "Carla Ríos", rol: "Recepción", area: "Admisión", estado: "INACTIVO" }
    ];

    let patients = loadCollection("meditrackPatients", demoPatients);
    let doctors = loadCollection("meditrackDoctors", demoDoctors);
    let appointments = loadCollection("meditrackAppointments", demoAppointments);
    let users = loadCollection("meditrackUsers", demoUsers);
    let selectedPatientId = Number(localStorage.getItem("meditrackSelectedPatient")) || patients[0]?.id || null;
    let agendaCompact = false;

   
    function loadCollection(key, fallback) {
        const saved = localStorage.getItem(key);
        if (!saved) return structuredClone(fallback);

        try {
            return JSON.parse(saved);
        } catch (error) {
            console.warn("No se pudo leer", key, error);
            return structuredClone(fallback);
        }
    }

    function saveState() {
        localStorage.setItem("meditrackPatients", JSON.stringify(patients));
        localStorage.setItem("meditrackDoctors", JSON.stringify(doctors));
        localStorage.setItem("meditrackAppointments", JSON.stringify(appointments));
        localStorage.setItem("meditrackUsers", JSON.stringify(users));
    }

    function normalize(text) {
        return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function statusClass(status) {
        return normalize(status).toUpperCase().replace(/\s+/g, "-");
    }

    function showAlert(selector, message, type) {
        const $box = $(selector);
        $box.removeClass("success error").addClass(type).text(message);
    }

    function clearAlert(selector) {
        $(selector).removeClass("success error").text("");
    }

    function openModal(title, htmlContent) {
        $("#modalTitle").text(title);
        $("#modalBody").html(htmlContent);
        $("#infoModal").removeClass("hidden").attr("aria-hidden", "false");
    }

    function closeModal() {
        $("#infoModal").addClass("hidden").attr("aria-hidden", "true");
    }

    function addActivity(text) {
        const now = new Date();
        const time = now.toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" });
        const activity = JSON.parse(localStorage.getItem("meditrackActivity") || "[]");
        activity.unshift({ time, text });
        localStorage.setItem("meditrackActivity", JSON.stringify(activity.slice(0, 6)));
        renderActivity();
    }


    function showView(viewName) {
        $(".view").removeClass("active");
        $("#view-" + viewName).addClass("active");

        $(".nav-link").removeClass("active");
        $('.nav-link[data-view="' + viewName + '"]').addClass("active");

        const title = $("#view-" + viewName).data("view-name") || viewName;
        $("#currentViewLabel").text(title);

        
        switch (viewName) {
            case "dashboard": renderDashboard(); break;
            case "pacientes": renderPatients(); break;
            case "expediente": renderRecord(); break;
            case "citas": renderAppointments(); break;
            case "personal": renderDoctors(); break;
            case "administracion": renderUsers(); break;
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    $(".nav-link").on("click", function () {
        showView($(this).data("view"));
    });

    $(document).on("click", "[data-view-target]", function () {
        showView($(this).data("view-target"));
    });

    $("#loginEmail").on("input", function () {
        const value = $(this).val().trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        $("#loginEmailMessage").text(value && !valid ? "Ingrese un correo con formato válido." : "");
    });

    $("#loginRole").on("change", function () {
        const role = $(this).val();
        $("#loginAlert").removeClass("success error").text("Rol seleccionado: " + role + ".");
    });

    $("#loginForm").on("submit", function (event) {
        event.preventDefault();
        clearAlert("#loginAlert");

        const email = $("#loginEmail").val().trim();
        const password = $("#loginPassword").val();
        const role = $("#loginRole").val();
        let errors = 0;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $("#loginEmailMessage").text("Correo inválido.");
            errors++;
        }

        if (password.length < 6) {
            $("#loginPasswordMessage").text("La contraseña debe tener al menos 6 caracteres.");
            errors++;
        } else {
            $("#loginPasswordMessage").text("");
        }

        if (errors > 0) {
            showAlert("#loginAlert", "Corrija los campos señalados antes de continuar.", "error");
            return;
        }

        const roleLabel = role === "recepcion" ? "Recepción" : role === "medico" ? "Médico" : "Administrador";
        $("#userChip").text(roleLabel + " · Demo");
        showAlert("#loginAlert", "Acceso validado. Cargando dashboard...", "success");
        addActivity("Inicio de sesión como " + roleLabel);

        setTimeout(function () {
            showView("dashboard");
        }, 350);
    });

 
    $(document).on("focus", "input, select", function () {
        $(this).addClass("input-focus");
    });

    $(document).on("blur", "input, select", function () {
        $(this).removeClass("input-focus");
    });

    
    function renderDashboard() {
        const followUp = patients.filter(p => p.estado === "SEGUIMIENTO").length;
        const activeDoctors = doctors.filter(d => d.estado === "DISPONIBLE").length;

        $("#kpiPatients").text(patients.length);
        $("#kpiAppointments").text(appointments.length);
        $("#kpiActiveDoctors").text(activeDoctors);
        $("#kpiFollowUp").text(followUp);

        const $container = $("#dashboardAppointments").empty();
        appointments.slice(0, 5).forEach(function (appointment) {
            $container.append(`
                <div class="list-item">
                    <strong>${appointment.hora}</strong>
                    <div><strong>${appointment.paciente}</strong><br><small>${appointment.especialidad}</small></div>
                    <span class="status ${statusClass(appointment.estado)}">${appointment.estado}</span>
                </div>
            `);
        });
        renderActivity();
    }

    function renderActivity() {
        let activity = JSON.parse(localStorage.getItem("meditrackActivity") || "[]");
        if (activity.length === 0) {
            activity = [
                { time: "09:12", text: "Expediente MED-2026-0001 actualizado" },
                { time: "08:56", text: "Nueva cita registrada para Ana González" },
                { time: "08:41", text: "Paciente Carlos Méndez ingresó a recepción" }
            ];
        }

        const $feed = $("#activityFeed").empty();
        $.each(activity, function (_, item) {
            $feed.append(`<div class="timeline-item"><span class="timeline-time">${item.time}</span><span>${item.text}</span></div>`);
        });
    }

    
    function calculateAge(birthDate) {
        const birth = new Date(birthDate + "T00:00:00");
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const month = now.getMonth() - birth.getMonth();
        if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) age--;
        return Math.max(0, age);
    }

    function renderPatients() {
        const query = normalize($("#patientSearch").val());
        const status = $("#patientStatusFilter").val() || "todos";

        const filtered = patients.filter(function (patient) {
            const searchable = normalize(`${patient.nombre} ${patient.identificacion} ${patient.expediente}`);
            const matchesText = searchable.includes(query);
            const matchesStatus = status === "todos" || patient.estado === status;
            return matchesText && matchesStatus;
        });

        const $body = $("#patientsTableBody").empty();
        filtered.forEach(function (patient) {
            $body.append(`
                <tr data-patient-id="${patient.id}">
                    <td><strong>${patient.expediente}</strong></td>
                    <td>${patient.nombre}</td>
                    <td>${patient.edad} años</td>
                    <td>${patient.ultima}</td>
                    <td><span class="status ${statusClass(patient.estado)}">${patient.estado}</span></td>
                    <td><button class="btn btn-outline btn-small view-patient" type="button" data-id="${patient.id}">VER</button></td>
                </tr>
            `);
        });

        $("#patientResultCount").text(filtered.length + (filtered.length === 1 ? " resultado" : " resultados"));
    }

    $("#patientSearch").on("input", renderPatients);
    $("#patientStatusFilter").on("change", renderPatients);

    $(document).on("click", ".view-patient", function () {
        selectedPatientId = Number($(this).data("id"));
        localStorage.setItem("meditrackSelectedPatient", selectedPatientId);
        showView("expediente");
    });

    $(document).on("click", '[data-action="toggle-patient-form"], [data-action="open-patient-form"]', function () {
        showView("pacientes");
        $("#patientFormPanel").removeClass("hidden");
        $("#patientName").trigger("focus");
    });

    $(document).on("click", '[data-action="close-patient-form"]', function () {
        $("#patientFormPanel").addClass("hidden");
        clearAlert("#patientFormAlert");
    });

    $("#patientForm").on("submit", function (event) {
        event.preventDefault();
        clearAlert("#patientFormAlert");

        const nombre = $("#patientName").val().trim();
        const apellido = $("#patientLastName").val().trim();
        const identificacion = $("#patientId").val().trim();
        const birth = $("#patientBirth").val();
        const blood = $("#patientBlood").val();
        const status = $("#patientStatus").val();
        const phone = $("#patientPhone").val().trim();
        const email = $("#patientEmail").val().trim();

        if (!nombre || !apellido || !identificacion || !birth || !blood) {
            showAlert("#patientFormAlert", "Complete nombre, apellido, identificación, fecha y tipo de sangre.", "error");
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlert("#patientFormAlert", "El correo electrónico no tiene un formato válido.", "error");
            return;
        }

        const nextId = patients.length ? Math.max(...patients.map(p => p.id)) + 1 : 1;
        const nextExp = "MED-2026-" + String(nextId).padStart(4, "0");

        const newPatient = {
            id: nextId,
            expediente: nextExp,
            nombre: `${nombre} ${apellido}`,
            edad: calculateAge(birth),
            identificacion,
            sangre: blood,
            telefono: phone || "No registrado",
            correo: email || "No registrado",
            ultima: "Sin consulta",
            estado: status,
            seguimiento: ["Registro inicial · Paciente creado"],
            ultimaConsulta: "Aún no registra consultas."
        };

        patients.push(newPatient);
        saveState();
        renderPatients();
        renderDashboard();
        fillAppointmentPatients();
        showAlert("#patientFormAlert", `Paciente ${newPatient.nombre} registrado correctamente.`, "success");
        addActivity(`Paciente ${newPatient.nombre} registrado`);
        this.reset();

        setTimeout(function () {
            $("#patientFormPanel").addClass("hidden");
        }, 700);
    });

    
    function renderRecord() {
        const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
        if (!patient) return;
        selectedPatientId = patient.id;

        $("#recordTitle").text(patient.nombre);
        $("#recordSubtitle").text(patient.expediente + " · " + patient.estado);
        $("#recordDetails").html(`
            <dt>Expediente</dt><dd>${patient.expediente}</dd>
            <dt>Identificación</dt><dd>${patient.identificacion}</dd>
            <dt>Edad</dt><dd>${patient.edad} años</dd>
            <dt>Tipo de sangre</dt><dd>${patient.sangre}</dd>
            <dt>Teléfono</dt><dd>${patient.telefono}</dd>
            <dt>Correo</dt><dd>${patient.correo}</dd>
        `);

        const $timeline = $("#recordTimeline").empty();
        patient.seguimiento.forEach(function (item, index) {
            $timeline.append(`<div class="timeline-item"><span class="timeline-time">${index + 1}</span><span>${item}</span></div>`);
        });
        $("#recordLastConsultation").text(patient.ultimaConsulta);
    }

    
    function fillAppointmentPatients() {
        const $select = $("#appointmentPatient").empty();
        patients.forEach(function (patient) {
            $select.append(`<option value="${patient.id}">${patient.nombre}</option>`);
        });
    }

    function fillSpecialties() {
        const specialties = [...new Set(doctors.map(d => d.especialidad))].sort();
        const $select = $("#appointmentSpecialty").find("option:not(:first)").remove().end();
        specialties.forEach(s => $select.append(`<option value="${s}">${s}</option>`));
    }

    $("#appointmentSpecialty").on("change", function () {
        const specialty = $(this).val();
        const $doctor = $("#appointmentDoctor").empty();
        const matches = doctors.filter(d => d.especialidad === specialty);

        if (!specialty) {
            $doctor.append('<option value="">Seleccione especialidad primero</option>');
            return;
        }

        if (matches.length === 0) {
            $doctor.append('<option value="">Sin médicos disponibles</option>');
        } else {
            matches.forEach(d => $doctor.append(`<option value="${d.id}">${d.nombre}</option>`));
        }
    });

    function renderAppointments() {
        const $list = $("#appointmentList").empty();
        const ordered = [...appointments].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

        ordered.forEach(function (appointment) {
            const compactClass = agendaCompact ? " compact" : "";
            const extra = agendaCompact ? "" : `<div><strong>${appointment.paciente}</strong><br><small>${appointment.especialidad} · ${appointment.medico}</small></div><span class="status ${statusClass(appointment.estado)}">${appointment.estado}</span>`;
            $list.append(`
                <div class="appointment-item${compactClass}">
                    <strong>${appointment.hora}</strong>
                    ${extra}
                    <button class="btn btn-outline btn-small appointment-info" type="button" data-id="${appointment.id}">${agendaCompact ? appointment.paciente : "..."}</button>
                </div>
            `);
        });
        $("#appointmentCount").text(appointments.length + (appointments.length === 1 ? " cita" : " citas"));
        $("#agendaTitle").text(agendaCompact ? "Vista compacta" : "Agenda de citas");
    }

    $("#toggleAgendaMode").on("click", function () {
        agendaCompact = !agendaCompact;
        $(this).text(agendaCompact ? "Vista completa" : "Cambiar vista");
        renderAppointments();
    });

    $(document).on("click", ".appointment-info", function () {
        const appointment = appointments.find(a => a.id === Number($(this).data("id")));
        if (!appointment) return;
        openModal("Detalle de cita", `
            <p><strong>Paciente:</strong> ${appointment.paciente}</p>
            <p><strong>Especialidad:</strong> ${appointment.especialidad}</p>
            <p><strong>Médico:</strong> ${appointment.medico}</p>
            <p><strong>Fecha y hora:</strong> ${appointment.fecha} · ${appointment.hora}</p>
            <p><strong>Estado:</strong> ${appointment.estado}</p>
        `);
    });

    $("#appointmentForm").on("submit", function (event) {
        event.preventDefault();
        clearAlert("#appointmentAlert");

        const patientId = Number($("#appointmentPatient").val());
        const specialty = $("#appointmentSpecialty").val();
        const doctorId = Number($("#appointmentDoctor").val());
        const date = $("#appointmentDate").val();
        const time = $("#appointmentTime").val();

        if (!patientId || !specialty || !doctorId || !date || !time) {
            showAlert("#appointmentAlert", "Complete paciente, especialidad, médico, fecha y hora.", "error");
            return;
        }

        const patient = patients.find(p => p.id === patientId);
        const doctor = doctors.find(d => d.id === doctorId);
        const duplicate = appointments.some(a => a.medico === doctor.nombre && a.fecha === date && a.hora === time);

        if (duplicate) {
            showAlert("#appointmentAlert", "Ese médico ya tiene una cita en la fecha y hora seleccionadas.", "error");
            return;
        }

        const nextId = appointments.length ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
        appointments.push({
            id: nextId,
            pacienteId: patient.id,
            paciente: patient.nombre,
            especialidad: specialty,
            medico: doctor.nombre,
            fecha: date,
            hora: time,
            estado: "PROGRAMADA"
        });

        saveState();
        renderAppointments();
        renderDashboard();
        showAlert("#appointmentAlert", "Cita programada correctamente.", "success");
        addActivity(`Nueva cita programada para ${patient.nombre}`);
        this.reset();
        $("#appointmentDoctor").html('<option value="">Seleccione especialidad primero</option>');
    });

 
    function renderDoctors() {
        const query = normalize($("#doctorSearch").val());
        const status = $("#doctorStatusFilter").val() || "todos";

        const filtered = doctors.filter(function (doctor) {
            const matchesQuery = normalize(`${doctor.nombre} ${doctor.especialidad}`).includes(query);
            const matchesStatus = status === "todos" || doctor.estado === status;
            return matchesQuery && matchesStatus;
        });

        const $body = $("#doctorsTableBody").empty();
        filtered.forEach(function (doctor) {
            $body.append(`
                <tr>
                    <td><strong>${doctor.nombre}</strong></td>
                    <td>${doctor.especialidad}</td>
                    <td>${doctor.registro}</td>
                    <td>${doctor.turno}</td>
                    <td><span class="status ${statusClass(doctor.estado)}">${doctor.estado}</span></td>
                    <td><button class="btn btn-outline btn-small doctor-info" type="button" data-id="${doctor.id}">VER</button></td>
                </tr>
            `);
        });
        $("#doctorResultCount").text(filtered.length + (filtered.length === 1 ? " resultado" : " resultados"));
    }

    $("#doctorSearch").on("input", renderDoctors);
    $("#doctorStatusFilter").on("change", renderDoctors);

    $(document).on("click", ".doctor-info", function () {
        const doctor = doctors.find(d => d.id === Number($(this).data("id")));
        if (!doctor) return;
        openModal("Ficha del personal médico", `
            <p><strong>${doctor.nombre}</strong></p>
            <p>Especialidad: ${doctor.especialidad}</p>
            <p>Registro: ${doctor.registro}</p>
            <p>Turno: ${doctor.turno}</p>
            <p>Estado: ${doctor.estado}</p>
        `);
    });

    $("#doctorForm").on("submit", function (event) {
        event.preventDefault();
        clearAlert("#doctorFormAlert");

        const name = $("#doctorName").val().trim();
        const specialty = $("#doctorSpecialty").val().trim();
        const license = $("#doctorLicense").val().trim();
        const shift = $("#doctorShift").val().trim();
        const status = $("#doctorStatus").val();

        if (!name || !specialty || !license || !shift) {
            showAlert("#doctorFormAlert", "Complete todos los campos del personal médico.", "error");
            return;
        }

        if (doctors.some(d => normalize(d.registro) === normalize(license))) {
            showAlert("#doctorFormAlert", "El número de registro ya existe.", "error");
            return;
        }

        const nextId = doctors.length ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
        doctors.push({ id: nextId, nombre: name, especialidad: specialty, registro: license, turno: shift, estado: status });
        saveState();
        renderDoctors();
        fillSpecialties();
        renderDashboard();
        showAlert("#doctorFormAlert", "Personal médico registrado correctamente.", "success");
        addActivity(`Personal médico ${name} registrado`);
        this.reset();
    });

  
    function renderUsers() {
        const $body = $("#usersTableBody").empty();
        users.forEach(function (user) {
            $body.append(`
                <tr>
                    <td>${user.nombre}</td>
                    <td>${user.rol}</td>
                    <td>${user.area}</td>
                    <td><span class="status ${statusClass(user.estado)}">${user.estado}</span></td>
                    <td><button class="btn btn-outline btn-small edit-user" data-id="${user.id}" type="button">EDITAR</button></td>
                </tr>
            `);
        });
        $("#summaryUsers").text(users.length);
        $("#summarySpecialties").text(new Set(doctors.map(d => d.especialidad)).size);
    }

    $(".admin-tab").on("click", function () {
        const tab = $(this).data("admin-tab");
        $(".admin-tab").removeClass("active");
        $(this).addClass("active");
        $(".admin-content").removeClass("active");
        $("#admin-" + tab).addClass("active");
    });

    $("#addDemoUser").on("click", function () {
        const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push({ id: nextId, nombre: "Usuario Demo " + nextId, rol: "Recepción", area: "Admisión", estado: "ACTIVO" });
        saveState();
        renderUsers();
        addActivity("Nuevo usuario demostrativo agregado");
        openModal("Usuario creado", "<p>Se agregó un nuevo usuario demostrativo mediante un evento <strong>onClick</strong>.</p>");
    });

    $(document).on("click", ".edit-user", function () {
        const user = users.find(u => u.id === Number($(this).data("id")));
        if (!user) return;
        user.estado = user.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        saveState();
        renderUsers();
        openModal("Estado actualizado", `<p>${user.nombre} ahora se encuentra <strong>${user.estado}</strong>.</p>`);
    });

   
    $(window).on("scroll", function () {
        if ($(window).scrollTop() > 80) {
            $("#appHeader").addClass("scrolled");
        } else {
            $("#appHeader").removeClass("scrolled");
        }
    });

    $("#backTop").on("click", function () {
        $("html, body").animate({ scrollTop: 0 }, 350);
    });

    $(document).on("click", '[data-action="close-modal"]', closeModal);
    $("#infoModal").on("click", function (event) {
        if (event.target === this) closeModal();
    });
    $(document).on("keydown", function (event) {
        if (event.key === "Escape") closeModal();
    });

    fillAppointmentPatients();
    fillSpecialties();
    renderPatients();
    renderDoctors();
    renderAppointments();
    renderUsers();
    renderDashboard();
    renderRecord();

    
    $(".view").removeClass("active");
    $("#view-login").addClass("active");
    $("#currentViewLabel").text("Inicio de sesión");
});
