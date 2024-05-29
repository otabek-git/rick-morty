import { Link, Outlet } from 'react-router-dom';

export const Root = () => {
  return (
    <>
      <div id="sidebar">
        <h2>hi root</h2>
        <nav>
          <ul>
            <li>
              <Link to={`/`}>home</Link>
            </li>
            <li>
              <Link to={`characters/1`}>characters</Link>
            </li>

            <li>
              <Link to={`characters/2`}>characters</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
};
