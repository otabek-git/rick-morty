import { Link, Outlet } from 'react-router-dom';

export const Root = () => {
  return (
    <>
      <div className="">
        <nav className="flex items-center justify-center bg-white">
          <Link
            className="text-xl text-white px-3 py-1 bg-black font-medium"
            to="/"
          >
            [adult swim]
          </Link>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
};
