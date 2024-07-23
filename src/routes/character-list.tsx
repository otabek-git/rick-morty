import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  Character,
  ApiResponse,
  fetchCharactersAsync,
  searchCharacterByNameAsync,
} from './api/api';
import { useDebounce } from '@uidotdev/usehooks';
import { Loading } from './components/loading';

export const CharacterList = () => {
  const [filterSearchParams, setFilterSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentPage = parseInt(params.get('page') || '1', 10);
  const speciesFilter = filterSearchParams.get('species') || '';
  const statusFilter = filterSearchParams.get('status') || '';
  console.log(currentPage);
  const characterQueryAsync = useQuery<ApiResponse>({
    queryKey: ['character', currentPage, speciesFilter, statusFilter],
    queryFn: async () => {
      return fetchCharactersAsync(currentPage, {
        species: speciesFilter,
        status: statusFilter,
      });
    },
  });
  console.log(characterQueryAsync.data);
  const onFilterChange = (name: string, value: string) => {
    const newParams = new URLSearchParams(filterSearchParams);
    if (value) {
      newParams.set(name, value);
    }
    if (!value) {
      newParams.delete(name);
    }
    setFilterSearchParams(newParams);
  };
  const [searchByName, setSearchByName] = useState(() => {
    return new URLSearchParams(location.search).get('search') || '';
  });

  const debouncedSearchTerm = useDebounce(searchByName, 500);
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
  console.log(activeQueryAsync.data);

  const filterStatus = ['Alive', 'Dead', 'Unknown'];
  const filterSpecies = ['Human', 'Alien', 'Humanoid', 'Robot'];

  return (
    <>
      <section className="flex items-center justify-between  flex-col lg:flex-row">
        <div className="min-w-24">
          <span className="opacity-0 pr-72">hidden</span>
          <input type="hidden" />
        </div>
        <div className="flex mt-4 items-center bg-white  ">
          {/* <Search color="black" width={16} height={16} className="" />   */}
          <input
            type="text"
            placeholder="Search"
            value={searchByName}
            onChange={(e) => setSearchByName(e.target.value)}
            className="relative z-10 min-w-72"
          />
        </div>
        {searchByNameAsync.isLoading && <Loading />}
        <div className="pt-4 flex gap-5 pl-4">
          <header>Filter by:</header>
          <details className="flex flex-row">
            <summary className="min-w-24">Status</summary>
            {filterStatus.map((status, index) => (
              <FilterCheckbox
                key={index}
                name={status}
                checked={status.toLowerCase() === statusFilter}
                onFilterChange={(e) => {
                  onFilterChange(
                    'status',
                    e.target.checked ? status.toLowerCase() : ''
                  );
                }}
              />
            ))}
          </details>
          <details className="flex flex-row">
            <summary className="min-w-24">Species</summary>
            {filterSpecies.map((species, index) => (
              <FilterCheckbox
                key={index}
                name={species}
                checked={species.toLowerCase() === speciesFilter}
                onFilterChange={(e) =>
                  onFilterChange(
                    'species',
                    e.target.checked ? species.toLowerCase() : ''
                  )
                }
              />
            ))}
          </details>
        </div>
      </section>

      <section className="px-3 pt-2 mt-2 ">
        <ul className="flex gap-1 text-base flex-wrap items-center justify-around border-2 border-solid border-gray-600 pb-4 p-2">
          {activeQueryAsync.data.results.map((character: Character) => (
            <li
              className="shadow-2xl border-solid border-2 bg-[#231f20]  border-gray-600 p-1 flex animate-fadeInUp hover:outline-gray-600 hover:outline-4 hover:outline "
              key={character.id}
            >
              <Link to={`/character/${character.id}`}>
                <img
                  className="lg:w-[200px] lg:h-[200px] w-[130px] h-[130px]shadow-lg"
                  src={character.image}
                  alt=""
                />
                <div className=" mt-2 ">
                  <span className="pt-1 md:hidden">
                    {character.name.length > 12
                      ? character.name.substring(0, 12) + '...'
                      : character.name}
                  </span>
                  <span className="pt-1 hidden md:block">{character.name}</span>
                  <div className="flex text-xs gap-1">
                    <span> {character.status === 'Alive' ? '❤️' : '💀'}</span>
                    <span> {character.status} - </span>
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

type FilterCheckboxProps = {
  name: string;
  checked?: boolean;
  onFilterChange?: (e: any) => void;
};

const FilterCheckbox = (props: FilterCheckboxProps) => {
  return (
    <>
      <label className="flex gap-1" htmlFor={props.name}>
        <input
          type="checkbox"
          id={props.name}
          name={props.name.toLowerCase()}
          value={props.name.toLowerCase()}
          checked={props.checked}
          onChange={props.onFilterChange}
        />
        {props.name}
      </label>
    </>
  );
};
