import {
  Form,
  Link,
  NavLink,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from 'react-router-dom';
import {
  ApiResponse,
  Character,
  fetchCharactersAsync,
  searchCharacterByNameAsync,
} from '../api/api';
import { Loading } from '../components/loading';

const STATUS = ['Alive', 'Dead', 'Unknown'];
const SPECIES = ['Human', 'Alien', 'Humanoid', 'Robot'];

export const loader = async ({ request }: { request: Request }) => {
  console.log(request);
  const url = new URL(request.url);
  console.log(url);
  const $top = Number(url.searchParams.get('$top')) || 10;
  const $skip = Number(url.searchParams.get('$skip')) || 0;
  const speciesFilter = url.searchParams.get('species') || '';
  const statusFilter = url.searchParams.get('status') || '';
  const searchTerm = url.searchParams.get('search') || '';

  let characters;
  if (searchTerm) {
    characters = await searchCharacterByNameAsync($skip / $top + 1, searchTerm);
  } else {
    characters = await fetchCharactersAsync($skip / $top + 1, {
      species: speciesFilter,
      status: statusFilter,
    });
  }
  console.log(characters);
  return {
    characters,
    searchTerm,
    speciesFilter,
    statusFilter,
    currentPage: $skip / $top + 1,
    hasNextPage: characters.info.next !== null,
    totalPages: characters.info.pages,
  };
};

type LoaderData = {
  characters: ApiResponse;
  searchTerm: string;
  speciesFilter: string;
  statusFilter: string;
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
};
export const Index = () => {
  const { characters, searchTerm, speciesFilter, statusFilter } =
    useLoaderData() as LoaderData;
  const navigation = useNavigation();
  console.log(characters.results);
  console.log(searchTerm);
  console.log(navigation);
  if (navigation.state === 'loading') {
    return <Loading />;
  }
  return (
    <>
      <section className="flex  justify-between  flex-col lg:flex-row">
        <Search />
        <FilterList
          statusFilter={statusFilter}
          speciesFilter={speciesFilter}
          statusItems={STATUS}
          speciesItems={SPECIES}
        />
      </section>

      <section className="px-3  mt-2 ">
        <CharacterList characters={characters.results} />
        <Pagination />
      </section>
    </>
  );
};

const CharacterList = (props: { characters: Character[] }) => {
  return (
    <>
      <ul className="flex gap-1 text-base flex-wrap items-center justify-around  pb-4 p-2">
        {props.characters.map((character: Character) => (
          <li
            className=" bg-[#231f20]   p-1 flex animate-fadeInUp  "
            key={character.id}
          >
            <Link to={`/character/${character.id}`}>
              <img
                className="w-[130px] h-[130px] "
                src={character.image}
                alt=""
              />
              <div className=" mt-2 ">
                <span className="pt-1 text-sm">
                  {character.name.length > 12
                    ? character.name.substring(0, 12) + '...'
                    : character.name}
                </span>
                {/* <span className="pt-1 hidden md:block">{character.name}</span> */}
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
export const Search = () => {
  return (
    <>
      <div className="min-w-24">
        <span className="opacity-0 pr-72">hidden</span>
        <input type="hidden" />
      </div>
      <div className=" mt-2 flex justify-center ">
        <Form id="search-form" role="search">
          <input
            placeholder="Search"
            type="text"
            name="search"
            className="relative z-10 min-w-72"
          />
        </Form>
      </div>
    </>
  );
};

export const FilterList = (props: {
  statusFilter: string;
  speciesFilter: string;
  statusItems: string[];
  speciesItems: string[];
}) => {
  return (
    <>
      <div className="pt-3 flex gap-5 pl-4  justify-center">
        <header>Filter by:</header>

        <FilterSelect
          filterKey="status"
          filterValue={props.statusFilter}
          items={props.statusItems}
        />
        <FilterSelect
          filterKey="species"
          filterValue={props.speciesFilter}
          items={props.speciesItems}
        />
      </div>
    </>
  );
};

const FilterSelect = (props: {
  filterKey: string;
  filterValue: string;
  items: string[];
}) => {
  return (
    <>
      <details className="flex flex-row">
        <summary className="min-w-24">{props.filterKey}</summary>
        {props.items.map((item, index) => (
          <FilterCheckbox
            key={index}
            name={props.filterKey}
            value={item.toLowerCase()}
            checked={item.toLowerCase() === props.filterValue}
          />
        ))}
      </details>
    </>
  );
};

const FilterCheckbox = (props: {
  name: string;
  value: string;
  checked: boolean;
}) => {
  const submit = useSubmit();
  return (
    <>
      <Form role="filter" onChange={(e) => submit(e.currentTarget)}>
        <label className="flex gap-1" htmlFor={props.name}>
          <input
            type="radio"
            name={props.name}
            value={props.value}
            defaultChecked={props.checked}
          />
          {props.value}
        </label>
      </Form>
    </>
  );
};

function setSearchParamsString(
  searchParams: URLSearchParams,
  changes: Record<string, string | number | undefined>
) {
  const newSearchParams = new URLSearchParams(searchParams);
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) {
      newSearchParams.delete(key);
      continue;
    }
    newSearchParams.set(key, String(value));
  }
  return Array.from(newSearchParams.entries())
    .map(([key, value]) =>
      value ? `${key}=${encodeURIComponent(value)}` : key
    )
    .join('&');
}
const Pagination = () => {
  const { currentPage, hasNextPage, totalPages } =
    useLoaderData() as LoaderData;
  const [searchParams] = useSearchParams();
  const $top = Number(searchParams.get('$top')) || 10;
  const $skip = (currentPage - 1) * $top;
  // const totalPagess = Math.ceil(totalPages / $top);
  const maxPages = 5;
  const halfMaxPages = Math.floor(maxPages / 2);

  const canPageBackwards = currentPage > 1;
  const canPageForwards = hasNextPage;

  const pageNumbers = [] as Array<number>;
  if (totalPages <= maxPages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    let startPage = currentPage - halfMaxPages;
    let endPage = currentPage + halfMaxPages;
    if (startPage < 1) {
      endPage += Math.abs(startPage) + 1;
      startPage = 1;
    }
    if (endPage > totalPages) {
      startPage -= endPage - totalPages;
      endPage = totalPages;
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <>
      <div className="flex justify-center mt-4 mb-10 ">
        <PaginationLink
          to={{ search: setSearchParamsString(searchParams, { $skip: 0 }) }}
          disabled={!canPageBackwards}
          aria-label="First page"
        >
          ⟪
        </PaginationLink>
        <PaginationLink
          to={{
            search: setSearchParamsString(searchParams, {
              $skip: Math.max($skip - $top, 0),
            }),
          }}
          disabled={!canPageBackwards}
          aria-label="Previous page"
        >
          ←
        </PaginationLink>
        {pageNumbers.map((pageNumber) => (
          <PaginationLink
            key={pageNumber}
            to={{
              search: setSearchParamsString(searchParams, {
                $skip: (pageNumber - 1) * $top,
              }),
            }}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </PaginationLink>
        ))}
        <PaginationLink
          to={{
            search: setSearchParamsString(searchParams, {
              $skip: $skip + $top,
            }),
          }}
          disabled={!canPageForwards}
          aria-label="Next page"
        >
          →
        </PaginationLink>
        <PaginationLink
          to={{
            search: setSearchParamsString(searchParams, {
              $skip: (totalPages - 1) * $top,
            }),
          }}
          disabled={!canPageForwards}
          aria-label="Last page"
        >
          ⟫
        </PaginationLink>
      </div>
    </>
  );
};

const PaginationLink = (props: {
  to: {};
  children: any;
  disabled?: boolean;
  prefetch?: string;
}) => {
  const { currentPage } = useLoaderData() as LoaderData;

  const { to, children, ...restProps } = props;
  const isNumberPage = typeof children === 'number';

  const isCurrentPage = isNumberPage && children === currentPage;
  if (props.disabled) {
    return (
      <span className=" font-medium p-2 text-sm rounded opacity-50">
        {props.children}
      </span>
    );
  }
  return (
    <NavLink
      to={to}
      className={`px-3 py-1  flex items-center font-medium text-base  hover:bg-gray-3000    ${
        isCurrentPage ? ' text-white outline-2 outline outline-green-600 ' : ''
      }`}
      preventScrollReset
      prefetch="intent"
      {...restProps}
    >
      {props.children}
    </NavLink>
  );
};
