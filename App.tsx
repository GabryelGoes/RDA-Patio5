
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
      console.error("Failed to load data:", error);
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
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white font-black tracking-[0.2em] text-[10px] uppercase">Sincronizando Pátio...</p>
        </div>
      </div>
    );
  }

  const startIndex = page * CARS_PER_PAGE;
  const visibleVehicles = data?.vehicles.slice(startIndex, startIndex + CARS_PER_PAGE) || [];
  const totalPages = data ? Math.ceil(data.vehicles.length / CARS_PER_PAGE) : 1;
  const emptySlotsCount = CARS_PER_PAGE - visibleVehicles.length;

  return (
    <div className="h-screen w-screen bg-black flex flex-col p-4 pb-6 overflow-hidden select-none">
      <header className="flex justify-between items-end mb-4 px-4 h-12">
        <div className="flex items-center gap-4">
          <div className="flex flex-col justify-end">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
              <span className="text-yellow-400">REI DO ABS</span> <span className="text-zinc-600">PÁTIO</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase leading-none mt-1">
              PÁGINA {page + 1} DE {totalPages} • {data?.vehicles.length} VEÍCULOS
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

      <main className="flex-1 grid grid-rows-6 gap-3 min-h-0">
        {visibleVehicles.map((vehicle) => (
          <VehicleRow key={vehicle.id} vehicle={vehicle} />
        ))}
        {Array.from({ length: emptySlotsCount }).map((_, i) => (
          <div 
            key={`empty-${i}`} 
            className="h-full w-full flex items-center justify-center rounded-[24px] border-2 border-dashed border-white/5 bg-white/[0.02]"
          >
            <span className="text-[11px] font-black tracking-[1.2em] text-white/20 uppercase italic ml-[1.2em]">
              Box Livre
            </span>
          </div>
        ))}
      </main>
    </div>
  );
};

export default App;
