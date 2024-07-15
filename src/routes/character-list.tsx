import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Character,
  FetchCharactersResponse,
  fetchCharacters,
  searchCharacterByNameAsync,
} from './api/api';
import { useDebounce } from '@uidotdev/usehooks';
import { Loading } from './components/loading';

export const CharacterList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentPage = parseInt(params.get('page') || '1', 10);
  console.log(currentPage);

  const characterQueryAsync = useQuery<FetchCharactersResponse>({
    queryKey: ['character', currentPage],
    queryFn: async () => {
      return fetchCharacters(currentPage);
    },
  });

  const [searchByName, setSearchByName] = useState('');
  const debouncedSearchTerm = useDebounce(searchByName, 300);
  const searchByNameAsync = useQuery({
    queryKey: ['searchByName', debouncedSearchTerm, currentPage],
    queryFn: async () =>
      await searchCharacterByNameAsync(currentPage, debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 5000,
  });
  console.log(searchByNameAsync.data);
  const setPage = (newPage: number) => {
    params.set('page', newPage.toString());
    navigate(`?${params.toString()}`);
  };
  const activeQueryAsync = debouncedSearchTerm
    ? searchByNameAsync
    : characterQueryAsync;

  if (activeQueryAsync.isError) {
    return <div>{activeQueryAsync.error.message}</div>;
  }
  if (!activeQueryAsync.data) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex mt-4 items-center bg-white  ">
          {/* <Search color="black" width={16} height={16} className="" />   */}
          <input
            type="text"
            placeholder="Search"
            value={searchByName}
            onChange={(e) => setSearchByName(e.target.value)}
            className="relative z-10 "
          />
        </div>
        {searchByNameAsync.isLoading && <Loading />}
      </div>

      <section className="px-3 pt-5">
        <ul className="flex gap-4 text-base flex-wrap items-center justify-center pb-4">
          {activeQueryAsync.data.results.map((character: Character) => (
            <li
              className="flex animate-fadeInUp hover:outline-orange-400 hover:outline-4 hover:outline hover:text-orange-400"
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
            onClick={() => setPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-1 py-1 text-black bg-white rounded disabled:opacity-50 enabled:hover:bg-gray-300"
          >
            previous
          </button>
          <span className="px-2 flex items-center">{currentPage}</span>
          <button
            onClick={() => {
              if (!activeQueryAsync.data.info.next) return;
              setPage(currentPage + 1);
            }}
            disabled={!activeQueryAsync.data.info.next}
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
