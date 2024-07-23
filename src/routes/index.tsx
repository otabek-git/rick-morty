import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Character,
  ApiResponse,
  fetchCharactersAsync,
  searchCharacterByNameAsync,
} from '../api/api';
import { useDebounce } from '@uidotdev/usehooks';
import { Loading } from '../components/loading';

const statusItems = ['Alive', 'Dead', 'Unknown'];
const speciesItems = ['Human', 'Alien', 'Humanoid', 'Robot'];

export const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const speciesFilter = searchParams.get('species') || '';
  const statusFilter = searchParams.get('status') || '';

  const [searchByName, setSearchByName] = useState(() => {
    return searchParams.get('search') || '';
  });

  const debouncedSearchTerm = useDebounce(searchByName, 700);

  const onSearchChange = (value: string) => {
    setSearchByName(value);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      newParams.set('search', debouncedSearchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  }, [debouncedSearchTerm, setSearchParams]);

  const onFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    console.log(newParams);
    if (value) {
      newParams.set(key, value);
    }
    if (!value) {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const characterQueryAsync = useQuery<ApiResponse>({
    queryKey: ['character', currentPage, speciesFilter, statusFilter],
    queryFn: async () => {
      return fetchCharactersAsync(currentPage, {
        species: speciesFilter,
        status: statusFilter,
      });
    },
  });

  const searchByNameAsync = useQuery({
    queryKey: ['searchByName', debouncedSearchTerm, currentPage],
    queryFn: async () =>
      await searchCharacterByNameAsync(currentPage, debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 5000,
  });

  const setPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const activeQueryAsync = debouncedSearchTerm
    ? searchByNameAsync
    : characterQueryAsync;

  const hasNextPage = activeQueryAsync.data?.info.next !== null;

  if (activeQueryAsync.isError) {
    return <div>{activeQueryAsync.error.message}</div>;
  }
  if (!activeQueryAsync.data) {
    return null;
  }

  return (
    <>
      <section className="flex items-center justify-between  flex-col lg:flex-row">
        <Search searchByName={searchByName} onSearchChange={onSearchChange} />
        {searchByNameAsync.isLoading && <Loading />}
        <FilterList
          statusFilter={statusFilter}
          speciesFilter={speciesFilter}
          statusItems={statusItems}
          speciesItems={speciesItems}
          onFilterChange={onFilterChange}
        />
      </section>

      <section className="px-3 pt-2 mt-2 ">
        <CharacterList characters={activeQueryAsync.data.results} />
        <Pagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          setPage={setPage}
        />
      </section>
    </>
  );
};
type CharacterListProps = {
  characters: Character[];
};
const CharacterList = (props: CharacterListProps) => {
  return (
    <>
      <ul className="flex gap-1 text-base flex-wrap items-center justify-around border-2 border-solid border-gray-600 pb-4 p-2">
        {props.characters.map((character: Character) => (
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
    </>
  );
};
type PaginationProps = {
  currentPage: number;
  hasNextPage: boolean;
  setPage: (newPage: number) => void;
};
const Pagination = (props: PaginationProps) => {
  return (
    <>
      <div className="flex justify-center mt-4 mb-10 text-base">
        <PaginationButton
          text="Previous"
          disabled={props.currentPage === 1}
          onClick={() => props.setPage(Math.max(props.currentPage - 1, 1))}
        />
        <span className="px-2 flex items-center">{props.currentPage}</span>

        <PaginationButton
          text="Next"
          disabled={!props.hasNextPage}
          onClick={() => {
            if (!props.hasNextPage) return;
            props.setPage(props.currentPage + 1);
          }}
        />
      </div>
    </>
  );
};
type PaginationButtonProps = {
  text: string;
  disabled?: boolean;
  onClick: () => void;
};
const PaginationButton = (props: PaginationButtonProps) => {
  return (
    <>
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        className="px-4 py-2 enabled:hover:bg-gray-300 rounded disabled:opacity-50 text-black bg-white"
      >
        {props.text}
      </button>
    </>
  );
};

type SearchProps = {
  searchByName: string;
  onSearchChange: (value: string) => void;
};
const Search = (props: SearchProps) => {
  return (
    <>
      <div className="min-w-24">
        <span className="opacity-0 pr-72">hidden</span>
        <input type="hidden" />
      </div>
      <div className="flex mt-4 items-center bg-white  ">
        <input
          type="text"
          placeholder="Search"
          value={props.searchByName}
          onChange={(e) => props.onSearchChange(e.target.value)}
          className="relative z-10 min-w-72"
        />
      </div>
    </>
  );
};

type FilterListProps = {
  statusFilter: string;
  speciesFilter: string;
  statusItems: string[];
  speciesItems: string[];
  onFilterChange: (key: string, value: string) => void;
};
const FilterList = (props: FilterListProps) => {
  return (
    <>
      <div className="pt-4 flex gap-5 pl-4">
        <header>Filter by:</header>
        <FilterSelect
          filterKey="status"
          filterValue={props.statusFilter}
          items={props.statusItems}
          onFilterChange={props.onFilterChange}
        />
        <FilterSelect
          filterKey="species"
          filterValue={props.speciesFilter}
          items={props.speciesItems}
          onFilterChange={props.onFilterChange}
        />
      </div>
    </>
  );
};

type FilterSelectProps = {
  filterKey: string;
  filterValue: string;
  items: string[];
  onFilterChange: (key: string, value: string) => void;
};
const FilterSelect = (props: FilterSelectProps) => {
  return (
    <>
      <details className="flex flex-row">
        <summary className="min-w-24">{props.filterKey}</summary>
        {props.items.map((item, index) => (
          <FilterCheckbox
            key={index}
            name={item}
            checked={item.toLowerCase() === props.filterValue}
            onFilterChange={(e) =>
              props.onFilterChange(
                props.filterKey,
                e.target.checked ? item.toLowerCase() : ''
              )
            }
          />
        ))}
      </details>
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
