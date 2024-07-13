import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

const fetchCharacters = async (page: number) => {
  const res = await fetch(
    `https://rickandmortyapi.com/api/character/?page=${page}`
  );
  const data = await res.json();
  console.log(data);
  return data;
};
export const Index = () => {
  const [page, setPage] = useState(1);
  const characterQueryAsync = useQuery({
    queryKey: ['character', page],
    queryFn: async () => {
      return fetchCharacters(page);
    },
  });

  if (characterQueryAsync.isLoading) {
    return <div>loading...</div>;
  }
  if (characterQueryAsync.isError) {
    return <div>{characterQueryAsync.error.message}</div>;
  }
  console.log(characterQueryAsync.data);
  return (
    <>
      <section className="px-3 pt-5">
        <ul className="flex gap-4 text-base flex-wrap items-center justify-center">
          {characterQueryAsync.data.results.map((character) => (
            <li className="flex  flex-col" key={character.id}>
              <img
                className="w-[200px] h-[200px] shadow-lg"
                src={character.image}
                alt=""
              />
              <div className=" outline-dotted mt-2 p-1 outline-green-600">
                <span className="pt-1">{character.name}</span>
                <div className="flex text-xs gap-3 text-cyan-400">
                  <span> {character.status === 'Alive' ? '❤️' : '💀'}</span>
                  <span> {character.status}</span>
                  <span>{character.species}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-center mt-4 mb-4 text-base">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1}
            className="px-1 py-1 text-black bg-white rounded disabled:opacity-50 enabled:hover:bg-gray-300"
          >
            previous
          </button>
          <span className="px-2 flex items-center">{page}</span>
          <button
            onClick={() => {
              if (!characterQueryAsync.data.info.next) return;
              setPage((old) => old + 1);
            }}
            disabled={!characterQueryAsync.data.info.next}
            className="px-4 py-2 enabled:hover:bg-gray-300 rounded disabled:opacity-50 text-black bg-white"
          >
            Next
          </button>
        </div>
        <Outlet />
      </section>
    </>
  );
};
