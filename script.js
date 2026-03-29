/* =========================================================
   Parga Diesel Injection (PDI) – JavaScript
   ========================================================= */

(function () {
  'use strict';

  // -------------------------------------------------------
  // Tab switching
  // -------------------------------------------------------
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = btn.dataset.tab;

      tabBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(function (p) { p.classList.remove('active'); });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      var panel = document.getElementById('panel-' + target);
      if (panel) { panel.classList.add('active'); }
    });
  });

  // -------------------------------------------------------
  // File / photo upload helpers
  // -------------------------------------------------------
  function setupFileUpload(dropZoneId, inputId, previewContainerId) {
    var dropZone      = document.getElementById(dropZoneId);
    var fileInput     = document.getElementById(inputId);
    var previewCont   = document.getElementById(previewContainerId);
    var selectedFiles = [];

    if (!dropZone || !fileInput || !previewCont) { return; }

    // Drag & drop events
    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function () {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleFiles(Array.from(e.dataTransfer.files));
    });

    fileInput.addEventListener('change', function () {
      handleFiles(Array.from(fileInput.files));
      // Reset the input so the same file can be re-added after removal
      fileInput.value = '';
    });

    function handleFiles(files) {
      files.forEach(function (file) {
        if (!file.type.startsWith('image/')) { return; }
        if (file.size > 5 * 1024 * 1024) {
          alert(file.name + ' exceeds the 5 MB limit and was not added.');
          return;
        }
        selectedFiles.push(file);
        addPreview(file, selectedFiles.length - 1);
      });
    }

    function addPreview(file, index) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var item = document.createElement('div');
        item.className = 'preview-item';
        item.dataset.index = index;

        var img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;

        var removeBtn = document.createElement('button');
        removeBtn.className = 'preview-remove';
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.setAttribute('aria-label', 'Remove ' + file.name);
        removeBtn.addEventListener('click', function () {
          selectedFiles[index] = null;
          item.remove();
        });

        item.appendChild(img);
        item.appendChild(removeBtn);
        previewCont.appendChild(item);
      };
      reader.readAsDataURL(file);
    }

    // Expose selected files getter on the drop zone element for form submission
    dropZone._getFiles = function () {
      return selectedFiles.filter(Boolean);
    };
  }

  setupFileUpload('dropZone',       'install-photos', 'photoPreviews');
  setupFileUpload('reviewDropZone', 'review-photos',  'reviewPhotoPreviews');

  // -------------------------------------------------------
  // Star rating picker
  // -------------------------------------------------------
  var starPicker  = document.getElementById('starPicker');
  var ratingInput = document.getElementById('review-rating');

  if (starPicker) {
    var stars = starPicker.querySelectorAll('.star-pick');

    stars.forEach(function (star) {
      // Highlight on hover
      star.addEventListener('mouseenter', function () {
        var val = parseInt(star.dataset.value, 10);
        stars.forEach(function (s) {
          s.classList.toggle('active', parseInt(s.dataset.value, 10) <= val);
        });
      });

      // Remove hover highlight when leaving the whole picker
      starPicker.addEventListener('mouseleave', function () {
        var current = parseInt(ratingInput.value, 10) || 0;
        stars.forEach(function (s) {
          s.classList.toggle('active', parseInt(s.dataset.value, 10) <= current);
        });
      });

      // Select rating on click
      star.addEventListener('click', function () {
        var val = parseInt(star.dataset.value, 10);
        ratingInput.value = val;
        stars.forEach(function (s) {
          s.classList.toggle('active', parseInt(s.dataset.value, 10) <= val);
        });
      });
    });
  }

  // -------------------------------------------------------
  // Form validation helper
  // -------------------------------------------------------
  function setError(input, errorId, message) {
    var el = document.getElementById(errorId);
    if (!el) { return; }
    el.textContent = message;
    if (message) {
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // -------------------------------------------------------
  // Installation form
  // -------------------------------------------------------
  var installForm    = document.getElementById('installationForm');
  var installSuccess = document.getElementById('installFormSuccess');

  if (installForm) {
    installForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      var name  = document.getElementById('install-name');
      var email = document.getElementById('install-email');
      var desc  = document.getElementById('install-description');

      if (!name.value.trim()) {
        setError(name, 'install-name-error', 'Please enter your name.');
        valid = false;
      } else {
        setError(name, 'install-name-error', '');
      }

      if (!email.value.trim() || !validateEmail(email.value.trim())) {
        setError(email, 'install-email-error', 'Please enter a valid email address.');
        valid = false;
      } else {
        setError(email, 'install-email-error', '');
      }

      if (!desc.value.trim()) {
        setError(desc, 'install-description-error', 'Please add a description.');
        valid = false;
      } else {
        setError(desc, 'install-description-error', '');
      }

      if (!valid) { return; }

      // In a real implementation this would POST to a server endpoint.
      // Here we simulate success.
      installForm.reset();
      var previews = document.getElementById('photoPreviews');
      if (previews) { previews.innerHTML = ''; }

      if (installSuccess) {
        installSuccess.hidden = false;
        installSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(function () { installSuccess.hidden = true; }, 6000);
      }
    });
  }

  // -------------------------------------------------------
  // Review form
  // -------------------------------------------------------
  var reviewForm    = document.getElementById('reviewForm');
  var reviewSuccess = document.getElementById('reviewFormSuccess');

  if (reviewForm) {
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      var name   = document.getElementById('review-name');
      var email  = document.getElementById('review-email');
      var rating = document.getElementById('review-rating');
      var title  = document.getElementById('review-title');
      var body   = document.getElementById('review-body');

      if (!name.value.trim()) {
        setError(name, 'review-name-error', 'Please enter your name.');
        valid = false;
      } else {
        setError(name, 'review-name-error', '');
      }

      if (!email.value.trim() || !validateEmail(email.value.trim())) {
        setError(email, 'review-email-error', 'Please enter a valid email address.');
        valid = false;
      } else {
        setError(email, 'review-email-error', '');
      }

      var ratingErrEl = document.getElementById('review-rating-error');
      if (!rating.value) {
        if (ratingErrEl) { ratingErrEl.textContent = 'Please select a star rating.'; }
        valid = false;
      } else {
        if (ratingErrEl) { ratingErrEl.textContent = ''; }
      }

      if (!title.value.trim()) {
        setError(title, 'review-title-error', 'Please add a review title.');
        valid = false;
      } else {
        setError(title, 'review-title-error', '');
      }

      if (!body.value.trim()) {
        setError(body, 'review-body-error', 'Please write your review.');
        valid = false;
      } else {
        setError(body, 'review-body-error', '');
      }

      if (!valid) { return; }

      // Build and prepend the new review card to the list
      var reviewsList = document.getElementById('reviewsList');
      if (reviewsList) {
        var card = buildReviewCard({
          name:    name.value.trim(),
          vehicle: document.getElementById('review-vehicle').value.trim(),
          rating:  parseInt(rating.value, 10),
          title:   title.value.trim(),
          body:    body.value.trim(),
          date:    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        });
        reviewsList.insertBefore(card, reviewsList.firstChild);
        updateRatingSummary(parseInt(rating.value, 10));
      }

      reviewForm.reset();
      if (ratingInput) { ratingInput.value = ''; }
      if (starPicker) {
        starPicker.querySelectorAll('.star-pick').forEach(function (s) { s.classList.remove('active'); });
      }
      var rPreviews = document.getElementById('reviewPhotoPreviews');
      if (rPreviews) { rPreviews.innerHTML = ''; }

      if (reviewSuccess) {
        reviewSuccess.hidden = false;
        reviewSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(function () { reviewSuccess.hidden = true; }, 6000);
      }
    });
  }

  // -------------------------------------------------------
  // Build a review card element from data
  // -------------------------------------------------------
  function buildReviewCard(data) {
    var initial = data.name.charAt(0).toUpperCase();

    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      var cls = i <= data.rating ? 'filled' : 'empty';
      starsHtml += '<span class="star ' + cls + '">★</span>';
    }

    var article = document.createElement('article');
    article.className = 'review-card';
    article.innerHTML =
      '<header class="review-header">' +
        '<div class="reviewer-info">' +
          '<span class="reviewer-avatar">' + escapeHtml(initial) + '</span>' +
          '<div>' +
            '<strong class="reviewer-name">' + escapeHtml(data.name) + '</strong>' +
            (data.vehicle ? '<span class="review-vehicle">' + escapeHtml(data.vehicle) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="review-meta">' +
          '<div class="stars-display" aria-label="' + data.rating + ' out of 5 stars">' + starsHtml + '</div>' +
          '<span class="review-date">' + escapeHtml(data.date) + '</span>' +
        '</div>' +
      '</header>' +
      '<h3 class="review-title">' + escapeHtml(data.title) + '</h3>' +
      '<p class="review-body">' + escapeHtml(data.body) + '</p>';

    return article;
  }

  // -------------------------------------------------------
  // Update the rating summary bar after a new review
  // -------------------------------------------------------
  var ratingCounts = [0, 0, 0, 1, 2]; // index 0=1★ … 4=5★ (seed data: two 5★, one 4★)

  function updateRatingSummary(newRating) {
    ratingCounts[newRating - 1]++;
    var total = ratingCounts.reduce(function (a, b) { return a + b; }, 0);
    var sum   = ratingCounts.reduce(function (acc, cnt, i) { return acc + cnt * (i + 1); }, 0);
    var avg   = total > 0 ? (sum / total).toFixed(1) : '0.0';

    var avgEl = document.getElementById('avgRating');
    if (avgEl) { avgEl.textContent = avg; }

    var countEl = document.getElementById('reviewCount');
    if (countEl) { countEl.textContent = 'Based on ' + total + ' review' + (total === 1 ? '' : 's'); }

    // Update bar widths
    var rows = document.querySelectorAll('#ratingBars .rating-bar-row');
    rows.forEach(function (row, i) {
      var reverseIdx = 4 - i; // rows are 5★ … 1★
      var cnt  = ratingCounts[reverseIdx];
      var pct  = total > 0 ? Math.round((cnt / total) * 100) : 0;
      var fill = row.querySelector('.bar-fill');
      var cntEl = row.querySelector('.bar-count');
      if (fill)  { fill.style.width = pct + '%'; }
      if (cntEl) { cntEl.textContent = cnt; }
    });
  }

  // -------------------------------------------------------
  // Minimal HTML escaping
  // -------------------------------------------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

})();
