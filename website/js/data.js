window.REQ = {};

REQ.money = function (n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
};

REQ.zones = [
  { id: 'standard', name: 'Standard Zone', type: 'solo', hz: 240, stations: 64, icon: 'bi-pc-display', blurb: 'Fast gaming PCs for daily matchmaking and casual games.', specs: [['bi-gpu-card', 'NVIDIA GeForce RTX 4070'], ['bi-cpu', 'Intel Core i7 14700F'], ['bi-display', 'BenQ Zowie 240Hz 1ms'], ['bi-keyboard', 'HyperX Alloy + Pulsefire Haste'], ['bi-person-workspace', 'Ergonomic Titan Gaming Chair']] },
  { id: 'comfort', name: 'Comfort Zone', type: 'solo', hz: 280, stations: 32, icon: 'bi-controller', blurb: 'Wider desks, Fast IPS monitors and ultralight wireless mice.', specs: [['bi-gpu-card', 'NVIDIA GeForce RTX 4080'], ['bi-cpu', 'Intel Core i7 14700K'], ['bi-display', 'ASUS ROG 280Hz Fast IPS'], ['bi-keyboard', 'Logitech G Pro X Superlight'], ['bi-person-workspace', 'DXRacer Master Series']] },
  { id: 'vip', name: 'VIP Lounge', type: 'solo', hz: 360, stations: 16, icon: 'bi-gem', blurb: 'Flagship performance in a private, sound-isolated room.', specs: [['bi-gpu-card', 'NVIDIA GeForce RTX 4090 24GB'], ['bi-cpu', 'Intel Core i9 14900K'], ['bi-display', 'Zowie XL2566K 360Hz DyAc 2'], ['bi-keyboard', 'Wooting 60HE Rapid Trigger'], ['bi-person-workspace', 'Secretlab Titan Evo 2024']] },
  { id: 'bootcamp', name: 'Boot Camp 5v5 Room', type: 'team', hz: 360, stations: 5, icon: 'bi-people-fill', blurb: 'Dedicated soundproof suite designed for competitive esports squads.', specs: [['bi-gpu-card', '5x RTX 4090 stations'], ['bi-diagram-3', 'Dedicated 10G LAN switch'], ['bi-easel', 'Coach tactical analysis whiteboard'], ['bi-volume-mute', 'Acoustic soundproofing']] },
  { id: 'stream', name: 'Streaming Suite', type: 'team', hz: 360, stations: 3, icon: 'bi-broadcast', blurb: 'Studio setup prepared for Twitch and YouTube broadcasting.', specs: [['bi-camera-video', 'Sony Alpha camera + Elgato Key Lights'], ['bi-mic', 'Shure SM7B + GoXLR audio interface'], ['bi-gpu-card', 'Dual RTX 4090 dedicated stream rig'], ['bi-display', 'Triple 360Hz screens + 4K preview']] }
];

REQ.passes = [
  { id: 'hour', name: 'Standard Hour', tag: 'Solo session', price: 900, unit: 'hour', hours: 1, zone: 'standard', blurb: 'Basic zone access with RTX 4070 and 240Hz screens.', features: ['Core i7 + RTX 4070', '240Hz Full HD BenQ', 'HyperX Cloud II headset', 'Ergonomic chair'] },
  { id: '3hours', name: '3-Hour Boost', tag: 'Popular', price: 2400, unit: 'package', hours: 3, zone: 'comfort', blurb: 'The right length for a ranked matchmaking series.', features: ['Core i7 + RTX 4080', '280Hz Fast IPS panel', 'Logitech G Pro X Superlight', 'Comfort zone seating'] },
  { id: 'night', name: 'Night Marathon', tag: 'Best value', price: 4500, unit: '10 hours', hours: 10, zone: 'vip', blurb: 'Non-stop midnight grind from 22:00 to 08:00.', features: ['Core i9 + RTX 4090', '360Hz Zowie DyAc 2', 'Wooting 60HE keyboard', 'Complimentary energy drink'] },
  { id: 'bootcamp5h', name: 'Boot Camp Pass', tag: 'Team 5v5', price: 18000, unit: '5 hours', hours: 5, zone: 'bootcamp', blurb: 'Private soundproof room configured for team scrims.', features: ['5 isolated stations', 'Coach tactical analysis board', 'Dedicated 10G LAN line', 'Personal attendant'] }
];

REQ.games = [
  { title: 'Counter-Strike 2', cover: 'images/games/cs2.jpg', genre: 'Shooter', mode: '5v5', platform: 'PC', zone: 'standard', fps: 400 },
  { title: 'Valorant', cover: 'images/games/valorant.jpg', genre: 'Shooter', mode: '5v5', platform: 'PC', zone: 'standard', fps: 500 },
  { title: 'Dota 2', cover: 'images/games/dota2.jpg', genre: 'MOBA', mode: '5v5', platform: 'PC', zone: 'standard', fps: 240 },
  { title: 'League of Legends', cover: 'images/games/lol.jpg', genre: 'MOBA', mode: '5v5', platform: 'PC', zone: 'standard', fps: 300 },
  { title: 'Rocket League', cover: 'images/games/rocket-league.jpg', genre: 'Sports', mode: '3v3', platform: 'PC', zone: 'standard', fps: 300 },
  { title: 'Apex Legends', cover: 'images/games/apex.jpg', genre: 'Battle Royale', mode: 'Squad', platform: 'PC', zone: 'comfort', fps: 220 },
  { title: 'Fortnite', cover: 'images/games/fortnite.jpg', genre: 'Battle Royale', mode: 'Squad', platform: 'PC', zone: 'comfort', fps: 260 },
  { title: 'Forza Horizon 5', cover: 'images/games/forza-horizon-5.jpg', genre: 'Racing', mode: 'Solo', platform: 'PC', zone: 'comfort', fps: 144 },
  { title: 'Call of Duty: Warzone', cover: 'images/games/warzone.jpg', genre: 'Battle Royale', mode: 'Squad', platform: 'PC', zone: 'vip', fps: 170 },
  { title: 'Cyberpunk 2077', cover: 'images/games/cyberpunk-2077.jpg', genre: 'RPG', mode: 'Solo', platform: 'PC', zone: 'vip', fps: 120 },
  { title: 'Tekken 8', cover: 'images/games/tekken-8.jpg', genre: 'Fighting', mode: '1v1', platform: 'PS5', zone: 'lounge', fps: 60 },
  { title: 'EA FC 26', cover: 'images/games/ea-fc-26.jpg', genre: 'Sports', mode: '1v1', platform: 'PS5', zone: 'lounge', fps: 60 }
];

REQ.events = [
  { id: 'e1', day: 4, hour: 14, game: 'CS2', name: 'Winter Major Qualifier', format: '5v5, LAN, Double Elim', prize: 1000000, slots: 16, taken: 11 },
  { id: 'e2', day: 6, hour: 15, game: 'Dota 2', name: 'Battle of the Ancients', format: '5v5, Captains Mode', prize: 750000, slots: 16, taken: 9 },
  { id: 'e3', day: 9, hour: 16, game: 'Valorant', name: 'Spike Rush Masters', format: '5v5, Competitive', prize: 500000, slots: 16, taken: 16 },
  { id: 'e4', day: 11, hour: 18, game: 'EA FC 26', name: 'Sunday PS5 Cup', format: '1v1, Single Elim', prize: 250000, slots: 32, taken: 20 },
  { id: 'e5', day: 14, hour: 17, game: 'CS2', name: 'Requiem Open Cup', format: '2v2, Wingman', prize: 300000, slots: 24, taken: 10 },
  { id: 'e6', day: 18, hour: 15, game: 'Tekken 8', name: 'Iron Fist Night', format: '1v1, Double Elim', prize: 200000, slots: 32, taken: 14 },
  { id: 'e7', day: 21, hour: 14, game: 'Dota 2', name: 'Midwinter Mid Ladder', format: '1v1, Mid only', prize: 100000, slots: 24, taken: 24 },
  { id: 'e8', day: 25, hour: 16, game: 'Valorant', name: 'Requiem Invitational', format: '5v5, Invite only', prize: 450000, slots: 8, taken: 5 },
  { id: 'e9', day: 30, hour: 13, game: 'Mortal Kombat 1', name: 'Fatality Friday', format: '1v1, Single Elim', prize: 150000, slots: 32, taken: 8 }
];

REQ.teams = [
  { name: 'Requiem Elite', game: 'CS2', points: 2450, wins: 14, winrate: 88, captain: '@phantom_kz' },
  { name: 'Phoenix Clan', game: 'Dota 2', points: 1980, wins: 11, winrate: 76, captain: '@alfa_strike' },
  { name: 'CyberGhost Squad', game: 'Valorant', points: 1620, wins: 9, winrate: 70, captain: '@spectre_void' },
  { name: 'Aurora Gaming', game: 'CS2', points: 1340, wins: 7, winrate: 64, captain: '@aurora_lead' },
  { name: 'Steppe Wolves', game: 'CS2', points: 1210, wins: 6, winrate: 61, captain: '@wolf_of_esil' },
  { name: 'Nomad Five', game: 'Dota 2', points: 1105, wins: 6, winrate: 58, captain: '@nomad_cap' },
  { name: 'Silent Archers', game: 'Valorant', points: 980, wins: 5, winrate: 55, captain: '@archer_zero' },
  { name: 'Baiterek Esports', game: 'Valorant', points: 910, wins: 4, winrate: 52, captain: '@baiterek_gg' }
];

REQ.faq = [
  { topic: 'Billing', q: 'How does balance retention and reservation work?', a: 'Any remaining time is credited to your personal club profile and never expires. Stations booked online are held for 15 minutes past the start time before being released.' },
  { topic: 'Gear', q: 'Can I bring my own mouse, keyboard and in-ear monitors?', a: 'Yes. Every station has front-facing USB hubs and 3.5mm audio jacks on the desk surface, so you can plug in without touching the PC chassis.' },
  { topic: 'Age', q: 'What are the age rules for overnight passes?', a: 'Night Marathon passes (22:00 to 08:00) require visitors to be at least 18 years old. A valid photo ID must be shown at reception.' },
  { topic: 'Billing', q: 'Can I cancel or move a booking?', a: 'Cancellation is free up to 1 hour before the booked session. Call the desk to move a booking to another time.' },
  { topic: 'Teams', q: 'How do I book the Boot Camp room for my squad?', a: 'Choose Boot Camp 5v5 in the booking form and the Boot Camp pass. The room is booked as a whole, with all 5 stations, for 5 hours.' },
  { topic: 'Gear', q: 'Which games are installed on the PCs?', a: 'All major competitive titles are pre-installed and updated daily. Steam, Battle.net and Epic accounts sync automatically at login. See the full list in the game library on the Zones page.' },
  { topic: 'Food', q: 'Can I order food and drinks to my desk?', a: 'Yes. Use the tray on the Prices page, add drinks while you book, or ask the bar. Orders are brought to your station, usually within 10 minutes.' },
  { topic: 'Billing', q: 'Which payment methods do you accept?', a: 'Card, Kaspi QR and cash at the desk. Online bookings are paid on arrival.' }
];

REQ.menu = [
  { id: 'm1', name: 'Espresso', category: 'Coffee', price: 800, desc: 'Double shot, pulled to order.' },
  { id: 'm2', name: 'Flat White', category: 'Coffee', price: 1300, desc: 'Velvet milk over a double ristretto.' },
  { id: 'm3', name: 'Iced Latte', category: 'Coffee', price: 1400, desc: 'Cold milk, espresso, no sugar added.' },
  { id: 'm4', name: 'Monster Energy', category: 'Energy', price: 1100, desc: 'Ice-cold 500 ml can.' },
  { id: 'm5', name: 'Red Bull', category: 'Energy', price: 1000, desc: 'Classic 250 ml can.' },
  { id: 'm6', name: 'Smash Burger', category: 'Food', price: 2800, desc: 'Beef patty, cheddar, pickles, house sauce.' },
  { id: 'm7', name: 'Pepperoni Pizza', category: 'Food', price: 4200, desc: '30 cm, baked fresh, cut in 8.' },
  { id: 'm8', name: 'Hot Chicken Sandwich', category: 'Food', price: 1900, desc: 'Crispy chicken, slaw, toasted bun.' },
  { id: 'm9', name: 'Nachos', category: 'Snacks', price: 1500, desc: 'Corn chips with cheese sauce and jalapeño.' },
  { id: 'm10', name: 'Chicken Wings', category: 'Snacks', price: 2600, desc: 'Six pieces, buffalo or soy-garlic.' }
];

REQ.gallery = [
  { src: 'images/gallery/rig.svg', alt: 'A gaming monitor, keyboard and mouse glowing under an arched window', caption: 'Tournament rigs with 360Hz panels' },
  { src: 'images/gallery/lounge.svg', alt: 'A sofa facing a wide TV screen inside a dark arched room', caption: 'PlayStation 5 lounge' },
  { src: 'images/gallery/bar.svg', alt: 'A bar counter with two coffee cups and a tall energy drink can', caption: 'Barista bar and energy drinks' },
  { src: 'images/gallery/bootcamp.svg', alt: 'Five monitors in a row inside a soundproof team room', caption: 'Boot Camp room for 5v5 squads' },
  { src: 'images/gallery/stream.svg', alt: 'A camera, a microphone and a ring light in a streaming studio', caption: 'Streaming suite' },
  { src: 'images/gallery/trophy.svg', alt: 'A golden trophy on a stand beneath a glowing arch', caption: 'LAN championship stage' }
];

REQ.team = [
  { src: 'images/team/team.svg', alt: 'Four cartoon team members standing in front of the Requiem hall arch', name: 'The Requiem team', role: 'Four students from group IT-2506 who built this website together.' },
  { src: 'images/team/maxsutkhan.svg', alt: 'Cartoon portrait of Maxsutkhan with a blue shirt', name: 'Maxsutkhan', role: 'Team lead. Tariffs page, pass finder and FAQ search.' },
  { src: 'images/team/madiyar.svg', alt: 'Cartoon portrait of Madiyar with an amber shirt', name: 'Madiyar', role: 'Home and Zones pages: live hall map and game library.' },
  { src: 'images/team/miras.svg', alt: 'Cartoon portrait of Miras with a red shirt', name: 'Miras', role: 'Tournaments page: schedule filters, registration and leaderboard.' },
  { src: 'images/team/daniil.svg', alt: 'Cartoon portrait of Daniil with a lilac shirt', name: 'Daniil', role: 'Booking and About pages: reservation form, seat map and tray.' }
];

REQ.heroScenes = ['images/hero/shooter.svg', 'images/hero/moba.svg', 'images/hero/fighting.svg', 'images/hero/racing.svg'];

// Favourites belong to an account: each logged-in email gets its own list; guests share one.
REQ.favKey = function () {
  var me = REQ.store.get('requiem.session', null);
  return me ? 'requiem.favorites:' + me : 'requiem.favorites';
};

REQ.store = {
  get: function (key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v === null ? fallback : v;
    } catch (err) { return fallback; }
  },
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) { return false; }  // storage can be blocked, e.g. by browser privacy settings
  }
};

REQ.rooms = [
  { id: 'r-standard', name: 'Standard Zone', type: 'play', zone: 'standard', x: 30, y: 30, w: 400, h: 190, desc: 'The big open floor: 64 RTX 4070 stations in rows of eight with 240Hz screens.' },
  { id: 'r-comfort', name: 'Comfort Zone', type: 'play', zone: 'comfort', x: 30, y: 230, w: 400, h: 130, desc: 'Wider desks and 280Hz Fast IPS monitors, 32 stations along the quiet wall.' },
  { id: 'r-vip', name: 'VIP Lounge', type: 'play', zone: 'vip', x: 450, y: 30, w: 320, h: 130, desc: 'Sixteen RTX 4090 stations behind a sound-isolated glass door.' },
  { id: 'r-bootcamp', name: 'Boot Camp 5v5', type: 'play', zone: 'bootcamp', x: 450, y: 170, w: 150, h: 120, desc: 'Soundproof team suite with 5 stations, a whiteboard and a dedicated 10G switch.' },
  { id: 'r-stream', name: 'Streaming Suite', type: 'play', zone: 'stream', x: 610, y: 170, w: 160, h: 120, desc: 'Studio with a camera, Shure SM7B microphones and a dual-PC stream rig.' },
  { id: 'r-lounge', name: 'PS5 Lounge', type: 'service', zone: '', x: 450, y: 300, w: 320, h: 110, desc: 'Sofas and 65-inch OLED screens for Tekken 8, Mortal Kombat 1 and EA FC 26.' },
  { id: 'r-bar', name: 'Bar', type: 'service', zone: '', x: 230, y: 370, w: 200, h: 90, desc: 'Barista coffee, energy drinks and hot food. Orders go from here to your desk.' },
  { id: 'r-reception', name: 'Reception', type: 'service', zone: '', x: 30, y: 370, w: 190, h: 90, desc: 'Check in with your booking code, show your ID for night passes and top up your balance.' },
  { id: 'r-wc', name: 'Restrooms', type: 'service', zone: '', x: 450, y: 420, w: 130, h: 60, desc: 'Restrooms next to the lounge, open around the clock.' },
  { id: 'r-entrance', name: 'Main entrance', type: 'service', zone: '', x: 600, y: 420, w: 170, h: 60, desc: 'Street-level entrance from Mangilik El Avenue with a coat rack and lockers.' }
];

REQ.validator = function (rules, sel) {
  sel = sel || {};
  var touched = {};
  var submitted = false;
  var ids = Object.keys(rules);
  var el = function (id) { return $(sel[id] || '#' + id); };
  var show = function (id, msg) {
    var err = $('#err-' + id);
    el(id).toggleClass('is-invalid', !!msg).attr('aria-invalid', msg ? 'true' : 'false');
    if (msg) err.html('<i class="bi bi-exclamation-circle" aria-hidden="true"></i><span></span>').find('span').text(msg);
    else err.empty();
    err.toggleClass('show', !!msg);
  };
  var check = function (id) {
    var msg = rules[id]();
    show(id, msg);
    return !msg;
  };
  ids.forEach(function (id) {
    el(id).on('blur', function () { touched[id] = true; check(id); });
    el(id).on('input change', function () { if (touched[id] || submitted) check(id); });
  });
  return {
    check: check,
    all: function () {
      submitted = true;
      var first = null;
      ids.forEach(function (id) { if (!check(id) && !first) first = id; });
      return first;
    },
    recheck: function (list) { list.forEach(function (id) { if (touched[id] || submitted) check(id); }); },
    reset: function () {
      touched = {};
      submitted = false;
      ids.forEach(function (id) { show(id, ''); el(id).removeClass('is-invalid'); });
    },
    el: el
  };
};

REQ.rand = function (seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

REQ.hash = function (text) {
  var h = 2166136261;
  for (var i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

REQ.demand = function (hour, weekend) {
  var base = 0.28 + 0.42 * Math.max(0, Math.sin(((hour - 8) / 24) * Math.PI * 2 * 0.9));
  return Math.min(0.9, base + (weekend ? 0.12 : 0));
};

/* Stations held by saved bookings for one zone and one hour (a booking covers its whole session) */
REQ.bookedSeats = function (zoneId, dateStr, hour) {
  var slot = new Date(dateStr + 'T' + REQ.pad(hour) + ':00:00').getTime();
  var held = {};
  REQ.store.get('requiem.bookings', []).forEach(function (b) {
    if (!b.zoneId || !b.startAt || !b.seatIds || b.zoneId !== zoneId) return;
    var start = new Date(b.startAt).getTime();
    var end = start + (b.hours || 1) * 3600000;
    if (slot >= start && slot < end) b.seatIds.forEach(function (id) { held[id] = true; });
  });
  return held;
};

REQ.buildSeats = function (zoneId, dateStr, hour) {
  var zone = REQ.zones.filter(function (z) { return z.id === zoneId; })[0];
  var d = new Date(dateStr + 'T00:00:00');
  var weekend = d.getDay() === 0 || d.getDay() === 6;
  var rnd = REQ.rand(REQ.hash(zoneId + dateStr + hour));
  var chance = REQ.demand(hour, weekend);
  var held = REQ.bookedSeats(zoneId, dateStr, hour);
  var seats = [];
  for (var i = 1; i <= zone.stations; i++) {
    var id = zoneId.charAt(0).toUpperCase() + '-' + (i < 10 ? '0' + i : i);
    var busy = zoneId === 'bootcamp' ? chance > 0.8 : rnd() < chance;
    seats.push({ id: id, zone: zoneId, number: i, taken: busy || !!held[id] });
  }
  return seats;
};

/* Bookings start at the next full hour, so the hall map and the counter show that hour */
REQ.nextSlot = function () {
  var t = new Date();
  t.setHours(t.getHours() + 1, 0, 0, 0);
  return t;
};

REQ.pad = function (n) { return n < 10 ? '0' + n : String(n); };

REQ.iso = function (d) { return d.getFullYear() + '-' + REQ.pad(d.getMonth() + 1) + '-' + REQ.pad(d.getDate()); };

REQ.hallSeats = function () {
  var slot = REQ.nextSlot();
  var all = [];
  REQ.zones.forEach(function (z) {
    REQ.buildSeats(z.id, REQ.iso(slot), slot.getHours()).forEach(function (s) {
      s.group = z.type === 'team' ? 'team' : z.id;
      all.push(s);
    });
  });
  return all;
};

REQ.liveCount = function () {
  var all = REQ.hallSeats();
  var free = all.filter(function (s) { return !s.taken; }).length;
  return { free: free, total: all.length };
};
