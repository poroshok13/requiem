/* Sign up and log in. Accounts live in this browser only (demo): see the notice on the page. */
$(function () {
  if (!$('#signupForm').length) return;

  var users = function () { return REQ.store.get('requiem.users', []); };
  var findUser = function (email) { return users().filter(function (u) { return u.email === email; })[0]; };
  var val = function (id) { return $.trim($('#' + id).val()); };
  var email = function (id) { return val(id).toLowerCase(); };
  var looksLikeEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

  // Shows a message under a field the same way the validator does (the .show class makes it visible)
  var showError = function (id, text) {
    $('#err-' + id).text(text).addClass('show');
    $('#' + id).attr('aria-invalid', 'true');
  };
  var clearError = function (id) {
    $('#err-' + id).text('').removeClass('show');
    $('#' + id).attr('aria-invalid', 'false');
  };

  /* Sign up: six rules, each with a message under its field */
  var signCheck = REQ.validator({
    suName: function () {
      var v = val('suName');
      if (!v) return 'Enter your full name.';
      return /^\p{L}+([ -]\p{L}+)+$/u.test(v) ? '' : 'Use your first and last name, letters only.';
    },
    suEmail: function () {
      var v = email('suEmail');
      if (!v) return 'Enter your email.';
      if (!looksLikeEmail(v)) return 'Enter an email like name@example.com.';
      return findUser(v) ? 'This email already has an account. Log in instead.' : '';
    },
    suPhone: function () {
      var digits = val('suPhone').replace(/\D/g, '');
      if (!digits) return 'Enter your phone number.';
      return /^(7|8)7\d{9}$/.test(digits) ? '' : 'Use a Kazakhstan mobile number, for example +7 700 123 45 67.';
    },
    suPass: function () {
      var v = $('#suPass').val();
      if (!v) return 'Choose a password.';
      if (v.length < 8) return 'The password needs at least 8 characters.';
      return /\p{L}/u.test(v) && /\d/.test(v) ? '' : 'Use at least one letter and one digit.';
    },
    suConfirm: function () {
      var v = $('#suConfirm').val();
      if (!v) return 'Repeat your password.';
      return v === $('#suPass').val() ? '' : 'The passwords do not match.';
    },
    suTerms: function () { return $('#suTerms').is(':checked') ? '' : 'Accept the terms to continue.'; }
  });

  $('#signupForm').on('submit', function (e) {
    e.preventDefault();
    $('#suDone').prop('hidden', true);
    var bad = signCheck.all();
    if (bad) { $('#' + bad).trigger('focus'); notify('Check the highlighted fields.', 'warn'); return; }
    var list = users();
    list.push({ name: val('suName'), email: email('suEmail'), phone: val('suPhone'), password: $('#suPass').val(), created: new Date().toISOString() });
    if (!REQ.store.set('requiem.users', list)) {
      notify('This browser did not save the account. Open the site from a web address, not as a file.', 'warn');
      return;
    }
    this.reset();
    signCheck.reset();
    $('#suDone').prop('hidden', false);
    notify('Account created. You can log in now.');
  });

  /* Log in: checks the stored account, shows the error under the password, then opens the profile */
  var loginCheck = REQ.validator({
    liEmail: function () {
      var v = email('liEmail');
      if (!v) return 'Enter your email.';
      return looksLikeEmail(v) ? '' : 'Enter an email like name@example.com.';
    },
    liPass: function () { return $('#liPass').val() ? '' : 'Enter your password.'; }
  });

  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    var bad = loginCheck.all();
    if (bad) { $('#' + bad).trigger('focus'); return; }
    var user = findUser(email('liEmail'));
    if (!user) {
      showError('liEmail', 'No account with this email in this browser. Sign up first.');
      $('#liEmail').trigger('focus');
      return;
    }
    if (user.password !== $('#liPass').val()) {
      showError('liPass', 'Wrong password for this account.');
      $('#liPass').trigger('focus');
      return;
    }
    if (!REQ.store.set('requiem.session', user.email)) {
      notify('This browser does not keep the login. Open the site from a web address, not as a file.', 'warn');
      return;
    }
    $(document).trigger('account:changed');
    window.location.href = 'profile.html';
  });

  /* Forgot password: show the panel, then set a new password when the email and phone match an account */
  $('#forgotLink').on('click', function (e) {
    e.preventDefault();
    var panel = $('#resetPanel');
    var open = panel.is(':visible');
    panel.stop(true, true).slideToggle(200);
    $(this).attr('aria-expanded', String(!open));
    if (!open) $('#rsEmail').trigger('focus');
  });

  var digitsTail = function (v) { return String(v || '').replace(/\D/g, '').slice(-10); };
  var resetCheck = REQ.validator({
    rsEmail: function () {
      var v = email('rsEmail');
      if (!v) return 'Enter the email of your account.';
      if (!looksLikeEmail(v)) return 'Enter an email like name@example.com.';
      return findUser(v) ? '' : 'No account with this email in this browser.';
    },
    rsPhone: function () {
      var digits = digitsTail(val('rsPhone'));
      if (!digits) return 'Enter the phone number you used at sign-up.';
      var user = findUser(email('rsEmail'));
      return user && digitsTail(user.phone) === digits ? '' : 'This phone number does not match the account.';
    },
    rsPass: function () {
      var v = $('#rsPass').val();
      if (!v) return 'Choose a new password.';
      if (v.length < 8) return 'The password needs at least 8 characters.';
      return /\p{L}/u.test(v) && /\d/.test(v) ? '' : 'Use at least one letter and one digit.';
    },
    rsConfirm: function () {
      var v = $('#rsConfirm').val();
      if (!v) return 'Repeat the new password.';
      return v === $('#rsPass').val() ? '' : 'The passwords do not match.';
    }
  });

  $('#resetForm').on('submit', function (e) {
    e.preventDefault();
    var bad = resetCheck.all();
    if (bad) { $('#' + bad).trigger('focus'); notify('Check the highlighted fields.', 'warn'); return; }
    var list = users();
    var user = findUser(email('rsEmail'));
    // compare by email: the list was read from storage again, so object identity does not hold
    list = list.map(function (u) { return u.email === user.email ? $.extend({}, u, { password: $('#rsPass').val() }) : u; });
    if (!REQ.store.set('requiem.users', list)) {
      notify('This browser did not save the new password. Open the site from a web address, not as a file.', 'warn');
      return;
    }
    this.reset();
    resetCheck.reset();
    $('#resetPanel').slideUp(200);
    $('#forgotLink').attr('aria-expanded', 'false');
    notify('New password saved. You can log in now.');
  });

  // a new attempt clears the "wrong password" message
  $('#liEmail, #liPass').on('input', function () {
    clearError('liEmail');
    clearError('liPass');
  });
});
