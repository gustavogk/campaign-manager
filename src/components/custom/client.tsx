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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "../ui/label";

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
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

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
      mutate();
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

  const categorias = Array.from(new Set(campanhas.map((c) => c.category)));
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");
  const campanhasFiltradas = campanhas.filter((campanha) => {
    const statusOk = activeTab === "todas" || campanha.status === activeTab;
    const categoriaOk =
      categoriaSelecionada === "todas" ||
      campanha.category === categoriaSelecionada;

    const dataCampanhaInicio = new Date(campanha.startDate);
    const dataCampanhaFim = new Date(campanha.endDate);
    const filtroInicioOk =
      !dataInicio || dataCampanhaInicio >= new Date(dataInicio);
    const filtroFimOk = !dataFim || dataCampanhaFim <= new Date(dataFim);

    return statusOk && categoriaOk && filtroInicioOk && filtroFimOk;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Categoria:</Label>
            <Select
              value={categoriaSelecionada}
              onValueChange={(value) => setCategoriaSelecionada(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Data de Início:</Label>
            <input
              type="date"
              className="border rounded-md px-3 py-1 text-sm h-10"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Data de Fim:</Label>
            <input
              type="date"
              className="border rounded-md px-3 py-1 text-sm h-10"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setCategoriaSelecionada("todas");
                setDataInicio("");
                setDataFim("");
              }}
              className="mt-2 md:mt-0"
            >
              Limpar Filtros
            </Button>

            <Button onClick={handleNovaCampanha} className="mt-2 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Campanha
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Todas", value: "todas", color: "text-blue-600" },
          { label: "Ativas", value: "active", color: "text-green-600" },
          { label: "Pausadas", value: "paused", color: "text-yellow-600" },
          { label: "Expiradas", value: "expired", color: "text-red-600" },
        ].map((tab) => {
          const count = campanhas.filter((campanha) => {
            const statusOk =
              tab.value === "todas" || campanha.status === tab.value;
            const categoriaOk =
              categoriaSelecionada === "todas" ||
              campanha.category === categoriaSelecionada;

            const dataCampanhaInicio = new Date(campanha.startDate);
            const dataCampanhaFim = new Date(campanha.endDate);
            const filtroInicioOk =
              !dataInicio || dataCampanhaInicio >= new Date(dataInicio);
            const filtroFimOk =
              !dataFim || dataCampanhaFim <= new Date(dataFim);

            return statusOk && categoriaOk && filtroInicioOk && filtroFimOk;
          }).length;

          return (
            <Card
              key={tab.value}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                activeTab === tab.value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {tab.label}
                </CardTitle>
                <CardDescription>
                  Clique para ver campanhas{" "}
                  {tab.label !== "Todas" ? tab.label : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${tab.color}`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
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
