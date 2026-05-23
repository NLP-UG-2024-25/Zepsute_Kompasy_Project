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

async function searchAlbums(token, query, offset = 0, limit = 50) {
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
    for (let page = 0; page < 3; page++) {
      const data = await searchAlbums(token, query, offset, 50);
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
              type: album.album_type,
              release_date: rd,
              image: album.images[1]?.url || album.images[0]?.url || null,
              url: album.external_urls.spotify,
              total_tracks: album.total_tracks
            });
          }
        }
      }

      if (!albums.next) break;
      offset += 50;
    }
  }

  const grouped = {};
  for (const r of releases) {
    const date = r.release_date;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(r);
  }

  const output = {
    fetched_at: new Date().toISOString(),
    total: releases.length,
    by_date: grouped
  };

  const outPath = path.join(__dirname, '..', 'data', 'releases.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`Fetched ${releases.length} releases across ${Object.keys(grouped).length} dates`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
