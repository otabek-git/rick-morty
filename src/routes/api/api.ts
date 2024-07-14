type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
};

type CharacterDetails = {
  id: number;
  name: string;
  species: string;
  origin: {
    name: string;
  };
  location: {
    name: string;
  };
  image: string;
  created: string;
};

export type FetchCharactersResponse = {
  info: {
    next: string | null;
  };
  results: Character[];
};

export const fetchCharacters = async (
  page: number
): Promise<FetchCharactersResponse> => {
  const res = await fetch(
    `https://rickandmortyapi.com/api/character/?page=${page}`
  );
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data;
};

export const fetchCharacterDetails = async (
  id: number
): Promise<CharacterDetails> => {
  const res = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data;
};
