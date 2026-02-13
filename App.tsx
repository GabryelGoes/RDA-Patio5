
import React, { useState, useEffect } from 'react';
import { WorkshopData, Stage } from './types.ts';
import { fetchWorkshopData } from './trelloService.ts';
import Clock from './Clock.tsx';
import VehicleRow from './VehicleRow.tsx';

const STAGE_PRIORITY: Record<Stage, number> = {
  'Garantia': 1,
  'Aguardando Avaliação': 2,
  'Em Avaliação': 3,
  'Aguardando Aprovação': 4,
  'Aprovado': 5,
  'Aguardando Peças': 6,
  'Em Serviço': 7,
  'Fase de Teste': 8,
  'Finalizado': 9,
  'Orçamento Não Aprovado': 10
};

const App: React.FC = () => {
  const [data, setData] = useState<WorkshopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const CARS_PER_PAGE = 6;

  const loadData = async () => {
    try {
      const result = await fetchWorkshopData();
      const sortedVehicles = result.vehicles
        .filter(v => STAGE_PRIORITY[v.stage] !== undefined)
        .sort((a, b) => (STAGE_PRIORITY[a.stage] || 99) - (STAGE_PRIORITY[b.stage] || 99));

      setData({ ...result, vehicles: sortedVehicles });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const refreshInterval = setInterval(loadData, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (!data || data.vehicles.length <= CARS_PER_PAGE) {
      setPage(0);
      return;
    }
    const pageInterval = setInterval(() => {
      setPage((prev) => (prev + 1) % Math.ceil(data.vehicles.length / CARS_PER_PAGE));
    }, 10000);
    return () => clearInterval(pageInterval);
  }, [data]);

  if (loading && !data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <p className="animate-pulse font-black tracking-widest text-xs uppercase">Carregando Painel...</p>
      </div>
    );
  }

  const startIndex = page * CARS_PER_PAGE;
  const visibleVehicles = data?.vehicles.slice(startIndex, startIndex + CARS_PER_PAGE) || [];
  const totalPages = data ? Math.ceil(data.vehicles.length / CARS_PER_PAGE) : 1;

  return (
    <div className="h-screen w-screen bg-black flex flex-col p-4 pb-6 overflow-hidden">
      <header className="flex justify-between items-end mb-4 px-4 h-12">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white uppercase italic leading-none">
              REI DO ABS <span className="text-zinc-600">PÁTIO</span>
            </h1>
            <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-1">
              {page + 1} de {totalPages} • Atualização Automática
            </p>
          </div>
        </div>
        <Clock />
      </header>

      <div className="flex items-center w-full px-12 mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">
        <div className="w-[22%]">Modelo / Placa</div>
        <div className="w-[16%] pl-6">Cliente</div>
        <div className="w-[34%] pl-6">Etapa Atual</div>
        <div className="w-[14%] pl-6">Entrega</div>
        <div className="w-[14%] pl-6">Mecânico</div>
      </div>

      <main className="flex-1 flex flex-col gap-3 min-h-0">
        {visibleVehicles.map((vehicle) => (
          <VehicleRow key={vehicle.id} vehicle={vehicle} />
        ))}
      </main>
    </div>
  );
};

export default App;
