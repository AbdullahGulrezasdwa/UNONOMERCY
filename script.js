// ... [Keep your existing Deck and Player variables from before] ...

function createCardUI(card, isSmall = false) {
    const el = document.createElement('div');
    el.className = `card ${card.color}`;
    el.setAttribute('data-val', card.value);

    const valCenter = document.createElement('div');
    valCenter.className = 'card-val';
    valCenter.innerText = card.value;

    const cornerTL = document.createElement('div');
    cornerTL.className = 'corner top-l';
    cornerTL.innerText = card.value;

    const cornerBR = document.createElement('div');
    cornerBR.className = 'corner bot-r';
    cornerBR.innerText = card.value;

    el.append(cornerTL, valCenter, cornerBR);
    return el;
}

function renderGame() {
    const p = players[turn];
    
    // Update Stack & Color
    document.getElementById('stack-count').innerText = `STACK: ${drawStack}`;
    document.getElementById('color-indicator').style.background = `var(--${currentColor})`;

    // Discard Pile
    const discardDiv = document.getElementById('discard-pile');
    discardDiv.innerHTML = '';
    const topCard = discardPile[discardPile.length - 1];
    discardDiv.appendChild(createCardUI(topCard));

    // Player Hand
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    p.hand.forEach((card, idx) => {
        const cardEl = createCardUI(card);
        cardEl.onclick = () => tryPlayCard(idx);
        handDiv.appendChild(cardEl);
    });

    // Player List
    const listDiv = document.getElementById('player-list');
    listDiv.innerHTML = players.map(pl => `
        <div style="color: ${pl.id === turn ? 'white' : '#777'}">
            ${pl.name}: ${pl.hand.length} cards
        </div>
    `).join('');
}
