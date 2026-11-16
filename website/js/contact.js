$(function () {
  var form = $('#contactForm');
  var locked = false;
  // logged in: name, email and phone start with the account's details (they stay editable)
  var signedIn = REQ.store.get('requiem.session', null);
  var account = signedIn && REQ.store.get('requiem.users', []).filter(function (u) { return u.email === signedIn; })[0];
  if (account) {
    if (!$('#cName').val()) $('#cName').val(account.name);
    if (!$('#cEmail').val()) $('#cEmail').val(account.email);
    if (!$('#cPhone').val()) $('#cPhone').val(account.phone);
  }
  var val = function (id) { return $('#' + id).val(); };
  var rules = {
    cName: function () {
      var v = val('cName').trim();
      if (!v) return 'Enter your name.';
      if (!/^[\p{L}][\p{L}' -]+$/u.test(v)) return 'Use letters only. Digits and symbols are not allowed.';
      return '';
    },
    cEmail: function () {
      var v = val('cEmail').trim();
      if (!v) return 'Enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email like name@example.com.';
      return '';
    },
    cPhone: function () {
      var v = val('cPhone').trim();
      var need = $('input[name="reply"]:checked').val() === 'phone';
      if (!v) return need ? 'Add a phone number, because you chose a phone call.' : '';
      if (!/^(7|8)7\d{9}$/.test(v.replace(/\D/g, ''))) return 'Use a Kazakhstan mobile number, for example +7 700 123 45 67.';
      return '';
    },
    cTopic: function () { return val('cTopic') ? '' : 'Choose what your message is about.'; },
    cSubject: function () {
      var v = val('cSubject').trim();
      if (!v) return 'Write a short subject.';
      if (v.length < 5) return 'The subject needs at least 5 characters.';
      if (v.length > 80) return 'Keep the subject under 80 characters.';
      return '';
    },
    cMessage: function () {
      var v = val('cMessage').trim();
      if (!v) return 'Write your message.';
      if (v.length < 20) return 'The message needs at least 20 characters. You wrote ' + v.length + '.';
      if (v.length > 500) return 'Keep the message under 500 characters.';
      return '';
    },
    reply: function () { return $('input[name="reply"]:checked').length ? '' : 'Choose how we should reply.'; },
    cConsent: function () { return $('#cConsent').is(':checked') ? '' : 'Confirm that we may contact you about this message.'; }
  };
  var check = REQ.validator(rules, { reply: 'input[name="reply"]' });
  $('input[name="reply"]').on('change', function () { check.recheck(['cPhone']); });

  $('#cMessage').on('input', function () {
    var n = val('cMessage').length;
    $('#cCount').text(n + ' / 500').css('color', n > 500 ? 'var(--ember)' : '');
  });

  form.on('submit', function (e) {
    e.preventDefault();
    if (locked) return;
    var bad = check.all();
    if (bad) {
      var target = bad === 'reply' ? $('input[name="reply"]').first() : $('#' + bad);
      $('html, body').stop(true).animate({ scrollTop: target.offset().top - 130 }, 350, function () { target.trigger('focus'); });
      notify('Check the highlighted fields.', 'warn');
      return;
    }
    locked = true;
    var ref = 'MSG-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    var list = REQ.store.get('requiem.messages', []);
    list.push({ ref: ref, name: val('cName').trim(), email: val('cEmail').trim(), phone: val('cPhone').trim(), topic: $('#cTopic option:selected').text(), subject: val('cSubject').trim(), message: val('cMessage').trim(), reply: $('input[name="reply"]:checked').val(), created: new Date().toISOString() });
    REQ.store.set('requiem.messages', list);
    $('#sentRef').text(ref);
    form[0].reset();
    check.reset();
    $('#cCount').text('0 / 500');
    $('#sent').stop(true, true).hide().fadeIn(450);
    $('html, body').stop(true).animate({ scrollTop: $('#sent').offset().top - 100 }, 450, function () { $('#sent h2').attr('tabindex', '-1').trigger('focus'); });
    notify('Message sent. Reference ' + ref + '.');
    setTimeout(function () { locked = false; }, 600);
  });
  $('#sentClose').on('click', function () { $('#sent').stop(true, true).fadeOut(300); });
});
