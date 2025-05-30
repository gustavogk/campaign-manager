import CampanhasClient from "../components/custom/client";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Campanhas</h1>
      <CampanhasClient />
    </main>
  );
}
