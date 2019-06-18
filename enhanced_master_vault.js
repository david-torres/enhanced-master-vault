let apiKey
const timeout = 1000

const loadApiKey = () =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.get(['api_key'], result => resolve(result.api_key))
  })

const load = () => {
  let decks = document.querySelectorAll(
    '.my-decks-page__decks-list td.kf-table__cell.deck-list__name-field > div.deck-list__deck-name > a'
  )

  decks.forEach(el => {
    let deckId = el.getAttribute('href').split('/')[2]

    fetch('https://decksofkeyforge.com/public-api/v3/decks/' + deckId, {
        headers: {
          'Api-Key': apiKey
        },
        method: 'GET'
      })
      .then(response => response.json())
      .then(deck => {
        let sasEl = document.createElement('div')
        let aercEl = document.createElement('div')
        let dokEl = document.createElement('div')

        let sas = document.createElement('p')
        sas.innerHTML = 'SAS: ' + deck.deck.sasRating
        sasEl.appendChild(sas)

        let aerc = document.createElement('p')
        aerc.innerHTML = 'AERC: ' + deck.deck.aercScore
        aercEl.appendChild(aerc)

        let dokIcon = document.createElement('img')
        dokIcon.setAttribute('src', chrome.extension.getURL('dokicon-16x16.png'))

        let dokLink = document.createElement('a')
        dokLink.setAttribute('href', 'https://decksofkeyforge.com/decks/' + deck.deck.keyforgeId)

        dokLink.appendChild(dokIcon)
        dokEl.appendChild(dokLink)

        sasEl.classList.add('enhanced-master-vault')
        aercEl.classList.add('enhanced-master-vault')
        dokEl.classList.add('enhanced-master-vault')

        el.parentElement.parentElement.insertBefore(document.createElement('hr'), el.nextSibling)
        el.parentElement.parentElement.insertBefore(sasEl, el.nextSibling)
        el.parentElement.parentElement.insertBefore(aercEl, sasEl.nextSibling)
        el.parentElement.parentElement.insertBefore(dokEl, aercEl.nextSibling)
      })
  })
}

loadApiKey().then(key => {
  // handle first load
  if (!key) {
    var key = prompt('Please enter your Decks of KeyForge API Key:')

    chrome.storage.sync.set({
        api_key: key
      },
      () => {
        location.reload()
      }
    )
  }

  apiKey = key
})

document.addEventListener('click', e => {
  if (
    e.target &&
    (e.target.matches('.pagination__link') ||
      e.target.matches('.pagination__arrow') ||
      e.target.matches('.icon-checkbox__icon--favorite') ||
      e.target.matches('.decks-filters__search-btn span.btn-content'))
  ) {
    setTimeout(load, timeout)
  }
})

setTimeout(load, timeout)