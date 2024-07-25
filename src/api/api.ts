const BASE_URL = 'https://rickandmortyapi.com/api';

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

interface CharacterDetails extends Character {
  origin: {
    name: string;
  };
  location: {
    name: string;
  };
  created: string;
}

export interface ApiResponse {
  info: {
    next: string | null;
    pages: number;
  };
  results: Character[];
}

export const fetchCharactersAsync = async (
  page: number,
  filters: { species: string; status: string }
): Promise<ApiResponse> => {
  try {
    const searchParams = new URLSearchParams({ page: page.toString() });
    for (const [key, value] of Object.entries(filters)) {
      if (value) searchParams.append(key, value);
    }
    const res = await fetch(`${BASE_URL}/character/?${searchParams}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch characters', { cause: error });
  }
};

export const fetchCharacterDetailsAsync = async (
  id: number
): Promise<CharacterDetails> => {
  try {
    const res = await fetch(`${BASE_URL}/character/${id}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch character details', { cause: error });
  }
};

export const searchCharacterByNameAsync = async (
  page: number,
  name: string
): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/character/?page=${page}&name=${name}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch searched characters', { cause: error });
  }
};
