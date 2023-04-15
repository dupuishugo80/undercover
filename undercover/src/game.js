
export async function getRandomWord(){ // Index 0 : Bon Mot ------ Index 1 : Imposteur
    return fetch('http://localhost:7777/word')
  .then(response => response.json());
}

export function createNewGame(){
  let result = '';
  const characters = 'AB4CDEF1G7HIJK5LMNOPQ28RST6U3VWX9Y';
  const charactersLength = characters.length;
  for ( let i = 0; i < 8; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
