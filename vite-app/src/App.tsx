import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import './App.css';

const getSiteInfo = async () => {
  const siteInfo = await webflow.getSiteInfo();
  console.log(siteInfo);
  return siteInfo;
};

type SiteInfo = Awaited<ReturnType<typeof getSiteInfo>>;

function App() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    getSiteInfo().then((info) => setSiteInfo(info));
  }, []);

  const base_url = import.meta.env.VITE_NEXTJS_API_URL;

  const { data, isPending, error } = useQuery({
    queryKey: ['siteInfo'],
    queryFn: () =>
      fetch(`${base_url}/api/hello-world`).then((res) => res.json()),
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Andrews site</h1>
      <pre>{JSON.stringify(siteInfo, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
