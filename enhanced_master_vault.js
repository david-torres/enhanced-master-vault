const apiKey = ""
const deckListSelector = '.kf-table__body'

const getMenuOpener = () => {
  return document.querySelector('#menu-opener')
}

const getDecks = () => {
  return document.querySelectorAll('div.deck-list__deck-name > a')
}

const modifyDeckList = () => {
  let decks = getDecks()

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

// watch for changes to the deck list
const deckListMutationObserver = () => {
  var targetNode = document.querySelector(deckListSelector)
  var observerOptions = {
    childList: true,
    attributes: false,
    subtree: false
  }

  var observer = new MutationObserver(modifyDeckList)
  observer.observe(targetNode, observerOptions)
}

// request deck data from Decks Of Keyforge and populate menu
const loadDokData = (event) => {
  let el = event.target
  let deckId = el.dataset.deckId

  // cleanup stale view
  let deckContainer = document.querySelector('#deck-container')
  deckContainer.innerHTML = ""

  fetch('https://decksofkeyforge.com/public-api/v3/decks/' + deckId, {
    headers: {
      'Api-Key': apiKey
    },
    method: 'GET'
  })
    .then(response => response.json())
    .then(response => {
      let deck = response.deck

      if (Object.keys(deck).length === 0) {
        getMenuOpener().checked = false
        alert('Deck data not available')
        return
      }

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
        <p>${Number(deck.effectivePower) / 10} Creature Power</p>
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

      deckContainer.appendChild(deckBody)
    })
    .catch(() => {
      getMenuOpener().checked = false
      alert('Error accessing Decks of Keyforge')
      return
    })
}

// create the hidden toggle for the menu
let menuCheck = document.createElement('input')
menuCheck.setAttribute('type', 'checkbox')
menuCheck.setAttribute('data-menu', 'DrawerMenu')
menuCheck.setAttribute('id', 'menu-opener')
menuCheck.setAttribute('hidden', '')

document.body.appendChild(menuCheck)

// create the drawer menu
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

// wait for initial load so that we can then observe changes
document.arrive(deckListSelector, modifyDeckList)
document.arrive(deckListSelector, deckListMutationObserver)