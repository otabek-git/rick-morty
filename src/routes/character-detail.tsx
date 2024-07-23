import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchCharacterDetailsAsync } from './api/api';
import { Loading } from './components/loading';

export const CharacterDetail = () => {
  const params = useParams();
  const characterDetailsQueryAsync = useQuery({
    queryKey: ['CharacterDetail', params.id],
    queryFn: async () => {
      return fetchCharacterDetailsAsync(Number(params.id));
    },
  });
  if (characterDetailsQueryAsync.isLoading) {
    return <Loading />;
  }
  if (characterDetailsQueryAsync.isError) {
    return <div>{characterDetailsQueryAsync.error.message}...</div>;
  }
  if (!characterDetailsQueryAsync.data) {
    return null;
  }
  console.log(characterDetailsQueryAsync.data);
  return (
    <>
      <section className="flex flex-col p-4 text-sm animate-fadeInUp">
        <img
          src={characterDetailsQueryAsync.data.image}
          width={200}
          height={200}
        />
        <span>{characterDetailsQueryAsync.data.name}</span>
        <span>{characterDetailsQueryAsync.data.origin.name}</span>
        <span>{characterDetailsQueryAsync.data.species}</span>
        <span>{characterDetailsQueryAsync.data.location.name}</span>
      </section>
    </>
  );
};
