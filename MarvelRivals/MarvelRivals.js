async function search(event) {
    try {
        if (event) event.preventDefault(); // Prevent form default submission if event is passed

        // Clear previous search results
        clearSearchResults();

        // Get the character's name from the search input field
        const characterID = document.getElementById('search-input-field').value.trim();
        console.log("Input value:", characterID);

        // Clear any previous error messages
        const errorMessage = document.getElementById('error');
        errorMessage.textContent = '';

        // Check if the input is empty
        if (!characterID) {
            errorMessage.innerText = 'Please enter a character name.';
            return;
        }

        // Check for specific word and redirect
        if (characterID.toLowerCase() === 'spell') {
            console.log('Redirecting to UID.html');
            alert('Redirection triggered');
            window.location.href = 'http://localhost:63342/Marvel%20Rivals/UID.html';
            return;
        }

        // Construct the API URL with the player name
        const apiUrl = `https://thingproxy.freeboard.io/fetch/https://rivalsmeta.com/api/player/${encodeURIComponent(characterID)}?season=4`;

        // Fetch player information from the API
        const response = await axios.get(apiUrl);

        if (response.status !== 200 || !response.data) {
            errorMessage.innerHTML = 'No player data was found! <a href="http://localhost:63342/Marvel%20Rivals/UID.html">Try this</a>';
            console.log('No data found');
            return;
        }

        const playerData = response.data;
        console.log('Player data fetched:', playerData);

        const searchResultsContainerRow = document.querySelector('.search-results-container .row');

        // Display player information
        const playerElement = document.createElement('div');
        playerElement.id = "player-card";
        playerElement.className = 'player-card';
        playerElement.innerHTML = `
            <div class="infobox">
                <h2 class="title">Player Information</h2>
                <h3 class="player">Name: ${playerData.player.info.name || 'Unknown'}</h3>
                <h3 class="player">Season Rank: season 3</h3>
                <br>
                <h2 class="title">Unranked </h2>
                <h3 class="player">Games Played: ${playerData.stats.total_matches || 'Unknown'}</h3>
                <h3 class="player">Wins: ${playerData.stats.total_wins || 'Unknown'}</h3>
                <h3 class="player">Losses: ${(playerData.stats.total_matches && playerData.stats.total_wins) ? playerData.stats.total_matches - playerData.stats.total_wins : 'Unknown'}</h3>
                <h3 class="player">Win Rate: ${(playerData.stats.total_matches && playerData.stats.total_wins) ? ((playerData.stats.total_wins / playerData.stats.total_matches) * 100).toFixed(2) + '%' : 'Unknown'}</h3>
                <br>
                <h2 class="title">Ranked </h2>
                <h3 class="player">Games Played: ${playerData.stats.ranked_matches || 'Unknown'}</h3>
                <h3 class="player">Wins: ${playerData.stats.ranked_matches_wins || 'Unknown'}</h3>
                <h3 class="player">Losses: ${(playerData.stats.ranked_matches && playerData.stats.ranked_matches_wins) ? playerData.stats.ranked_matches - playerData.stats.ranked_matches_wins : 'Unknown'}</h3>
                <h3 class="player">Win Rate: ${(playerData.stats.ranked_matches && playerData.stats.ranked_matches_wins) ? ((playerData.stats.ranked_matches_wins / playerData.stats.ranked_matches) * 100).toFixed(2) + '%' : 'Unknown'}</h3>
            </div>
            <button id="toggleUnranked" class="btnani">Show Match Info</button>
<!--            <button id="toggleUnranked2" class="btnani2">test</button>-->
        `;
        searchResultsContainerRow.appendChild(playerElement);


        playerData.match_history.forEach((match) => {
            const {match_player, match_map_id, match_play_duration, dynamic_fields, mvp_uid, svp_uid, match_winner_side} = match;
            const {player_hero, a, k, d, player_id, is_win} = match_player;
            const elements2 = document.getElementsByClassName('MVPDiv');

            // Determine if this player is MVP or SVP
            let playerTitle = '';
            if (player_id === svp_uid) playerTitle = 'SVP';

            // Create a new infoboxUR for each match
            const MatchUR = document.createElement('div');
            MatchUR.id = "player-cardUR";
            MatchUR.className = 'player-cardUR';
            MatchUR.innerHTML = `
                <div class="infoboxUR">
                <div class="HeroDiv">
                <img src="https://rivalsmeta.com/images/heroes/SelectHero/img_selecthero_${player_hero?.hero_id || 'default'}001.png" alt="${player_hero?.hero_id || 'Unknown Hero'}" class="HeroIMG">
                <h3 class="Hero">${heroData[player_hero?.hero_id]?.name || 'Unknown'}</h3>
                </div>
                <div class="MVPDiv">
                <h3 class="MVP">${String(mvp_uid).trim() === String(characterID).trim() ? '🏆MVP' : ''}</h3>
                <h3 class="SVP">${String(svp_uid).trim() === String(characterID).trim() ? '🏆SVP' : ''}</h3>
                <h3 class="winner">${is_win === 1 ? '🟩WINNER🟩' : '🟥LOSER🟥'}</h3>
                </div>
                <div class="KDADiv">
                <h3 class="KDA">K/D/A: ${k ?? 'Unknown'}|${d ?? 'Unknown'}|${a ?? 'Unknown'}</h3>
                </div>
                <div class="ScoreDiv">
                    ${(() => {
                const scoreInfo = dynamic_fields?.score_info;
                if (!scoreInfo) return '';
                const scoreA = scoreInfo[0] ?? 'Unknown';
                const scoreB = scoreInfo[1] ?? 'Unknown';
                const displayA = scoreA === 0 ? 0 : scoreA;
                const displayB = scoreB === 0 ? 0 : scoreB;
                if (displayA !== 'Unknown' || displayB !== 'Unknown') {
                    return `<h3 class="score">Score: ${displayA}/${displayB}</h3>`;
                }
                return '';
            })()}
                <h3 class="Mode">Mode: ${mapData[match_map_id]?.ModeName || 'Unknown'}</h3>
                <h3 class="Matchtime">Duration: ${match_play_duration ? Math.floor(match_play_duration / 60) + ' mins' : 'Unknown'}</h3>
                </div>
                <div class="MapDiv">
                <img src="https://rivalsmeta.com/_ipx/w_125&q_70/images/Map/${mapData[match_map_id]?.MapImage || 'default'}.png" alt="Map image" class="MapIMG">
                <h3 class="Map">${mapData[match_map_id]?.MapName || 'Unknown'}</h3>
                </div>
                </div>
                `;

            searchResultsContainerRow.appendChild(MatchUR);
            const mvpDiv = MatchUR.querySelector('.infoboxUR');
            if (mvpDiv) {
                mvpDiv.style.borderColor = is_win === 1 ? 'green' : 'red';
            }
            document.body.addEventListener('click', function(event){
                const elementsinfobox = document.getElementsByClassName('infoboxUR');
                const toggleBtn = document.getElementById('toggleUnranked');
                const toggleBtn2 = document.getElementById('toggleUnranked2');
                let backBtn = document.getElementById('toggleBack');

                if(event.target.id === "toggleUnranked"){

                    Array.from(elementsinfobox).forEach(element => {
                        element.style.display = 'flex';
                    });

                    DoAnimation();
                    DoAnimation2();


                    toggleBtn.style.display = 'none';
                    toggleBtn2.style.display = 'flex';

                }

                if(event.target.id === "toggleUnranked2"){

                    Array.from(elementsinfobox).forEach(element => {
                        element.style.display = 'none';
                    });

                    DoAnimation3();


                    toggleBtn.style.display = 'flex';
                    toggleBtn2.style.display = 'none';
                }
            });
            function DoAnimation() {
                const cardContainer = document.getElementById("player-card");
                const targetElement = cardContainer?.querySelector(".infobox");
                if (targetElement) {
                    // Optional: reset animation if it needs to re-trigger
                    targetElement.classList.remove("animate");
                    void targetElement.offsetWidth; // reflow
                    targetElement.classList.add("animate");

                    targetElement.addEventListener("animationend", function handler() {
                        targetElement.classList.add("sticky");
                        targetElement.removeEventListener("animationend", handler); // prevent multiple triggers
                    });
                }
            }

            function DoAnimation2() {
                const targetElement = document.getElementById("player-cardUR");
                if (targetElement) {
                    targetElement.classList.remove("fade-slide-up"); // reset if needed
                    void targetElement.offsetWidth;
                    targetElement.classList.add("fade-slide-up");
                }
            }

            function DoAnimation3() {
                const cardContainer2 = document.getElementById("player-card");
                const targetElement = cardContainer2?.querySelector(".infobox");
                if (targetElement) {
                    // Optional: reset animation if it needs to re-trigger
                    targetElement.classList.remove("animateLeft");
                    void targetElement.offsetWidth; // reflow
                    targetElement.classList.add("animateLeft");

                    targetElement.addEventListener("animationend", function handler() {
                        targetElement.classList.add("sticky");
                        targetElement.removeEventListener("animationend", handler); // prevent multiple triggers
                    });
                }
            }
        });



    } catch (error) {
        const errorMessage = document.getElementById('error');
        errorMessage.innerHTML = 'No player data was found! <a href="http://localhost:63342/Marvel%20Rivals/UID.html">Try this</a>';
        console.error('Error fetching player data:', error);
    }
}

function clearSearchResults() {
    const searchResultsContainerRow = document.querySelector('.search-results-container .row');
    searchResultsContainerRow.innerHTML = '';
}


// Append the player info box
//searchResultsContainerRow.appendChild(playerElement);

