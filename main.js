disableFetching = false; //to prevent spamming server when making simple changes
loaded = "";
pokemonInGen = [151, 100, 135, 107, 156, 72, 88, 96, 120];
requestsSinceLastMinute = 0;
countToReset = 60;
maxRequests = 60;
const pokemons = document.getElementById("pokemons");
imAlreadyGettingSomething = false;
page = 0;
async function getPokemon(pokedex = 1) {
  imAlreadyGettingSomething = true;
  if (disableFetching) {
    pokemons.innerHTML = "Fetching disabled";
    return undefined;
  }
  const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedex}`);
  loads(`https://pokeapi.co/api/v2/pokedex/${pokedex}`);
  requestsSinceLastMinute += 1;
  pokemons.innerHTML = "";
  const data = await res.json();
  for (let i = 0; i < data.pokemon_entries.length; i++) {
    let index = data.pokemon_entries[i].pokemon_species.url.split("/");
    index = index[index.length - 2];
    const caught = JSON.parse(localStorage.getItem("caught") || "{}");

const pkmn = document.createElement("button");
pkmn.classList.add("pokemon");

pkmn.innerHTML = `
  <div class="caughtCorner">
    <input type="checkbox" class="caughtMini" data-id="${index}" ${caught[index] ? "checked" : ""}>
  </div>
  <span class="number">#${i+1}</span><br>
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png">
  <br>${data.pokemon_entries[i].pokemon_species.name}
`;


    if (caught[index]) {
      pkmn.classList.add("caught");
    }

    pkmn.onclick = () => showPkmn(index);

    pokemons.appendChild(pkmn);
	 pkmn.querySelector(".caughtMini").addEventListener("click", (e) => {
  e.stopPropagation(); // prevents opening the PokÃ©mon
});
 pkmn.querySelector(".caughtMini").addEventListener("change", (e) => {
  let caught = JSON.parse(localStorage.getItem("caught") || "{}");
  const id = e.target.dataset.id;

  caught[id] = e.target.checked;
  localStorage.setItem("caught", JSON.stringify(caught));

  // Optional: visually mark the card
  if (e.target.checked) pkmn.classList.add("caught");
  else pkmn.classList.remove("caught");
});

  }
  imAlreadyGettingSomething = false;
}
getPokemon();

async function getSpecificPkmn(index) {
  if (requestsSinceLastMinute >= maxRequests) {
    return "You're making too many requests right now.";
  }
  if (disableFetching) {
    return "Fetching disabled";
  }
  pkmnRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
  loads(`https://pokeapi.co/api/v2/pokemon/${index}`);
  requestsSinceLastMinute += 1;
  pkmnData = await pkmnRes.json();
  return pkmnData;
}

async function showPkmn(index) {
  if (disableFetching) {
    html = "Fetching disabled";
    document.getElementById("highlight").innerHTML = html;
    return undefined;
  }
  desc = await getDesc(index);

  desc = desc.replaceAll("\f", "\n").replaceAll("\n", " ");
  pokemonData = await getSpecificPkmn(index);
  stats = decodeStats(pokemonData);

  if (
    desc == "You're making too many requests right now." ||
    pokemonData == "You're making too many requests right now."
  ) {
    html = `You're making too many requests right now. Try again in ${countToReset} seconds.`;
    document.getElementById("highlight").innerHTML = html;
    return undefined;
  }

  html = `
  <div class="this">
  <div class="left">
    <div class="section">
        <img src='${pokemonData.sprites.front_default}' onload='loads("${
    pokemonData.sprites.front_default
  }")'>
		${pokemonData.name}
	</div>
  <div class="types">
    <span class="type" style="background: url(https://u.cubeupload.com/2tables/${
      pokemonData.types[0].type.name
    }.png)"></span>
    <span class="type" ${
      pokemonData.types.length !== 1
        ? `style="background: url(https://u.cubeupload.com/2tables/${
            pokemonData.types[1].type.name
          }.png)"`
        : ""
    }></span>
  </div>
 </div>
    <div class="section2"><div class="stats"><span>HP: ${
      stats.hp
    }</span><span>ATK: ${stats.attack}</span><span>DEF: ${
    stats.defense
  }</span><span>SPATK: ${stats["special-attack"]}</span><span>SPDEF: ${
    stats["special-defense"]
  }</span><span>SPD: ${stats.defense}</span></div><div class="caughtToggle">
  <input type="checkbox" id="caughtBox">
  <label for="caughtBox">Caught</label>
</div><br>Height: ${Math.floor(pokemonData.height * 0.32808399)}"${Math.floor(
    pokemonData.height * 0.32808399 * 12
  ) % 12}'<br>Weight: ${Math.floor(
    pokemonData.weight * 0.220462262
  )} lb<br><audio controls src="https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${index}.ogg" onload='loads("https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${index}.ogg")'></audio></div></div>
<div class="desc"><div class="scroll">${desc}</div></div>`;
  document.getElementById("highlight").innerHTML = html;
  let caught = JSON.parse(localStorage.getItem("caught") || "{}");
  document.getElementById("caughtBox").checked = caught[index];
  document.getElementById("caughtBox").onchange = () => {
    let caught = JSON.parse(localStorage.getItem("caught") || "{}");
    caught[index] = document.getElementById("caughtBox").checked;
    localStorage.setItem("caught", JSON.stringify(caught));
  };
}
showPkmn(94);

async function getDesc(index) {
  descRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${index}`);
  loads(`https://pokeapi.co/api/v2/pokemon-species/${index}`);
  requestsSinceLastMinute += 1;
  descData = await descRes.json();
  for (i = 0; i < descData.flavor_text_entries.length; i++) {
    if (descData.flavor_text_entries[i].language.name == "en") {
      return descData.flavor_text_entries[i].flavor_text;
    }
  }
}

function decodeStats(data) {
  if (requestsSinceLastMinute >= maxRequests) {
    return "You're making too many requests right now.";
  }
  stats = {};
  for (i = 0; i < data.stats.length; i++) {
    stats[data.stats[i].stat.name] = data.stats[i].base_stat;
  }
  return stats;
}
setInterval(function() {
  requestsSinceLastMinute = 0;
  countToReset = 60;
}, 60000);
setInterval(function() {
  countToReset -= 1;
}, 1000);

window.onerror = function(message, source, lineno, colno, error) {
  document.getElementById("error").style.visibility = "visible";
  document.getElementById(
    "errorMsg"
  ).innerText = `${message} at ${source}:${lineno}:${colno}`;
};
function loads(what) {
  loaded = `Loaded <a href='${what}'>${what}</a><br>` + loaded;
}

function renderDebug() {
  document.getElementById("debug").innerHTML = loaded;
}

//setInterval(renderDebug, 1)

function toggleCaught(id) {
  let caught = JSON.parse(localStorage.getItem("caught") || "{}");

  caught[id] = !caught[id]; // toggle

  localStorage.setItem("caught", JSON.stringify(caught));
}