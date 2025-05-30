"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Campaign } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CampanhaFormProps {
  campanha?: Campaign | null;
  onSubmit: (campanha: Omit<Campaign, "id" | "createdAt"> | Campaign) => void;
  onCancel: () => void;
}

const categorias = [
  "marketing",
  "sales",
  "product",
  "events",
  "other",
] as const;

export default function CampanhaForm({
  campanha,
  onSubmit,
  onCancel,
}: CampanhaFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    dataInicio: "",
    dataFim: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (campanha) {
      setFormData({
        nome: campanha.name,
        categoria: campanha.category,
        dataInicio: formatDateForInput(campanha.startDate),
        dataFim: formatDateForInput(campanha.endDate),
        status: campanha.status,
      });
    } else {
      const today = new Date();
      setFormData({
        nome: "",
        categoria: "",
        dataInicio: formatDateForInput(today.toISOString()),
        dataFim: "",
        status: "active",
      });
    }
  }, [campanha]);

  function formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const offsetDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return offsetDate.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:MM
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const hoje = new Date();

    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);

    if (!formData.nome.trim()) {
      newErrors.nome = "O nome da campanha é obrigatório";
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = "A categoria da campanha é obrigatória";
    }

    if (!formData.dataInicio) {
      newErrors.dataInicio = "A data de início é obrigatória";
    } else if (dataInicio < hoje && !campanha) {
      newErrors.dataInicio =
        "A data de início deve ser igual ou posterior à data atual";
    }

    if (!formData.dataFim) {
      newErrors.dataFim = "A data de fim é obrigatória";
    } else if (dataFim <= dataInicio) {
      newErrors.dataFim = "A data de fim deve ser posterior à data de início";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const payload = {
        name: formData.nome,
        category: formData.categoria as Campaign["category"],
        startDate: new Date(formData.dataInicio).toISOString(),
        endDate: new Date(formData.dataFim).toISOString(),
        status: formData.status as Campaign["status"],
      };

      if (campanha) {
        onSubmit({ ...campanha, ...payload });
      } else {
        onSubmit(payload);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, corrija os erros no formulário antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Campanha</Label>
        <Input
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className={errors.nome ? "border-red-500" : ""}
        />
        {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoria</Label>
        <select
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className={`w-full border px-3 py-2 rounded-md ${
            errors.categoria ? "border-red-500" : ""
          }`}
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat[0].toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {errors.categoria && (
          <p className="text-sm text-red-500">{errors.categoria}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data de Início</Label>
          <Input
            id="dataInicio"
            name="dataInicio"
            type="datetime-local"
            value={formData.dataInicio}
            onChange={handleChange}
            className={errors.dataInicio ? "border-red-500" : ""}
          />
          {errors.dataInicio && (
            <p className="text-sm text-red-500">{errors.dataInicio}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataFim">Data de Fim</Label>
          <Input
            id="dataFim"
            name="dataFim"
            type="datetime-local"
            value={formData.dataFim}
            onChange={handleChange}
            className={errors.dataFim ? "border-red-500" : ""}
          />
          {errors.dataFim && (
            <p className="text-sm text-red-500">{errors.dataFim}</p>
          )}
        </div>
      </div>

      {campanha && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
            <option value="expired">Expirada</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {campanha ? "Atualizar" : "Criar"} Campanha
        </Button>
      </div>
    </form>
  );
}
