document.addEventListener('DOMContentLoaded', function() {
    fetch('/players')
        .then(response => response.json())
        .then(data => {
            const rankingTableBody = document.getElementById('rankingTable').querySelector('tbody');
            rankingTableBody.innerHTML = '';

            data.forEach(player => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                row.appendChild(nameCell);

                const eloCell = document.createElement('td');
                eloCell.textContent = player.elo;
                row.appendChild(eloCell);

                rankingTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching player data:', error));
});
