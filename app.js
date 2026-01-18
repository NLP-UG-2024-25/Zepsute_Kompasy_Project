const token = 'BQCF1biR8sFwSVPmtXMIdbCsmLJkKVyKIHdFEOaEzLajwfgYRPTHqMH7oxpz0jVqxtSv5flOS7wxrXcxiCIFWPAgKCQ61-jn7NFj-mgOPYT6_iPA24edrBzKwJDu0cV168on3NGbKeV3V77Vvsb6cviXOQ83_uCVCm8S-6Ud0siHW2oTQep3QHzBIA4zl-lIt-qmCFxGu9uAd5mTq718cCCNF3jQ91JIGxqyqCcq1cBaSs9M3_rdUAkB0VLf076Jjz6cUUDxWhpt0S5l6qKgrMcZ4y7ZvK52qOntW5a-v5eBu64qGw';
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopTracks(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
  )).items;
}

const topTracks = await getTopTracks();
console.log(
  topTracks?.map(
    ({name, artists}) =>
      `${name} by ${artists.map(artist => artist.name).join(', ')}`
  )
);
Result
';

async function fetchWebApi(endpoint, method) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    method
  });
  return await res.json();
}

async function getNewReleases(){
  return (await fetchWebApi(
    'v1/browse/new-releases?limit=10&country=PL', 'GET'
  )).albums.items;
}

getNewReleases().then(albums => {
  const container = document.getElementById("spotify-data");
  container.innerHTML = "";

  albums.forEach(album => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${album.name}</strong><br>
      ${album.artists.map(a => a.name).join(", ")}<br>
      <a href="${album.external_urls.spotify}" target="_blank">Spotify</a>
      <hr>
    `;
    container.appendChild(div);
  });
}).catch(console.error);
