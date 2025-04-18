// DOM Elements
const spinBtn = document.getElementById('spinBtn');
const bottle = document.querySelector('.bottle');
const playerPositions = document.querySelector('.player-positions');
const playerModal = document.getElementById('playerModal');
const promptModal = document.getElementById('promptModal');
const playerNameInput = document.getElementById('playerNameInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playersList = document.querySelector('.players-list');
const promptsList = document.querySelector('.prompts-list');
const selectedPlayerName = document.getElementById('selectedPlayerName');
const newPromptsBtn = document.getElementById('newPromptsBtn');
const truthPromptsBtn = document.getElementById('truthPromptsBtn');
const darePromptsBtn = document.getElementById('darePromptsBtn');
const managePlayersBtn = document.getElementById('managePlayersBtn');
const spinSound = document.getElementById('spinSound');
const selectSound = document.getElementById('selectSound');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Game state
let players = [];
let currentMode = 'truth'; // Default mode
let isSpinning = false;
let selectedPlayer = null;
let MAX_PLAYERS = 15;

// Load players from local storage
function loadPlayers() {
    const savedPlayers = localStorage.getItem('truthOrDarePlayers');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        renderPlayers();
        renderPlayerPositions();
    } else {
        // Add default players if no saved players
        addPlayer('player 1');
        addPlayer('player 2');
        addPlayer('player 3');
        addPlayer('player 4');
    }
}

// Save players to local storage
function savePlayers() {
    localStorage.setItem('truthOrDarePlayers', JSON.stringify(players));
}

// Add a new player
function addPlayer(name) {
    if (players.length >= MAX_PLAYERS) {
        alert(`Maximum ${MAX_PLAYERS} players allowed!`);
        return;
    }
    
    if (!name.trim()) return;
    
    players.push(name);
    savePlayers();
    renderPlayers();
    renderPlayerPositions();
    playerNameInput.value = '';
}

// Edit a player
function editPlayer(index, newName) {
    if (!newName.trim()) return;
    
    players[index] = newName;
    savePlayers();
    renderPlayers();
    renderPlayerPositions();
}

// Delete a player
function deletePlayer(index) {
    players.splice(index, 1);
    savePlayers();
    renderPlayers();
    renderPlayerPositions();
}

// Render player list in modal
function renderPlayers() {
    playersList.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = player;
        
        const playerActions = document.createElement('div');
        playerActions.className = 'player-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-player';
        editBtn.innerHTML = '✏️';
        editBtn.addEventListener('click', () => {
            const newName = prompt('Enter new name:', player);
            if (newName !== null) {
                editPlayer(index, newName);
            }
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-player';
        deleteBtn.innerHTML = '❌';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Remove player "${player}"?`)) {
                deletePlayer(index);
            }
        });
        
        playerActions.appendChild(editBtn);
        playerActions.appendChild(deleteBtn);
        
        playerItem.appendChild(playerName);
        playerItem.appendChild(playerActions);
        
        playersList.appendChild(playerItem);
    });
}

// Render player positions around the bottle
function renderPlayerPositions() {
    playerPositions.innerHTML = '';
    
    const centerX = 50;
    const centerY = 50;
    const radius = 42; // % from center
    
    players.forEach((player, index) => {
        const angle = (index / players.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        const playerPosition = document.createElement('div');
        playerPosition.className = 'player-position';
        playerPosition.textContent = player;
        playerPosition.style.left = `${x}%`;
        playerPosition.style.top = `${y}%`;
        playerPosition.dataset.index = index;
        
        playerPositions.appendChild(playerPosition);
    });
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get random prompts based on current mode
function getRandomPrompts(count = 5) {
    // Use the current mode to get the appropriate prompts
    const prompts = PROMPTS[currentMode];
    
    // Shuffle array and get first 'count' items
    return shuffleArray([...prompts]).slice(0, count);
}

// Display prompts in modal
function displayPrompts() {
    const randomPrompts = getRandomPrompts();
    promptsList.innerHTML = '';
    
    randomPrompts.forEach(prompt => {
        const promptItem = document.createElement('div');
        promptItem.className = 'prompt-item';
        promptItem.textContent = prompt;
        promptsList.appendChild(promptItem);
    });
}

// Spin the bottle
function spinBottle() {
    if (isSpinning || players.length < 2) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    
    // Play spin sound
    spinSound.currentTime = 0;
    spinSound.play();
    
    // Add pulse animation to player positions
    const playerPositionElements = document.querySelectorAll('.player-position');
    playerPositionElements.forEach(el => {
        el.style.animation = 'pulse 1.5s infinite';
    });
    
    // Randomly select a player
    const selectedIndex = Math.floor(Math.random() * players.length);
    
    // Calculate angle to point directly at the selected player
    const playerCount = players.length;
    const segmentAngle = (2 * Math.PI) / playerCount;
    const playerAngle = selectedIndex * segmentAngle;
    
    // Convert to degrees and add random full rotations (3-6)
    const fullRotations = 3 + Math.floor(Math.random() * 4);
    const angleDegrees = (playerAngle * 180 / Math.PI);
    const totalRotation = fullRotations * 360 + angleDegrees;
    
    // Apply rotation - the neck of the bottle (top) should point to the player
    bottle.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.14, 0.93)';
    bottle.style.transform = `translate(-50%, -50%) rotate(${totalRotation}deg)`;
    
    selectedPlayer = {
        index: selectedIndex,
        name: players[selectedIndex]
    };
    
    // Show prompt modal after spin completes
    setTimeout(() => {
        // Remove pulse animation
        playerPositionElements.forEach(el => {
            el.style.animation = '';
        });
        
        // Highlight selected player
        playerPositionElements[selectedIndex].classList.add('selected');
        
        // Play select sound
        selectSound.currentTime = 0;
        selectSound.play();
        
        isSpinning = false;
        spinBtn.disabled = false;
        
        selectedPlayerName.textContent = selectedPlayer.name;
        displayPrompts();
        promptModal.style.display = 'flex';
    }, 3000);
}

// Reset bottle rotation
function resetBottle() {
    bottle.style.transition = 'none';
    bottle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    
    // Remove selected class from player positions
    const playerPositionElements = document.querySelectorAll('.player-position');
    playerPositionElements.forEach(el => {
        el.classList.remove('selected');
    });
}

// Event Listeners for the prompt mode buttons
truthPromptsBtn.addEventListener('click', () => {
    currentMode = 'truth';
    truthPromptsBtn.classList.add('active');
    darePromptsBtn.classList.remove('active');
    displayPrompts(); // Refresh prompts when mode changes
});

darePromptsBtn.addEventListener('click', () => {
    currentMode = 'dare';
    darePromptsBtn.classList.add('active');
    truthPromptsBtn.classList.remove('active');
    displayPrompts(); // Refresh prompts when mode changes
});

spinBtn.addEventListener('click', spinBottle);

addPlayerBtn.addEventListener('click', () => {
    addPlayer(playerNameInput.value);
});

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer(playerNameInput.value);
    }
});

newPromptsBtn.addEventListener('click', displayPrompts);

managePlayersBtn.addEventListener('click', () => {
    playerModal.style.display = 'flex';
});

// Close modals when clicking close button
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        modal.style.display = 'none';
        
        if (modal === promptModal) {
            resetBottle();
        }
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === playerModal) {
        playerModal.style.display = 'none';
    }
    if (e.target === promptModal) {
        promptModal.style.display = 'none';
        resetBottle();
    }
});

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    
    // Set initial active state for Truth button
    truthPromptsBtn.classList.add('active');
    darePromptsBtn.classList.remove('active');
    
    // Add click event for credit card flip
    const creditCard = document.querySelector('.credit-card');
    if (creditCard) {
        creditCard.addEventListener('click', () => {
            creditCard.classList.toggle('flipped');
        });
    }
}); 