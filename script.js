/**
 * UNO NO MERCY - Core Engine
 */

const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw2'];
const SPECIALS = [
    { type: 'Wild', val: 'Wild' },
    { type: 'WildDraw4', val: '+4' },
    { type: 'WildDraw10', val: '+10' },
    { type: 'WildReverse', val: 'W-Rev' }
];

let deck = [];
let discardPile = [];
let players = [
    { name: 'Player', hand: [], isCPU: false },
    { name: 'CPU 1', hand: [], isCPU: true },
    { name: 'CPU 2', hand: [], isCPU: true },
    { name: 'CPU 3', hand: [], isCPU: true }
];
let turn = 0;
let direction = 1; // 1 for clockwise, -1 for counter
let currentColor = '';
let drawStack = 0; // Cumulative cards to draw from stacking

// Initialize Game
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('main-game').classList.remove('hidden');
    initGame();
});

document.getElementById('rules-btn').addEventListener('click', () => {
    document.getElementById('rules-popup').classList.remove('hidden');
});

document.getElementById('close-rules').addEventListener('click', () => {
    document.getElementById('rules-popup').classList.add('hidden');
});

function initGame() {
    createDeck();
    shuffleDeck();
    dealCards();
    const startCard = deck.pop();
    discardPile.push(startCard);
    currentColor = startCard.color === 'wild' ? COLORS[Math.floor(Math.random() * 4)] : startCard.color;
    updateUI();
}

function createDeck() {
    deck = [];
    // Standard cards
    COLORS.forEach(color => {
        VALUES.forEach(val => {
            deck.push({ color, value: val });
            deck.push({ color, value: val }); // Duplicate for No Mercy density
        });
    });
    // Add Wilds (Extra 10s for No Mercy)
    for (let i = 0; i < 8; i++) {
        deck.push({ color: 'wild', value: '+4' });
        deck.push({ color: 'wild', value: '+10' });
        deck.push({ color: 'wild', value: 'Wild' });
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards() {
    players.forEach(p => {
        p.hand = deck.splice(0, 7);
    });
}

function updateUI() {
    // Render Player Hand
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    players[0].hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.color}`;
        cardEl.innerText = card.value;
        cardEl.onclick = () => playCard(0, index);
        handDiv.appendChild(cardEl);
    });

    // Render CPU Counts
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`cpu${i}`).innerText = `${players[i].name}: ${players[i].hand.length} cards`;
    }

    // Update Sidebar
    const lastCard = discardPile[discardPile.length - 1];
    const discardDiv = document.getElementById('discard-pile');
    discardDiv.className = `card ${lastCard.color}`;
    discardDiv.innerText = lastCard.value;
    
    document.getElementById('current-color-indicator').style.background = `var(--${currentColor})`;
}

function log(msg) {
    const logDiv = document.getElementById('game-log');
    logDiv.innerHTML = `<div>${msg}</div>` + logDiv.innerHTML;
}

// Gameplay Logic
function playCard(playerIdx, cardIdx) {
    if (turn !== playerIdx) return;

    const card = players[playerIdx].hand[cardIdx];
    const topCard = discardPile[discardPile.length - 1];

    // Validation
    const isColorMatch = card.color === currentColor;
    const isValueMatch = card.value === topCard.value;
    const isWild = card.color === 'wild';

    // Stacking Logic (No Mercy special)
    if (drawStack > 0) {
        // Can only play a draw card of equal or higher value to stack
        const canStack = (card.value.includes('+') || card.value === 'Draw2');
        if (!canStack) {
            log("Must stack or draw!");
            return;
        }
    }

    if (isColorMatch || isValueMatch || isWild) {
        // Play card
        players[playerIdx].hand.splice(cardIdx, 1);
        discardPile.push(card);
        currentColor = card.color === 'wild' ? promptColor(playerIdx) : card.color;
        
        applyEffects(card);
        checkMercy(playerIdx);
        nextTurn();
    }
}

function applyEffects(card) {
    if (card.value === 'Skip') nextTurn();
    if (card.value === 'Reverse') direction *= -1;
    if (card.value === 'Draw2') drawStack += 2;
    if (card.value === '+4') drawStack += 4;
    if (card.value === '+10') drawStack += 10;
    
    // 7 Swap (Simplified for JS example: swaps with next player)
    if (card.value === '7') {
        log("Hand Swap!");
        const next = (turn + direction + 4) % 4;
        [players[turn].hand, players[next].hand] = [players[next].hand, players[turn].hand];
    }
}

function promptColor(idx) {
    if (players[idx].isCPU) return COLORS[Math.floor(Math.random() * 4)];
    const choice = prompt("Choose color: red, blue, green, yellow");
    return COLORS.includes(choice) ? choice : 'red';
}

function nextTurn() {
    turn = (turn + direction + 4) % 4;
    updateUI();

    if (players[turn].isCPU) {
        setTimeout(cpuTurn, 1000);
    }
}

function cpuTurn() {
    const p = players[turn];
    // Resolve draw stack if they can't stack
    if (drawStack > 0) {
        const stackIdx = p.hand.findIndex(c => c.value.includes('+'));
        if (stackIdx === -1) {
            drawCards(turn, drawStack);
            drawStack = 0;
            nextTurn();
            return;
        } else {
            playCard(turn, stackIdx);
            return;
        }
    }

    // Normal play
    const topCard = discardPile[discardPile.length - 1];
    const playIdx = p.hand.findIndex(c => c.color === currentColor || c.value === topCard.value || c.color === 'wild');

    if (playIdx > -1) {
        playCard(turn, playIdx);
    } else {
        drawCards(turn, 1);
        nextTurn();
    }
}

function drawCards(playerIdx, count) {
    for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
            deck = discardPile.splice(0, discardPile.length - 1);
            shuffleDeck();
        }
        players[playerIdx].hand.push(deck.pop());
    }
    checkMercy(playerIdx);
    updateUI();
}

function checkMercy(idx) {
    if (players[idx].hand.length >= 25) {
        log(`${players[idx].name} hit 25 cards! ELIMINATED!`);
        // In a real version, we'd remove them from the array.
    }
    if (players[idx].hand.length === 0) {
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('winner-text').innerText = `${players[idx].name} Wins!`;
    }
}

// Draw Pile Click
document.getElementById('draw-pile').onclick = () => {
    if (turn === 0) {
        if (drawStack > 0) {
            drawCards(0, drawStack);
            drawStack = 0;
        } else {
            drawCards(0, 1);
        }
        nextTurn();
    }
};
