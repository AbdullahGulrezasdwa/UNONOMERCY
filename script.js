// Replace your existing renderHand/renderDiscard logic with this:
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card-face ${card.color}`;
    cardDiv.setAttribute('data-value', card.value);

    // Corner Value (Top Left)
    const tl = document.createElement('div');
    tl.className = 'card-corner corner-tl';
    tl.innerText = card.value;

    // Center Value
    const center = document.createElement('div');
    center.className = 'card-value';
    center.innerText = card.value;

    // Corner Value (Bottom Right)
    const br = document.createElement('div');
    br.className = 'card-corner corner-br';
    br.innerText = card.value;

    cardDiv.appendChild(tl);
    cardDiv.appendChild(center);
    cardDiv.appendChild(br);

    return cardDiv;
}

// Update the player hand rendering loop:
function renderGame() {
    // ... (previous logic for turn indicators) ...

    // Render Discard Pile
    const discardArea = document.getElementById('discard-pile');
    discardArea.innerHTML = ''; // Clear old card
    const topCard = discardPile[discardPile.length - 1];
    discardArea.appendChild(createCardElement(topCard));

    // Render Player Hand
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    players[turn].hand.forEach((card, idx) => {
        const el = createCardElement(card);
        el.onclick = () => tryPlayCard(idx);
        handDiv.appendChild(el);
    });
}
