import { RefreshCcw } from 'lucide-react';

export const Loading = () => {
  return (
    <>
      <div>
        <RefreshCcw
          className="animate-spin flex justify-center items-center"
          color="white"
        />
      </div>
    </>
  );
};
