document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const player1Select = document.getElementById('player1');
            const player2Select = document.getElementById('player2');

            data.brother.forEach(player => {
                const option1 = document.createElement('option');
                option1.value = player.name;
                option1.textContent = player.name;
                player1Select.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = player.name;
                option2.textContent = player.name;
                player2Select.appendChild(option2);
            });
        })
        .catch(error => console.error('Error loading player data:', error));
});

function updateElo(player1Name, player2Name, finalScore, wasSink) {
    // Validate input
    if (!player1Name || !player2Name || !finalScore || !wasSink) {
        alert('Please fill out all fields.');
        return;
    }

    if (player1Name == player2Name) {
        alert('Same player selected, nothing changed.');
        return;
    }

    const scoreDifference = parseInt(finalScore);
    var scoreMod;
    if(scoreDifference == 5){
        scoreMod = 0.3;
    } else if(scoreDifference == 4) {
        scoreMod = 0.15;
    } else if(scoreDifference == 3) {
        scoreMod = 0;
    } else if(scoreDifference == 2) {
        scoreMod = 0;
    } else{
        scoreMod = -0.1;
    }


    // Calculate expected probabilities
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            // Find player objects
            const player1 = data.brother.find(player => player.name === player1Name);
            const player2 = data.brother.find(player => player.name === player2Name);

            if (!player1 || !player2) {
                alert('Player not found in data.');
                return;
            }
            
            const rating1 = player1.elo;
            const rating2 = player2.elo;

            const expected1 = 1.0 / (1.0 + Math.pow(10, ((rating2 - rating1) / 400)));
            const expected2 = 1.0 / (1.0 + Math.pow(10, ((rating1 - rating2) / 400)));

            let newRating1;
            let newRating2;
            if (wasSink === 'true') {
                newRating1 = Math.round(rating1 + 32 * (1 - expected1) * (1.15 + scoreMod));
                newRating2 = Math.round(rating2 + 32 * (0 - expected2) * (1 - scoreMod));
            } else {
                newRating1 = Math.round(rating1 + 32 * (1 - expected1) * (1 + scoreMod));
                newRating2 = Math.round(rating2 + 32 * (0 - expected2) * (1 - scoreMod));
            }

            alert(`Winner (${player1Name}): ${rating1} -> ${newRating1}\nLoser (${player2Name}): ${rating2} -> ${newRating2}`);

            const updateData = {
                player1: {
                    name: player1Name,
                    elo: newRating1
                },
                player2: {
                    name: player2Name,
                    elo: newRating2
                }
            };

            fetch('/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then(data => {
                console.log('Elo ratings updated successfully:', data);
                alert('Elo ratings updated successfully.');
              })
              .catch(error => {
                console.error('Error updating Elo ratings:', error);
                alert('Error updating Elo ratings. Please try again.');
              });
        })
        .catch(error => {
            console.error('Error fetching player data:', error);
            alert('Error fetching player data.');
        });
}

function addPlayer(name) {
    if (!name) {
        alert('Please enter a player name.');
        return;
    }

    fetch('/add-player', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, elo: 1000 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Player successfully added.');
            // Optionally, reload the page to update the player list
            location.reload();
        } else {
            alert(data.message || 'Error adding player.');
        }
    })
    .catch(error => console.error('Error:', error));
}
