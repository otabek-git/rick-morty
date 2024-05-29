import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import { App } from './App.tsx';
import './index.css';
import { Root } from './routes/root.tsx';
import { ErrorPage } from './error-page.tsx';
import { Characters } from './routes/characters.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'characters/:charaterId',
        element: <Characters />,
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router}></RouterProvider>
);
