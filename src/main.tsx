import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Root } from './routes/root.tsx';
import { ErrorPage } from './error-page.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Index, loader as indexLoader } from './routes/index.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Character } from './routes/character.tsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
        loader: indexLoader,
      },
      {
        path: '/character/:id',
        element: <Character />,
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router}></RouterProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
