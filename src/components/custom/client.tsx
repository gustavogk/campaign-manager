"use client";

import useSWR from "swr";
import { useState } from "react";

import { Campaign } from "@/lib/types";
import CampanhaCard from "./CampanhaCard";
import CampanhaForm from "./CampanhaForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

// Função genérica de fetch
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const traduzirStatus = (status: string) => {
  switch (status) {
    case "active":
      return "Ativa";
    case "paused":
      return "Pausada";
    case "expired":
      return "Expirada";
    default:
      return status;
  }
};

export default function CampanhasClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campaign | null>(null);
  const [viewingCampanha, setViewingCampanha] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState("todas");

  const { data: campanhas = [], mutate } = useSWR<Campaign[]>(
    "/api/campaigns",
    fetcher
  );

  const handleNovaCampanha = () => {
    setEditingCampanha(null);
    setIsOpen(true);
  };

  const handleEditarCampanha = (campanha: Campaign) => {
    setEditingCampanha(campanha);
    setIsOpen(true);
  };

  const handleExcluirCampanha = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta campanha?")) {
      await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      mutate(); // atualiza a lista
    }
  };

  const handleVerDetalhes = (campanha: Campaign) => {
    setViewingCampanha(campanha);
  };

  const handleSalvarCampanha = async (
    campanha: Omit<Campaign, "id" | "status" | "createdAt"> | Campaign
  ) => {
    if ("id" in campanha) {
      await fetch(`/api/campaigns/${campanha.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campanha),
      });
    } else {
      await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campanha),
      });
    }
    mutate();
    setIsOpen(false);
    setEditingCampanha(null);
  };

  const campanhasFiltradas = campanhas.filter((campanha) => {
    if (activeTab === "todas") return true;
    return campanha.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="paused">Pausadas</TabsTrigger>
            <TabsTrigger value="expired">Expiradas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={handleNovaCampanha} className="ml-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campanhasFiltradas.map((campanha) => (
          <CampanhaCard
            key={campanha.id}
            campanha={campanha}
            onEdit={() => handleEditarCampanha(campanha)}
            onDelete={() => handleExcluirCampanha(campanha.id)}
            onView={() => handleVerDetalhes(campanha)}
          />
        ))}
      </div>

      {/* Modal de criar/editar */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCampanha ? "Editar Campanha" : "Nova Campanha"}
            </DialogTitle>
          </DialogHeader>
          <CampanhaForm
            campanha={editingCampanha}
            onSubmit={handleSalvarCampanha}
            onCancel={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de visualização */}
      <Dialog
        open={!!viewingCampanha}
        onOpenChange={() => setViewingCampanha(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Campanha</DialogTitle>
          </DialogHeader>
          {viewingCampanha && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Nome</h3>
                <p>{viewingCampanha.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Categoria</h3>
                <p>{viewingCampanha.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Data de Início</h3>
                  <p>
                    {new Date(viewingCampanha.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Data de Fim</h3>
                  <p>
                    {new Date(viewingCampanha.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    viewingCampanha.status === "active"
                      ? "bg-green-100 text-green-800"
                      : viewingCampanha.status === "paused"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {traduzirStatus(viewingCampanha.status)}
                </span>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingCampanha(null)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    handleEditarCampanha(viewingCampanha);
                    setViewingCampanha(null);
                  }}
                >
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
