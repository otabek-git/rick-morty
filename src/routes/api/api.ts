export type Character = {
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
  page: number,
  filters: { species: string; status: string }
): Promise<FetchCharactersResponse> => {
  const speciesQuery = filters.species ? `&species=${filters.species}` : '';
  const statusQuery = filters.status ? `&status=${filters.status}` : '';

  const res = await fetch(
    `https://rickandmortyapi.com/api/character/?page=${page}&${speciesQuery}${statusQuery}`
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

export const searchCharacterByNameAsync = async (
  page: number,
  name: string
) => {
  const res = await fetch(
    `https://rickandmortyapi.com/api/character/?page=${page}&name=${name}`
  );
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data;
};
