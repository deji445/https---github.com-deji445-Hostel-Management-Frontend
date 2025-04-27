
let allApps = [];
let currentFilter = 'all';

// ───────────── Assigned-Students Panel ─────────────
function renderAssignedTable() {
  const assigned = allApps.filter(a => a.status === 'accepted');
  const tbody    = document.querySelector('#assigned-table tbody');
  tbody.innerHTML = '';
  assigned.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.student_name}</td>
      <td>${a.room_number}</td>
      <td>${a.hostel_name}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ───────────── Modal Utility Functions ─────────────
function showEditModal(title, fieldsConfig, onSubmit) {
  document.getElementById('modal-title').textContent = title;
  const container = document.getElementById('modal-fields');
  container.innerHTML = '';
  fieldsConfig.forEach(f => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <label for="modal-${f.name}">${f.label}</label>
      <input id="modal-${f.name}" name="${f.name}"
             type="${f.type}" value="${f.value || ''}" required>
    `;
    container.appendChild(wrapper);
  });
  const form = document.getElementById('modal-form');
  form.onsubmit = async e => {
    e.preventDefault();
    const data = {};
    fieldsConfig.forEach(f => {
      data[f.name] = form.elements[f.name].value;
    });
    await onSubmit(data);
    hideEditModal();
  };
  document.getElementById('modal-cancel').onclick = hideEditModal;
  document.getElementById('edit-modal').style.display = 'flex';
}

function hideEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

// ───────────── Admin Guard & Logout ─────────────
;(async function guardAdmin() {
  const token = localStorage.getItem('token');
  if (!token) return window.location = 'index.html';
  try {
    const user = await request('/users/me', { auth: true });
    if (user.role !== 'admin') throw new Error('Not an admin');
  } catch {
    return window.location = 'index.html';
  }
})();

document.getElementById('logout-btn').onclick = () => {
  localStorage.removeItem('token');
  window.location = 'index.html';
};

// ───────────── DOMContentLoaded & Initialization ─────────────
document.addEventListener('DOMContentLoaded', () => {
  loadRooms();
  loadApplications();
  loadHostels();


    // ① Filter bar buttons
    document.querySelectorAll('#apps-filter button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#apps-filter button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.status;
        renderApplications();
      });
    });

  // Create Room form
  document
  .getElementById('room-form')
  .addEventListener('submit', async e => {
    e.preventDefault();

    // build a plain JS object from the named inputs
    const body = {
      hostel_id:   +e.target.hostel_id.value,
      room_number: e.target.room_number.value,
      capacity:    +e.target.capacity.value,
      photo:         e.target.photo.value,        
      description:  e.target.description.value
    };

    try {
      await request('/rooms', { method: 'POST', body });
      document.getElementById('room-msg').textContent = 'Room added!';
      e.target.reset();
      loadRooms();    // this re-draws the table
    } catch (err) {
      document.getElementById('room-msg').textContent = err.message;
    }
  });
  
  // Create Hostel form
  document.getElementById('hostel-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = e.target['hostel-name'].value;
    const description = e.target['hostel-desc'].value;
    try {
      await request('/hostels', {
        method: 'POST',
        body: { name, description }
      });
      e.target.reset();
      loadHostels();
    } catch (err) {
      alert(err.message);
    }
  });
});

// ───────────── Load & Manage Rooms ─────────────
async function loadRooms() {
  // 1) this fetch all rooms
  let rows = await request('/rooms/all', { auth: true });

  // 2) this sort by id ascending
  rows.sort((a, b) => a.id - b.id);

  // 3) this is supposed to renders into table
  const tbody = document.querySelector('#rooms-table tbody');
  tbody.innerHTML = '';

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="ID">${r.id}</td>
      <td data-label="Hostel">${r.hostel_name}</td>
      <td data-label="Number">${r.room_number}</td>
      <td data-label="Capacity">${r.capacity}</td>
      <td data-label="Occupancy">${r.occupancy}</td>
      <td data-label="Status">${r.status}</td>
      <td>
        <button class="edit-room" data-id="${r.id}">Edit</button>
        <button class="del-room"  data-id="${r.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // 2) this is to wire up the Edit buttons
  document.querySelectorAll('.edit-room').forEach(btn => {
    btn.onclick = () => {
      const id  = btn.dataset.id;
      const row = btn.closest('tr');
      showEditModal(
        'Edit Room',
        [
          {
            name:  'room_number',
            label: 'Room Number',
            type:  'text',
            value: row.querySelector('[data-label="Number"]').textContent
          },
          {
            name:  'capacity',
            label: 'Capacity',
            type:  'number',
            value: row.querySelector('[data-label="Capacity"]').textContent
          }
        ],
        async data => {
          await request(`/rooms/${id}`, {
            method: 'PUT',
            body: {
              room_number: data.room_number,
              capacity:    +data.capacity
            }
          });
          loadRooms();
        }
      );
    };
  });

  // 3)this is to wire up the Delete buttons
  document.querySelectorAll('.del-room').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Delete this room?')) return;
      await request(`/rooms/${btn.dataset.id}`, { method: 'DELETE' });
      loadRooms();
    };
  });
}


// this Fetchs + stash all apps
async function loadApplications() {
  allApps = await request('/applications', { auth: true });
  renderApplications();
}

// this Render function: fills the one table
function renderApplications() {
  const tbody = document.querySelector('#apps-table tbody');
  tbody.innerHTML = '';

  allApps
  .filter(a => currentFilter === 'all' || a.status === currentFilter)
  .forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.student_name}</td>
      <td>${a.room_number}</td>
      <td>${a.hostel_name}</td>
      <td><span class="status-badge ${a.status}">${a.status}</span></td>
      <td>
        ${a.status === 'pending'
          ? `<button data-id="${a.id}" data-status="accepted">✔️</button>
             <button data-id="${a.id}" data-status="rejected">✖️</button>
             <button class="del-app" data-id="${a.id}">🗑️</button>`
          : `<button class="del-app" data-id="${a.id}">🗑️</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });

    // Wire up just‐rendered buttons
  // Accept / reject
  tbody.querySelectorAll('button[data-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await request(`/applications/status/${btn.dataset.id}`, {
        method: 'PUT',
        body: { status: btn.dataset.status }
      });
      loadApplications();
      loadRooms();
    });
  });

 // Delete
 tbody.querySelectorAll('.del-app').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!confirm('Remove this application?')) return;
    await request(`/applications/${btn.dataset.id}`, { method: 'DELETE' });
    loadApplications();
  });
});

  // update allotted‐students
  renderAssignedTable();
}

// ───────────── Load & Manage Hostels ─────────────
async function loadHostels() {
  const hostels = await request('/hostels', { auth: true });
  const tbody = document.querySelector('#hostels-table tbody');
  tbody.innerHTML = '';
  hostels.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${h.id}</td>
      <td>${h.name}</td>
      <td>${h.description || ''}</td>
      <td>
        <button class="edit-hostel" data-id="${h.id}">Edit</button>
        <button class="del-hostel"  data-id="${h.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Edit hostels
  document.querySelectorAll('.edit-hostel').forEach(btn => {
    btn.onclick = () => {
      const id  = btn.dataset.id;
      const row = btn.closest('tr');
      showEditModal(
        'Edit Hostel',
        [
          {
            name: 'name',
            label: 'Hostel Name',
            type: 'text',
            value: row.children[1].textContent
          },
          {
            name: 'description',
            label: 'Description',
            type: 'text',
            value: row.children[2].textContent
          }
        ],
        async data => {
          await request(`/hostels/${id}`, {
            method: 'PUT',
            body: data
          });
          loadHostels();
        }
      );
    };
  });

  // Delete hostels
  document.querySelectorAll('.del-hostel').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Delete this hostel?')) return;
      await request(`/hostels/${btn.dataset.id}`, { method: 'DELETE' });
      loadHostels();
    };
  });
}
