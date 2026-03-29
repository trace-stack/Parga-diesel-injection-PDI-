/* =========================================================
   Parga Diesel Injection (PDI) – JavaScript
   ========================================================= */

(function () {
  'use strict';

  // -------------------------------------------------------
  // Engine manufacturer filter
  // -------------------------------------------------------
  var filterBtns  = document.querySelectorAll('.filter-btn');
  var engineGroups = document.querySelectorAll('.engine-group');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;

      // Update active button state
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show / hide engine groups
      engineGroups.forEach(function (group) {
        var category = group.dataset.category;
        if (filter === 'all' || category === filter) {
          group.classList.remove('hidden');
        } else {
          group.classList.add('hidden');
        }
      });
    });
  });

})();
