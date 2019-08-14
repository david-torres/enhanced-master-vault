const apiKey = ""
const timeout = 1000

// add handlers to all the various places that load a new set of decks
const addMyDecksClickHandlers = e => {
  document.addEventListener('click', e => {
    if (
      e.target &&
      (e.target.matches('.pagination__link') ||
        e.target.matches('.pagination__arrow') ||
        e.target.matches('.icon-checkbox__icon--favorite') ||
        e.target.matches('.decks-filters__search-btn span.btn-content'))
    ) {
      setTimeout(loadMyDecks, timeout)
      setTimeout(addMyDecksClickHandlers, timeout)
    }
  })
}

const loadMyDecks = () => {
  let decks = document.querySelectorAll(
    '.my-decks-page__decks-list td.kf-table__cell.deck-list__name-field > div.deck-list__deck-name > a'
  )

  // remove old buttons
  document.querySelectorAll('.OpenMenuButton').forEach(el => {
    el.parentNode.removeChild(el)
  })

  // inject "[Access]" buttons
  decks.forEach(el => {
    let deckId = el.getAttribute('href').split('/')[2]

    let accessMenuBtn = document.createElement('label')
    accessMenuBtn.setAttribute('for', 'menu-opener')
    accessMenuBtn.setAttribute('data-deck-id', deckId)
    accessMenuBtn.addEventListener('click', loadDokData)
    accessMenuBtn.classList.add('OpenMenuButton')
    accessMenuBtn.textContent = "[Access]"

    el.parentElement.parentElement.insertBefore(accessMenuBtn, el.nextSibling)
  })
}

const loadDokData = (event) => {
  let el = event.target
  let deckId = el.dataset.deckId

  fetch('https://decksofkeyforge.com/public-api/v3/decks/' + deckId, {
      headers: {
        'Api-Key': apiKey
      },
      method: 'GET'
    })
    .then(response => response.json())
    .then(response => {
      let deck = response.deck
      console.log(deck)
      let deckBody = document.createRange().createContextualFragment(`
        <a href="https://decksofkeyforge.com/decks/${deck.keyforgeId}">
          <h3>
            ${deck.name}
            <img src="${chrome.extension.getURL('dokicon-16x16.png')}">
          </h3>
        </a>
        <h4>${Number(deck.sasRating)} SAS</h4>
        <br>
        <p>${Number(deck.cardsRating)} Card Rating</p>
        <p>${Number(deck.synergyRating)} Synergy</p>
        <p>${Number(deck.antisynergyRating)} AntiSynergy</p>
        <hr>
        <h4>${Number(deck.aercScore)} AERC</h4>
        <br>
        <p>${Number(deck.amberControl)} Aember Control</p>
        <p>${Number(deck.expectedAmber)} Expected Aember</p>
        <p>${Number(deck.artifactControl)} Artifact Control</p>
        <p>${Number(deck.creatureControl)} Creature Control</p>
        <p>${Number(deck.deckManipulation)} Deck Manipulation</p>
        <p>${Number(deck.effectivePower)/10} Creature Power</p>
        <hr>
        <p>${Number(deck.rawAmber)} Bonus Aember</p>
        <p>${Number(deck.keyCheatCount)} Key Cheat</p>
        <p>${Number(deck.cardDrawCount)} Card Draw</p>
        <p>${Number(deck.cardArchiveCount)} Archive</p>
        <hr>
        <p>${Number(deck.creatureCount)} Creatures</p>
        <p>${Number(deck.actionCount)} Actions</p>
        <p>${Number(deck.upgradeCount)} Upgrades</p>
        <p>${Number(deck.artifactCount)} Artifacts</p>
      `);

      let deckContainer = document.querySelector('#deck-container')
      deckContainer.innerHTML = ""
      deckContainer.appendChild(deckBody)
    })
}

// create the hidden toggle for the menu
let menuCheck = document.createElement('input')
menuCheck.setAttribute('type', 'checkbox')
menuCheck.setAttribute('data-menu', 'DrawerMenu')
menuCheck.setAttribute('id', 'menu-opener')
menuCheck.setAttribute('hidden', '')

document.body.appendChild(menuCheck)

// create the menu
let menu = document.createRange().createContextualFragment(`
<aside class="DrawerMenu">
  <nav class="Menu">
    <h2>Library Access</h2>
    <div id="deck-container"></div>
  </nav>
  <label for="menu-opener" class="MenuOverlay"></label>
</aside>
`)
document.body.appendChild(menu)

addMyDecksClickHandlers()
setTimeout(loadMyDecks, timeout)