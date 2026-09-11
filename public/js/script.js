

$(function () {
    "use strict";

   
    let patients = [], doctors = [], appointments = [], users = [];
    let selectedPatientId = null, currentUser = null, activityLog = [];
    let agendaCompact = false;
    function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function htmlSafe(value) {
        if (typeof value === 'string') return escapeHtml(value);
        if (Array.isArray(value)) return value.map(htmlSafe);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,htmlSafe(v)]));
        return value;
    }
    function raw(value) { return $('<textarea>').html(value ?? '').text(); }
    async function api(method, url, data) {
        try { return (await $.ajax({url, method, contentType:'application/json', data:data === undefined ? undefined : JSON.stringify(data)})).data; }
        catch (error) { if (error.status === 401) setUser(null); throw new Error(error.responseJSON?.message || 'No se pudo conectar con el servidor.'); }
    }
    function setUser(user) {
        currentUser = user;
        const authenticated = Boolean(user);
        const administrator = user?.rol === 'Administrador';
        $('body').toggleClass('unauthenticated', !authenticated);
        $('#mainNav').prop('hidden', !authenticated).attr('aria-hidden', String(!authenticated));
        $('.view:not(#view-login), [data-view-target]').prop('hidden', !authenticated);
        $('#view-administracion, [data-view="administracion"], [data-view-target="administracion"]').prop('hidden', !administrator);
        $('#userChip').text(user ? user.nombre + ' · ' + user.rol : 'Invitado');
        $('#logoutButton').toggleClass('hidden', !user);
        $('.nav-link').prop('disabled', !user);
        $('[data-view="administracion"]').toggleClass('hidden', user?.rol !== 'Administrador');
        if (!user) {
            patients = []; doctors = []; appointments = []; users = []; activityLog = []; selectedPatientId = null;
            closeModal();
            $('form').each(function(){ this.reset(); $(this).removeData('editId'); });
            $('.form-alert').empty();
            renderPatients(); renderDoctors(); renderAppointments(); renderUsers(); renderDashboard(); renderRecord();
            fillAppointmentPatients(); fillSpecialties();
            showView('login');
        }
    }
    async function refreshData() {
        // GET colecciones
        const result = await Promise.all([api('GET','/api/patients'),api('GET','/api/doctors'),api('GET','/api/appointments'),currentUser?.rol === 'Administrador' ? api('GET','/api/users') : Promise.resolve([])]);
        patients = result[0].map(p => htmlSafe({...p, firstName:p.nombre, nombre:p.nombre+' '+p.apellido, edad:calculateAge(p.fecha_nacimiento), ultima:p.seguimientos[0]?.fecha || 'Sin consulta', seguimiento:p.seguimientos.map(s=>s.fecha+' · '+s.descripcion+' · '+s.estado), ultimaConsulta:p.seguimientos[0]?.descripcion || 'Aún no registra consultas.'}));
        doctors = htmlSafe(result[1]); appointments = htmlSafe(result[2]); users = htmlSafe(result[3]);
        renderPatients(); renderDoctors(); renderAppointments(); renderUsers(); renderDashboard(); renderRecord(); fillAppointmentPatients(); fillSpecialties();
    }
    async function saveForm(form, route, alert) {
        const data = Object.fromEntries(new FormData(form));
        const id = $(form).data('editId');
        $(form).find(':submit').prop('disabled', true);
        try {
            // POST / PUT registro
            await api(id ? 'PUT' : 'POST', route + (id ? '/' + id : ''), data);
            form.reset(); $(form).removeData('editId'); $(form).find('.cancel-edit').remove();
            await refreshData();
            showAlert(alert, 'Registro guardado correctamente.', 'success');
            addActivity('Registro guardado en ' + route.split('/').pop());
        } catch(error) { showAlert(alert,error.message,'error'); }
        finally { $(form).find(':submit').prop('disabled', false); }
    }
    function editForm(form, row) {
        form.reset(); $(form).data('editId', row.id);
        $(form).find('.cancel-edit').remove();
        $(form).append('<button class="btn btn-outline cancel-edit" type="button">Cancelar edición</button>');
        for (const input of form.elements) if (input.name && row[input.name] !== undefined) $(input).val(row[input.name]);
        $(form).find('input,select').first().trigger('focus');
    }

    function normalize(text) {
        return raw(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
        activityLog.unshift({time:new Date().toLocaleTimeString('es-PA',{hour:'2-digit',minute:'2-digit'}),text:escapeHtml(text)});
        activityLog = activityLog.slice(0,6); renderActivity();
    }

    function showView(viewName) {
        if (!currentUser && viewName !== 'login') viewName = 'login';
        if (viewName === 'administracion' && currentUser?.rol !== 'Administrador') return;
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

    $('#loginForm').on('submit', async function(event) {
        event.preventDefault(); clearAlert('#loginAlert');
        $(this).find(':submit').prop('disabled',true);
        try {
            const user = await api('POST','/api/auth/login',{email:$('#loginEmail').val(),password:$('#loginPassword').val()});
            setUser(user); await refreshData(); this.reset(); showView('dashboard');
        } catch(error) { showAlert('#loginAlert',error.message,'error'); }
        finally { $(this).find(':submit').prop('disabled',false); }
    });
    $('#logoutButton').on('click', async function() {
        try { await api('POST','/api/auth/logout'); setUser(null); }
        catch(error) { openModal('Error',escapeHtml(error.message)); }
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
        const activity = activityLog;

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
                    <td><button class="btn btn-outline btn-small view-patient" type="button" data-id="${patient.id}">VER</button> ${actions("patients",patient.id)}</td>
                </tr>
            `);
        });

        $("#patientResultCount").text(filtered.length + (filtered.length === 1 ? " resultado" : " resultados"));
    }

    $("#patientSearch").on("input", renderPatients);
    $("#patientStatusFilter").on("change", renderPatients);

    $(document).on("click", ".view-patient", function () {
        selectedPatientId = Number($(this).data("id"));
        
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

    $('#patientForm').on('submit', function(event) { event.preventDefault(); saveForm(this,'/api/patients','#patientFormAlert'); });

    function renderRecord() {
        const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
        if (!patient) { $('#recordTitle').text('Seleccione un paciente'); $('#recordSubtitle,#recordDetails,#recordTimeline,#recordLastConsultation').empty(); return; }
        selectedPatientId = patient.id;

        $("#recordTitle").text(raw(patient.nombre));
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
        $("#recordLastConsultation").text(raw(patient.ultimaConsulta));
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
        const matches = doctors.filter(d => raw(d.especialidad) === specialty);

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
                    <strong>${appointment.fecha}<br>${appointment.hora}</strong>
                    ${extra}
                    <button class="btn btn-outline btn-small appointment-info" type="button" data-id="${appointment.id}">${agendaCompact ? appointment.paciente : "..."}</button>
                    ${actions("appointments",appointment.id)}
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

    $('#appointmentForm').on('submit', function(event) {
        event.preventDefault();
        const id = $(this).data('editId');
        const duplicate = appointments.some(a => a.id !== id && a.doctor_id === Number($('#appointmentDoctor').val()) && a.fecha === $('#appointmentDate').val() && a.hora === $('#appointmentTime').val() && a.estado !== 'CANCELADA');
        if (duplicate && $('#appointmentStatus').val() !== 'CANCELADA') return showAlert('#appointmentAlert','Ese médico ya tiene una cita en esa fecha y hora.','error');
        saveForm(this,'/api/appointments','#appointmentAlert');
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
                    <td><button class="btn btn-outline btn-small doctor-info" type="button" data-id="${doctor.id}">VER</button> ${actions("doctors",doctor.id)}</td>
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

    $('#doctorForm').on('submit', function(event) { event.preventDefault(); saveForm(this,'/api/doctors','#doctorFormAlert'); });

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

    $('#addDemoUser').on('click', function() {
        openModal('Nuevo usuario', '<form id="userForm" action="/api/users" method="POST"><div class="form-group"><label>Nombre<input name="nombre" required maxlength="120"></label></div><div class="form-group"><label>Correo<input name="email" type="email" required></label></div><div class="form-group"><label>Contraseña<input name="password" type="password" required minlength="8" autocomplete="new-password"></label></div><div class="form-group"><label>Área<input name="area" required></label></div><div class="form-group"><label>Rol<select name="rol"><option>Recepción</option><option>Médico</option><option>Administrador</option></select></label></div><div id="userAlert" class="form-alert"></div><button class="btn btn-primary" type="submit">Guardar usuario</button></form>');
    });
    $(document).on('submit','#userForm',function(event){ event.preventDefault(); saveForm(this,'/api/users','#userAlert'); });
    $(document).on('click','.edit-user',async function(){
        const user = users.find(u=>u.id === Number($(this).data('id')));
        try { await api('PUT','/api/users/'+user.id,{estado:user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}); await refreshData(); }
        catch(error) { openModal('Error',escapeHtml(error.message)); }
    });
    $(document).on('click','.edit-record',async function(){
        const route = $(this).data('route'), id = $(this).data('id');
        try {
            const row = await api('GET','/api/'+route+'/'+id);
            if(route === 'patients') { editForm($('#patientForm')[0],row); $('#patientFormPanel').removeClass('hidden'); }
            if(route === 'doctors') editForm($('#doctorForm')[0],row);
            if(route === 'appointments') { $('#appointmentSpecialty').val(row.especialidad).trigger('change'); editForm($('#appointmentForm')[0],row); }
        } catch(error) { openModal('Error',escapeHtml(error.message)); }
    });
    $(document).on('click','.delete-record',async function(){
        if(!window.confirm('¿Eliminar este registro de forma permanente?')) return;
        try {
            // DELETE registro
            await api('DELETE','/api/'+$(this).data('route')+'/'+$(this).data('id'));
            await refreshData();
        } catch(error) { openModal('No se pudo eliminar',escapeHtml(error.message)); }
    });
    $(document).on('click','.cancel-edit',function(){ const form=this.form; form.reset(); $(form).removeData('editId'); $(this).remove(); });
    $('[data-action="open-patient-form"],[data-action="toggle-patient-form"]').on('click',function(){ $('#patientForm')[0].reset(); $('#patientForm').removeData('editId'); });
    function actions(route,id) {
        return '<button type="button" class="btn btn-outline btn-small edit-record" data-route="'+route+'" data-id="'+id+'">EDITAR</button> <button type="button" class="btn btn-outline btn-small delete-record" data-route="'+route+'" data-id="'+id+'">ELIMINAR</button>';
    }

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
    setUser(null);
    api('GET','/api/auth/session').then(async user => { setUser(user); await refreshData(); showView('dashboard'); }).catch(error => { showAlert('#loginAlert',error.message,'error'); });
});
