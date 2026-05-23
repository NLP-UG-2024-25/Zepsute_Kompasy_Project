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

async function fetchNewReleases(token, offset = 0, limit = 50) {
  const res = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?limit=${limit}&offset=${offset}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json();
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
    process.exit(1);
  }

  const token = await getAccessToken();

  const releases = [];
  let offset = 0;
  const limit = 50;

  // Fetch up to 200 releases (4 pages)
  for (let page = 0; page < 4; page++) {
    const data = await fetchNewReleases(token, offset, limit);
    const albums = data.albums;

    for (const album of albums.items) {
      releases.push({
        id: album.id,
        title: album.name,
        artist: album.artists.map(a => a.name).join(', '),
        type: album.album_type,
        release_date: album.release_date,
        image: album.images[1]?.url || album.images[0]?.url || null,
        url: album.external_urls.spotify,
        total_tracks: album.total_tracks
      });
    }

    if (!albums.next) break;
    offset += limit;
  }

  // Group by release_date
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
