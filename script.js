// script.js

const searchBtn =
  document.getElementById("searchBtn");

const searchInput =
  document.getElementById("searchInput");

const loading =
  document.getElementById("loading");

const error =
  document.getElementById("error");

const profileContainer =
  document.getElementById("profileContainer");

const repoContainer =
  document.getElementById("repoContainer");

const singleModeBtn =
  document.getElementById("singleModeBtn");

const battleModeBtn =
  document.getElementById("battleModeBtn");

const singleSearch =
  document.getElementById("singleSearch");

const battleSection =
  document.getElementById("battleSection");

const battleBtn =
  document.getElementById("battleBtn");

const battleResult =
  document.getElementById("battleResult");



// DATE FORMAT

function formatDate(dateString){

  const options = {
    day:"numeric",
    month:"short",
    year:"numeric"
  };

  return new Date(dateString)
    .toLocaleDateString("en-US",options);

}



// FETCH USER

async function fetchGitHubUser(username){

  try{

    loading.classList.remove("hidden");

    error.classList.add("hidden");

    profileContainer.innerHTML = "";

    repoContainer.innerHTML = "";

    const response = await fetch(
      `https://api.github.com/users/${username}`
    );

    if(!response.ok){
      throw new Error("User Not Found");
    }

    const user = await response.json();

    renderProfile(user);

    fetchRepos(user.repos_url);

  }

  catch(err){

    error.classList.remove("hidden");

    error.innerText = err.message;

  }

  finally{

    loading.classList.add("hidden");

  }

}



// PROFILE UI

function renderProfile(user){

  profileContainer.innerHTML = `
  
  <div class="profile-card">

    <img src="${user.avatar_url}" />

    <div class="profile-details">

      <h2>
        ${user.name || user.login}
      </h2>

      <p class="username">
        @${user.login}
      </p>

      <p>
        ${user.bio || "No bio available"}
      </p>

      <p>
        <strong>Joined:</strong>
        ${formatDate(user.created_at)}
      </p>

      <p>
        <strong>Location:</strong>
        ${user.location || "Not Available"}
      </p>

      <p>
        <strong>Company:</strong>
        ${user.company || "Not Available"}
      </p>

      <p>
        <strong>Portfolio:</strong>

        <a
          href="${user.blog}"
          target="_blank"
        >
          ${user.blog || "Not Available"}
        </a>

      </p>

      <div class="stats">

        <div class="stat-box">
          <h3>${user.followers}</h3>
          <p>Followers</p>
        </div>

        <div class="stat-box">
          <h3>${user.following}</h3>
          <p>Following</p>
        </div>

        <div class="stat-box">
          <h3>${user.public_repos}</h3>
          <p>Repositories</p>
        </div>

        <div class="stat-box">
          <h3>${user.public_gists}</h3>
          <p>Gists</p>
        </div>

      </div>

    </div>

  </div>
  
  `;

}



// FETCH REPOS

async function fetchRepos(url){

  try{

    const response = await fetch(url);

    const repos = await response.json();

    const latestRepos = repos
      .sort(
        (a,b)=>
          new Date(b.created_at)
          - new Date(a.created_at)
      )
      .slice(0,5);

    renderRepos(latestRepos);

  }

  catch(err){

    console.log(err);

  }

}



// REPOS UI

function renderRepos(repos){

  let repoHTML = `
  
  <div class="repo-section">

    <h3>
      Latest Repositories
    </h3>
  
  `;

  repos.forEach(repo=>{

    repoHTML += `
    
    <div class="repo">

      <a
        href="${repo.html_url}"
        target="_blank"
      >
        ${repo.name}
      </a>

      <p>
        ⭐ ${repo.stargazers_count}
      </p>

      <div class="language-badge">
        ${repo.language || "Unknown"}
      </div>

      <p>
        Updated:
        ${formatDate(repo.updated_at)}
      </p>

    </div>
    
    `;

  });

  repoHTML += `</div>`;

  repoContainer.innerHTML = repoHTML;

}



// SEARCH BUTTON

searchBtn.addEventListener("click",()=>{

  const username =
    searchInput.value.trim();

  if(username !== ""){
    fetchGitHubUser(username);
  }

});



// ENTER SEARCH

searchInput.addEventListener("keypress",(e)=>{

  if(e.key === "Enter"){
    searchBtn.click();
  }

});



// SINGLE MODE

singleModeBtn.addEventListener("click",()=>{

  singleModeBtn.classList.add("active");

  battleModeBtn.classList.remove("active");

  singleSearch.classList.remove("hidden");

  battleSection.classList.add("hidden");

});



// BATTLE MODE

battleModeBtn.addEventListener("click",()=>{

  battleModeBtn.classList.add("active");

  singleModeBtn.classList.remove("active");

  battleSection.classList.remove("hidden");

  singleSearch.classList.add("hidden");

});



// USER DATA

async function getUserData(username){

  const userResponse = await fetch(
    `https://api.github.com/users/${username}`
  );

  if(!userResponse.ok){
    throw new Error("Invalid User");
  }

  const userData = await userResponse.json();

  const repoResponse = await fetch(
    userData.repos_url
  );

  const repos = await repoResponse.json();

  const totalStars = repos.reduce(
    (acc,repo)=>
      acc + repo.stargazers_count,
    0
  );

  return{
    userData,
    totalStars
  };

}



// BATTLE MODE

battleBtn.addEventListener("click",async()=>{

  const player1 =
    document.getElementById("player1")
    .value.trim();

  const player2 =
    document.getElementById("player2")
    .value.trim();

  if(!player1 || !player2){
    return;
  }

  battleResult.innerHTML =
    "<div id='loading'></div>";

  try{

    const [user1,user2] =
      await Promise.all([
        getUserData(player1),
        getUserData(player2)
      ]);

    let winner;
    let loser;

    if(user1.totalStars >= user2.totalStars){

      winner = user1;
      loser = user2;

    }

    else{

      winner = user2;
      loser = user1;

    }

    battleResult.innerHTML = `
    
    <div class="battle-cards">

      <!-- WINNER -->

      <div class="battle-card winner">

        <div class="winner-tag">
          🏆 WINNER
        </div>

        <img src="${winner.userData.avatar_url}" />

        <h2>
          ${winner.userData.name || winner.userData.login}
        </h2>

        <p class="username">
          @${winner.userData.login}
        </p>

        <p class="bio">
          ${winner.userData.bio || "No bio available"}
        </p>

        <p>
          Joined:
          ${formatDate(winner.userData.created_at)}
        </p>

        <p>
          Location:
          ${winner.userData.location || "Not Available"}
        </p>

        <div class="battle-stats">

          <div>
            <h3>${winner.totalStars}</h3>
            <p>Total Stars</p>
          </div>

          <div>
            <h3>${winner.userData.public_repos}</h3>
            <p>Repositories</p>
          </div>

          <div>
            <h3>${winner.userData.followers}</h3>
            <p>Followers</p>
          </div>

          <div>
            <h3>${winner.userData.following}</h3>
            <p>Following</p>
          </div>

        </div>

        <a
          href="${winner.userData.html_url}"
          target="_blank"
          class="profile-btn"
        >
          View Profile
        </a>

      </div>

      <!-- LOSER -->

      <div class="battle-card loser">

        <div class="loser-tag">
          ❌ LOSER
        </div>

        <img src="${loser.userData.avatar_url}" />

        <h2>
          ${loser.userData.name || loser.userData.login}
        </h2>

        <p class="username">
          @${loser.userData.login}
        </p>

        <p class="bio">
          ${loser.userData.bio || "No bio available"}
        </p>

        <p>
          Joined:
          ${formatDate(loser.userData.created_at)}
        </p>

        <p>
          Location:
          ${loser.userData.location || "Not Available"}
        </p>

        <div class="battle-stats">

          <div>
            <h3>${loser.totalStars}</h3>
            <p>Total Stars</p>
          </div>

          <div>
            <h3>${loser.userData.public_repos}</h3>
            <p>Repositories</p>
          </div>

          <div>
            <h3>${loser.userData.followers}</h3>
            <p>Followers</p>
          </div>

          <div>
            <h3>${loser.userData.following}</h3>
            <p>Following</p>
          </div>

        </div>

        <a
          href="${loser.userData.html_url}"
          target="_blank"
          class="profile-btn"
        >
          View Profile
        </a>

      </div>

    </div>
    
    `;

  }

  catch(err){

    battleResult.innerHTML = `
    
    <div id="error">
      Invalid Username
    </div>
    
    `;

  }

});