const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function getArtistGenres(token, artistIds) {
  const ids = artistIds.join(',');
  const res = await fetch(
    `https://api.spotify.com/v1/artists?ids=${ids}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  if (!res.ok) return {};
  const data = await res.json();
  const map = {};
  for (const artist of data.artists) {
    if (artist) map[artist.id] = artist.genres || [];
  }
  return map;
}

async function searchAlbums(token, query, offset = 0, limit = 10) {
  const params = new URLSearchParams({
    q: query,
    type: 'album',
    limit: String(limit),
    offset: String(offset)
  });

  const res = await fetch(
    `https://api.spotify.com/v1/search?${params}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(`Search request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function getDateRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const fmt = d => d.toISOString().split('T')[0];
  return { start: fmt(start), end: fmt(end) };
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
    process.exit(1);
  }

  const token = await getAccessToken();
  console.log('Got access token');

  const { start, end } = getDateRange();
  console.log(`Fetching releases for ${start} to ${end}`);

  const releases = [];
  const queries = [
    `tag:new year:${start.slice(0,4)}`,
    'tag:new',
    'tag:hipster',
  ];

  for (const query of queries) {
    let offset = 0;
    for (let page = 0; page < 5; page++) {
      const data = await searchAlbums(token, query, offset, 10);
      const albums = data.albums;

      for (const album of albums.items) {
        if (!album) continue;
        const rd = album.release_date;
        if (rd >= start && rd <= end) {
          if (!releases.find(r => r.id === album.id)) {
            releases.push({
              id: album.id,
              title: album.name,
              artist: album.artists.map(a => a.name).join(', '),
              artist_ids: album.artists.map(a => a.id),
              type: album.album_type,
              release_date: rd,
              image: album.images[1]?.url || album.images[0]?.url || null,
              url: album.external_urls.spotify,
              total_tracks: album.total_tracks,
              genres: []
            });
          }
        }
      }

      if (!albums.next) break;
      offset += 10;
    }
  }

  // Fetch genres from artist endpoints (batch up to 50 IDs per request)
  const allArtistIds = [...new Set(releases.flatMap(r => r.artist_ids))];
  const genreMap = {};
  for (let i = 0; i < allArtistIds.length; i += 50) {
    const batch = allArtistIds.slice(i, i + 50);
    const batchGenres = await getArtistGenres(token, batch);
    Object.assign(genreMap, batchGenres);
  }

  for (const r of releases) {
    const genres = [...new Set(r.artist_ids.flatMap(id => genreMap[id] || []))];
    r.genres = genres;
    delete r.artist_ids;
  }

  console.log(`Fetched genres for ${allArtistIds.length} artists`);

  const outPath = path.join(__dirname, '..', 'data', 'releases.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  let existing = { by_date: {} };
  try {
    const raw = fs.readFileSync(outPath, 'utf8');
    existing = JSON.parse(raw);
    if (!existing.by_date) existing.by_date = {};
  } catch (e) {
    // No existing file
  }

  // Merge new releases into existing data (update genres for existing entries)
  for (const r of releases) {
    const date = r.release_date;
    if (!existing.by_date[date]) existing.by_date[date] = [];
    const existingEntry = existing.by_date[date].find(e => e.id === r.id);
    if (existingEntry) {
      existingEntry.genres = r.genres;
    } else {
      existing.by_date[date].push(r);
    }
  }

  let total = 0;
  for (const date of Object.keys(existing.by_date)) {
    total += existing.by_date[date].length;
  }

  const output = {
    fetched_at: new Date().toISOString(),
    total,
    by_date: existing.by_date
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`Added ${releases.length} new releases. Total: ${total} across ${Object.keys(existing.by_date).length} dates`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
