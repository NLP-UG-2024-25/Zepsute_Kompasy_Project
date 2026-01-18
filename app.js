const token = 'BQCF1biR8sFwSVPmtXMIdbCsmLJkKVyKIHdFEOaEzLajwfgYRPTHqMH7oxpz0jVqxtSv5flOS7wxrXcxiCIFWPAgKCQ61-jn7NFj-mgOPYT6_iPA24edrBzKwJDu0cV168on3NGbKeV3V77Vvsb6cviXOQ83_uCVCm8S-6Ud0siHW2oTQep3QHzBIA4zl-lIt-qmCFxGu9uAd5mTq718cCCNF3jQ91JIGxqyqCcq1cBaSs9M3_rdUAkB0VLf076Jjz6cUUDxWhpt0S5l6qKgrMcZ4y7ZvK52qOntW5a-v5eBu64qGw';

async function fetchWebApi(endpoint, method = "GET") {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    method
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Spotify API error:", res.status, data);
    throw new Error(data?.error?.message || "Spotify API error");
  }

  return data;
}

async function getNewReleases() {
  const data = await fetchWebApi("v1/browse/new-releases?limit=10&country=PL");
  return data.albums.items;
}

getNewReleases()
  .then(albums => {
    const container = document.getElementById("spotify-data");
    container.innerHTML = "";

    albums.forEach(album => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${album.name}</strong><br>
        ${album.artists.map(a => a.name).join(", ")}<br>
        <a href="${album.external_urls.spotify}" target="_blank" rel="noreferrer">Spotify</a>
        <hr>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => {
    const container = document.getElementById("spotify-data");
    container.textContent = "Nie udało się pobrać danych z Spotify (token wygasł albo błąd API).";
    console.error(err);
  });
