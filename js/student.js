
// ——————————————————————————————————————————————————————————————
// this Guard: ensure we’re logged in as a student
;(async function guardStudent() {
  console.log('[student.js] guardStudent() running, token =', localStorage.getItem('token'));
  const token = localStorage.getItem('token');
  if (!token) return window.location = 'index.html';

  try {
    const user = await request('/users/me', { auth: true });
    console.log('[student.js] /users/me →', user);
    if (user.role !== 'student') throw new Error('Not a student');

    // insert greeting
    const greetEl = document.getElementById('greeting');
    if (greetEl) {
      greetEl.textContent = `Welcome, ${user.name}!`;
    }
  } catch (err) {
    console.error('[student.js] guardStudent failed:', err);
    return window.location = 'index.html';
  }
})();

// 2) Logout
document.getElementById('logout-btn').onclick = () => {
  localStorage.removeItem('token');
  window.location = 'index.html';
};

// state for notifications toggle
let _notifData = [];
let _showingAll = false;

// 3) Load and display notifications (latest-only with toggle)
async function loadNotifications() {
  _notifData = await request('/notifications', { auth: true });
  _showingAll = false;
  renderNotifications();
}

function renderNotifications() {
  const list = document.getElementById('notification-list');
  const btn  = document.getElementById('toggle-notifs');
  list.innerHTML = '';

  if (!_notifData.length) {
    const li = document.createElement('li');
    li.textContent = 'No notifications';
    list.appendChild(li);
  } else {
    const toShow = _showingAll ? _notifData : _notifData.slice(0, 1);
    toShow.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n.message;
      li.classList.add(n.read ? 'read' : 'unread');
      li.onclick = async () => {
        if (!n.read) {
          await request(`/notifications/${n.id}/read`, { method: 'PUT' });
          n.read = true;
          li.classList.replace('unread','read');
        }
      };
      list.appendChild(li);
    });
  }

  if (_notifData.length <= 1) {
    btn.style.display = 'none';
  } else {
    btn.style.display = 'inline';
    btn.textContent = _showingAll ? 'Show Less' : 'View All';
  }
}

document.getElementById('toggle-notifs').onclick = () => {
  _showingAll = !_showingAll;
  renderNotifications();
};

// 4) Available rooms as cards, with preference prompt
async function loadAvailableRooms() {
  console.log('▶ loadAvailableRooms()');

  // first, check if you already have an assigned room
  let hasRoom = false;
  try {
    const info = await request('/applications/assigned', { auth: true });
    console.log('   /applications/assigned →', info);
    hasRoom = !!info.room_number;
  } catch (err) {
    console.log('   no assigned room yet (expected on new user)');
    hasRoom = false;
  }

  // now fetch all available rooms
  const rooms = await request('/rooms/available', { auth: true });
  console.log('   /rooms/available →', rooms);

  // render
  const container = document.getElementById('rooms-container');
  container.innerHTML = '';

  rooms.forEach(r => {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <img src="${r.photo}" alt="Room ${r.room_number}">
      <div class="details">
        <div><strong>${r.hostel_name}</strong></div>
        <div class="hostel-desc">${r.hostel_description}</div>
        <div>Room ${r.room_number}</div>
        <div>Capacity: ${r.capacity}</div>
        <div>Occupancy: ${r.occupancy}</div>
      </div>
      ${hasRoom 
        ? `<button class="apply-btn" disabled>Cannot apply</button>`
        : `<button class="apply-btn" data-id="${r.id}">Apply</button>`
      }
    `;
    container.appendChild(card);
  });

  // wire up the Apply buttons (only if no room)
  if (!hasRoom) {
    container.querySelectorAll('.apply-btn').forEach(btn => {
      btn.onclick = async () => {
        const pref = prompt(
          'Any preference for this room? (e.g. Near the window, Lower floor…)'
        );
        if (pref === null) return;

        try {
          await request('/applications/apply', {
            method: 'POST',
            body: { room_id: +btn.dataset.id, preference: pref.trim() }
          });
          alert('Application submitted – check your “Notifications”');
          await loadNotifications();
          await loadAvailableRooms();  // now disable apply
          await loadAssignedRoom();
        } catch (err) {
          alert(err.message);
        }
      };
    });
  }
}

// 5) Assigned-room panel
async function loadAssignedRoom() {
  const el = document.getElementById('assigned-info');
  try {
    const info = await request('/applications/assigned', { auth: true });
    if (!info.room_number) {
      el.textContent = 'No room assigned yet.';
    } else {
      el.innerHTML = `<strong>${info.hostel_name}</strong>, Room ${info.room_number}`;
    }
  } catch {
    el.textContent = 'No room assigned yet.';
  }
}

// 6) kick everything off
document.addEventListener('DOMContentLoaded', () => {
  loadNotifications();
  loadAvailableRooms();
  loadAssignedRoom();
});
