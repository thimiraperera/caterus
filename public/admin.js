/* ============================================================
   Caterus Admin — Client-side JavaScript
   ============================================================ */
(function () {
  'use strict';

  // Sidebar toggle (mobile)
  const sidebar = document.getElementById('admin-sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const close = document.getElementById('sidebar-close');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.add('open'));
  }
  if (close && sidebar) {
    close.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // Auto-hide flash messages after 5 seconds
  document.querySelectorAll('.flash').forEach(flash => {
    setTimeout(() => {
      flash.style.opacity = '0';
      flash.style.transform = 'translateY(-8px)';
      setTimeout(() => flash.remove(), 300);
    }, 5000);
  });

  // Confirm delete actions
  document.querySelectorAll('[data-confirm]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!confirm(el.dataset.confirm || 'Are you sure?')) {
        e.preventDefault();
      }
    });
  });

  // Toggle menu item rows
  document.querySelectorAll('.add-menu-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.closest('.form-section').querySelector('.menu-items-list');
      if (!list) return;
      const row = document.createElement('div');
      row.className = 'form-row';
      row.style.marginBottom = '8px';
      row.innerHTML = `
        <input type="text" name="item_names" class="form-control" placeholder="Item name">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.form-row').remove()">✕</button>
      `;
      list.appendChild(row);
    });
  });

  // Toggle inclusion rows
  document.querySelectorAll('.add-inclusion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.closest('.form-section').querySelector('.inclusions-list');
      if (!list) return;
      const row = document.createElement('div');
      row.className = 'form-row';
      row.style.marginBottom = '8px';
      row.innerHTML = `
        <input type="text" name="inclusion_titles" class="form-control" placeholder="Title">
        <input type="text" name="inclusion_descriptions" class="form-control" placeholder="Description">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.form-row').remove()">✕</button>
      `;
      list.appendChild(row);
    });
  });

  // File upload preview
  document.querySelectorAll('.upload-zone').forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    zone.addEventListener('click', () => input && input.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (input) { input.files = e.dataTransfer.files; input.dispatchEvent(new Event('change')); }
    });
  });
})();
