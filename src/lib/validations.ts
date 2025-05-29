// src/lib/validations.ts
import { z } from "zod";

export const CampaignStatusEnum = z.enum(["active", "paused", "expired"]);
export const CampaignCategoryEnum = z.enum([
  "marketing",
  "sales",
  "product",
  "events",
  "other",
]);

export const campaignSchema = z.object({
  name: z
    .string()
    .min(3, "O nome da campanha deve ter pelo menos 3 caracteres."),
  startDate: z.string().datetime("Formato de data de início inválido."),
  endDate: z.string().datetime("Formato de data final inválido."),
  status: CampaignStatusEnum.default("active"),
  category: CampaignCategoryEnum,
});

export const createCampaignSchema = campaignSchema
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "A data final deve ser maior que a data de início.",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      new Date(data.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "A data de início deve ser igual ou posterior à data atual.",
      path: ["startDate"],
    }
  );

export const updateCampaignSchema = campaignSchema.partial().refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: "A data final deve ser maior que a data de início.",
    path: ["endDate"],
  }
);
