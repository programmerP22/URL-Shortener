function shortURLGenerator(){
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseLetters = uppercaseLetters.toLowerCase()
  const numbers = '0123456789'
  const combination = uppercaseLetters + lowercaseLetters + numbers
  const URLLength = 5

  let shortURL = ''

  for (let i = 0; i < URLLength; i++) {
    let randomIndex = Math.floor(Math.random() * combination.length)
    shortURL += combination[randomIndex]
  }
  return shortURL
}

module.exports = shortURLGenerator