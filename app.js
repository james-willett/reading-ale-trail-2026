// ============================================================
// Reading Ale Trail 2026 — Pub Data & Map Logic
// ============================================================

// All 24 pubs with real coordinates from OpenStreetMap/Nominatim
const pubs = [
  {
    id: 1,
    name: "Nags Head",
    area: "Reading",
    address: "5 Russell Street, Reading, RG1 7XD",
    lat: 51.4546,
    lng: -0.9822,
    isBookletSeller: true
  },
  {
    id: 2,
    name: "Alehouse",
    area: "Reading",
    address: "2 Broad Street, Reading, RG1 2BH",
    lat: 51.4552,
    lng: -0.9702,
    isBookletSeller: true
  },
  {
    id: 3,
    name: "Retreat",
    area: "Reading",
    address: "8 St John's Street, Reading, RG1 4EH",
    lat: 51.4533,
    lng: -0.9606,
    isBookletSeller: true
  },
  {
    id: 4,
    name: "Crown",
    area: "Caversham",
    address: "Promenade Road, Caversham, Reading, RG4 8AA",
    lat: 51.4666,
    lng: -0.9767,
    isBookletSeller: false
  },
  {
    id: 5,
    name: "Greyfriar",
    area: "Reading",
    address: "53 Greyfriars Road, Reading, RG1 1PA",
    lat: 51.4587,
    lng: -0.9756,
    isBookletSeller: false
  },
  {
    id: 6,
    name: "Castle Tap",
    area: "Reading",
    address: "120 Castle Street, Reading, RG1 7RJ",
    lat: 51.4519,
    lng: -0.9790,
    isBookletSeller: false
  },
  {
    id: 7,
    name: "Rising Sun",
    area: "Reading",
    address: "16 Castle Street, Reading, RG1 7RD",
    lat: 51.4537,
    lng: -0.9750,
    isBookletSeller: false
  },
  {
    id: 8,
    name: "Farriers Arms",
    area: "Spencers Wood",
    address: "Basingstoke Road, Spencers Wood, RG7 1AE",
    lat: 51.3952,
    lng: -0.9734,
    isBookletSeller: false
  },
  {
    id: 9,
    name: "Railway Tavern",
    area: "Reading",
    address: "31 Greyfriars Road, Reading, RG1 1PA",
    lat: 51.4581,
    lng: -0.9758,
    isBookletSeller: false
  },
  {
    id: 10,
    name: "Fox & Hounds",
    area: "Tilehurst",
    address: "City Road, Tilehurst, Reading, RG31 5SB",
    lat: 51.4521,
    lng: -1.0541,
    isBookletSeller: false
  },
  {
    id: 11,
    name: "Fox & Hounds",
    area: "Sheffield Bottom",
    address: "Deans Copse Road, Sheffield Bottom, RG7 4BE",
    lat: 51.4241,
    lng: -1.0677,
    isBookletSeller: false
  },
  {
    id: 12,
    name: "Lyndhurst",
    area: "Reading",
    address: "88 Queens Road, Reading, RG1 4DG",
    lat: 51.4536,
    lng: -0.9615,
    isBookletSeller: false
  },
  {
    id: 13,
    name: "Park House",
    area: "Reading",
    address: "Whiteknights Campus, Reading, RG6 6UR",
    lat: 51.4401,
    lng: -0.9432,
    isBookletSeller: false
  },
  {
    id: 14,
    name: "Foresters Arms",
    area: "Reading",
    address: "79-81 Brunswick Street, Reading, RG1 6NY",
    lat: 51.4506,
    lng: -0.9894,
    isBookletSeller: false
  },
  {
    id: 15,
    name: "Royal Oak",
    area: "Tilehurst",
    address: "Westwood Glen, The Triangle, Tilehurst, RG31 5NW",
    lat: 51.4611,
    lng: -1.0489,
    isBookletSeller: false
  },
  {
    id: 16,
    name: "Six Bells",
    area: "Burghfield",
    address: "The Hatch, Burghfield, RG30 3TH",
    lat: 51.4113,
    lng: -1.0418,
    isBookletSeller: false
  },
  {
    id: 17,
    name: "Elm Tree",
    area: "Beech Hill",
    address: "Beech Hill Road, Beech Hill, RG7 2AS",
    lat: 51.3717,
    lng: -1.0032,
    isBookletSeller: false
  },
  {
    id: 18,
    name: "Bull Inn",
    area: "Sonning",
    address: "High Street, Sonning, RG4 6UP",
    lat: 51.4736,
    lng: -0.9116,
    isBookletSeller: false
  },
  {
    id: 19,
    name: "The Bull Inn",
    area: "Arborfield Cross",
    address: "Swallowfield Road, Arborfield, RG2 9QD",
    lat: 51.3976,
    lng: -0.9071,
    isBookletSeller: false
  },
  {
    id: 20,
    name: "The Swan",
    area: "Pangbourne",
    address: "Shooter's Hill, Pangbourne, RG8 7DU",
    lat: 51.4861,
    lng: -1.0902,
    isBookletSeller: false
  },
  {
    id: 21,
    name: "Bell",
    area: "Waltham St Lawrence",
    address: "The Street, Waltham St Lawrence, RG10 0JJ",
    lat: 51.4851,
    lng: -0.8065,
    isBookletSeller: false
  },
  {
    id: 22,
    name: "Castle Inn",
    area: "Hurst",
    address: "Church Hill, Hurst, RG10 0SJ",
    lat: 51.4502,
    lng: -0.8566,
    isBookletSeller: false
  },
  {
    id: 23,
    name: "The Flowing Spring",
    area: "Playhatch",
    address: "Henley Road, Playhatch, RG4 9RB",
    lat: 51.4847,
    lng: -0.9263,
    isBookletSeller: false
  },
  {
    id: 24,
    name: "The Sun",
    area: "Whitchurch Hill",
    address: "Hill Bottom, Whitchurch Hill, RG8 7PU",
    lat: 51.5088,
    lng: -1.0738,
    isBookletSeller: false
  }
];

// ============================================================
// Map Initialization
// ============================================================

// Custom beer marker icon using a div with emoji
const beerIcon = L.divIcon({
  html: '<div class="beer-marker">🍺</div>',
  className: 'beer-marker-container',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30]
});

// Booklet seller gets a special icon
const bookletIcon = L.divIcon({
  html: '<div class="beer-marker booklet-seller">🍺</div>',
  className: 'beer-marker-container',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30]
});

// Initialize the map centered on Reading
const map = L.map('map', {
  center: [51.4543, -0.9781],
  zoom: 12,
  zoomControl: true,
  scrollWheelZoom: true
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map);

// Store markers for interaction between cards and map
const markers = {};

// ============================================================
// Add Pub Markers to Map
// ============================================================

pubs.forEach(pub => {
  const icon = pub.isBookletSeller ? bookletIcon : beerIcon;

  const marker = L.marker([pub.lat, pub.lng], { icon: icon }).addTo(map);

  // Build the popup content
  const bookletBadge = pub.isBookletSeller
    ? '<span class="popup-badge">📖 Sells Booklets</span>'
    : '';

  marker.bindPopup(`
    <div class="pub-popup">
      <h3>${pub.name}</h3>
      <p class="popup-area">${pub.area}</p>
      <p class="popup-address">${pub.address}</p>
      ${bookletBadge}
    </div>
  `);

  // Store reference for card interaction
  markers[pub.id] = marker;
});

// ============================================================
// Render Pub Cards
// ============================================================

function renderPubCards() {
  const container = document.getElementById('pub-list');

  pubs.forEach(pub => {
    const card = document.createElement('div');
    card.className = 'pub-card';
    card.setAttribute('data-pub-id', pub.id);

    const bookletBadge = pub.isBookletSeller
      ? '<span class="booklet-badge">📖 Sells Booklets</span>'
      : '';

    card.innerHTML = `
      <div class="pub-card-content">
        <div class="pub-card-header">
          <span class="pub-number">#${pub.id}</span>
          <h3 class="pub-name">${pub.name}</h3>
        </div>
        <p class="pub-area">${pub.area}</p>
        <p class="pub-address">${pub.address}</p>
        ${bookletBadge}
      </div>
      <div class="pub-card-action">
        <span class="map-link" title="Show on map">📍</span>
      </div>
    `;

    // Click card to fly to the pub on the map
    card.addEventListener('click', () => {
      const marker = markers[pub.id];
      map.flyTo([pub.lat, pub.lng], 16, { duration: 1 });
      marker.openPopup();

      // Highlight the active card
      document.querySelectorAll('.pub-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });

    container.appendChild(card);
  });
}

// ============================================================
// Countdown Timer
// ============================================================

function updateCountdown() {
  const deadline = new Date('2026-05-17T23:59:59');
  const now = new Date();
  const diff = deadline - now;

  if (diff <= 0) {
    document.getElementById('countdown').textContent = 'Trail has ended!';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById('countdown').textContent = `${days} days remaining`;
}

// ============================================================
// Initialize Everything
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  renderPubCards();
  updateCountdown();
  // Update countdown every hour
  setInterval(updateCountdown, 3600000);
});
