(function () {
  const getRepositoryBtn = document.getElementById("getRepositryBtn");
  const repositoriesContainer = $("#repositories");
  const paginationContainer = $("#pagination");

  getRepositoryBtn.addEventListener("click", getRepositories);

  function getRepositories() {
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim();

    if (!username) {
      alert("Please enter a GitHub username.");
      return;
    }
    const perPage = 10;
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}`;

    repositoriesContainer.html(
      '<div class="spinner-border" role="status"><span class="sr-only"></span></div>'
    );

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error fetching repositories. Please check the username or try again later.`
          );
        }
        return response.json();
      })
      .then((data) => {
        displayRepositories(data);
      })
      .catch((error) => {
        repositoriesContainer.html(
          `<p class="text-danger">${error.message}</p>`
        );
      });
  }

  function displayRepositories(repositories) {
    const profileContainer = $("#profile");
    repositoriesContainer.empty();

    if (repositories.length === 0) {
      repositoriesContainer.html(
        '<p class="text-info">No repositories found.</p>'
      );
      return;
    }

    const repo = repositories[0]; // Assuming you are displaying information for the first repository

    // Fetch detailed user information
    fetch(`https://api.github.com/users/${repo.owner.login}`)
      .then((response) => response.json())
      .then((user) => {
        // Modify the HTML content to display user profile information
        profileContainer.html(`
            <div class="profile">
              <img id="user_img" class="img-thumbnail" src="${user.avatar_url}" alt="Profile picture" />
              <div id="f-f-u" class="center-align">
                <span class="material-symbols-outlined">supervisor_account</span>
                <h6>${user.followers} followers - ${user.following} following</h6>
              </div>
              <h6 class="center-align">
                <span class="material-symbols-outlined">link</span> ${user.html_url}
              </h6>
            </div>
            <div id="right-details">
              <span class="name"><b>${user.name}</b></span>
              <span class="username">${user.login}</span>
              <p class="bio">${user.bio}</p>
              <span class="location"><span class="material-symbols-outlined">location_on</span>${user.location}</span>
              <span class="twitter">Twitter: @${user.twitter_username}</span>
            </div>
          `);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        // Handle error in user data fetch
        profileContainer.html(
          '<p class="text-danger">Error fetching user data.</p>'
        );
      });

    repositories.forEach((repo) => {
      // Fetch language data from the provided languages_url
      fetch(repo.languages_url)
        .then((response) => response.json())
        .then((languages) => {
          // Create a div to hold the language buttons
          const languagesDiv = document.createElement("div");
          languagesDiv.className = "languages-container";

          // Iterate through the languages and create buttons
          for (const language of Object.keys(languages)) {
            const languageButton = document.createElement("span");
            languageButton.className = "btn btn-primary";
            languageButton.textContent = language;

            // Append the button to the div
            languagesDiv.appendChild(languageButton);
          }

          // Append the language div to the card body
          const cardBody = document.createElement("div");
          cardBody.className = "card-body";
          cardBody.innerHTML = `
                    <h5 class="card-title">${repo.name}</h5>
                    <p class="card-text">${
                      repo.description || "No description available."
                    }</p>
                `;
          cardBody.appendChild(languagesDiv);

          // Create the card div and append the card body
          const cardDiv = document.createElement("div");
          cardDiv.style.width = "45%";
          cardDiv.className = "card mb-3";
          cardDiv.appendChild(cardBody);

          // Append the card div to the repositories container
          repositoriesContainer.append(cardDiv);
        })
        .catch((error) => {
          console.error("Error fetching language data:", error);
        });
    });
  }
})();
