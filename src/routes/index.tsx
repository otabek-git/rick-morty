import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FetchCharactersResponse, fetchCharacters } from './api/api';

export const Index = () => {
  const [page, setPage] = useState(1);
  const characterQueryAsync = useQuery<FetchCharactersResponse>({
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
  if (!characterQueryAsync.data) {
    return null;
  }

  return (
    <>
      <section className="px-3 pt-5">
        <ul className="flex gap-4 text-base flex-wrap items-center justify-center pb-4">
          {characterQueryAsync.data.results.map((character) => (
            <li
              className="flex hover:outline-orange-400 hover:outline-4 hover:outline hover:text-orange-400"
              key={character.id}
            >
              <Link to={`/character/${character.id}`}>
                <img
                  className="lg:w-[200px] lg:h-[200px] w-[130px] h-[130px]shadow-lg"
                  src={character.image}
                  alt=""
                />
                <div className=" mt-2 p-1 ">
                  <span className="pt-1 md:hidden">
                    {character.name.length > 12
                      ? character.name.substring(0, 12) + '...'
                      : character.name}
                  </span>
                  <span className="pt-1 hidden md:block">{character.name}</span>
                  <div className="flex text-xs gap-1 text-cyan-400">
                    <span> {character.status === 'Alive' ? '❤️' : '💀'}</span>
                    <span> {character.status}</span>
                    <span>{character.species}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex justify-center mt-4 mb-10 text-base">
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
