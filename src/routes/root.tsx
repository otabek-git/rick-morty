import { Link, Outlet } from 'react-router-dom';

export const Root = () => {
  return (
    <>
      {/* <div>
        <h1>Character Data</h1>
        <pre>{JSON.stringify(characterQuery.data, null, 2)}</pre>
      </div> */}

      <div className="">
        <nav className="flex items-center justify-center bg-white">
          <Link
            className="text-2xl text-white px-3 py-2 bg-black font-medium"
            to="/"
          >
            [adult swim]
          </Link>
        </nav>
        <div className="flex justify-center mt-4">
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
};
