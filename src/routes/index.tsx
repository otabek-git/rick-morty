import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FetchCharactersResponse,
  fetchCharacters,
  searchCharacterByNameAsync,
} from './api/api';
import { useDebounce } from '@uidotdev/usehooks';
import { Loading } from './components/loading';

export const Index = () => {
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
    queryKey: ['searchByName', debouncedSearchTerm],
    queryFn: async () => await searchCharacterByNameAsync(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 5000,
  });
  const setPage = (newPage: number) => {
    params.set('page', newPage.toString());
    navigate(`?${params.toString()}`, { replace: true });
  };

  if (characterQueryAsync.isError) {
    return <div>{characterQueryAsync.error.message}</div>;
  }
  if (!characterQueryAsync.data) {
    return null;
  }
  // console.log(searchByNameAsync.data);

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
        <SearchTermResults
          searchByNameAsync={searchByNameAsync}
          debouncedSearchTerm={debouncedSearchTerm}
        />
        <ul className="flex gap-4 text-base flex-wrap items-center justify-center pb-4">
          {characterQueryAsync.data.results.map((character) => (
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
              if (!characterQueryAsync.data.info.next) return;
              setPage(currentPage + 1);
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
type SearchTermResultsProps = {
  searchByNameAsync: UseQueryResult<FetchCharactersResponse, Error>;
  debouncedSearchTerm: string;
};

const SearchTermResults = (props: SearchTermResultsProps) => {
  return (
    <>
      {/* {props.searchByNameAsync.isLoading && <Loading />}
      {props.searchByNameAsync.isError && (
        <div>{props.searchByNameAsync.error.message}</div>
      )} */}
      {props.debouncedSearchTerm.length > 0 && props.searchByNameAsync.data && (
        <ul className="flex gap-2 flex-wrap animate-fadeInUp">
          {props.searchByNameAsync.data.results.map((character) => (
            <li key={character.id}>
              <Link className="flex flex-col" to={`/character/${character.id}`}>
                <img
                  className="w-[200px] h-[200px]"
                  src={character.image}
                ></img>
                <span>{character.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
