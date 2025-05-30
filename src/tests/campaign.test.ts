import { CampaignCategory, Campaign } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { cleanDatabase } from "./orchestrator";

beforeAll(async () => {
  await cleanDatabase();
});

describe("API /api/campaigns", () => {
  const baseUrl = "http://localhost:3000/api/campaigns";
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const sampleCampaign: Omit<Campaign, "id" | "createdAt" | "deletedAt"> = {
    name: "Campanha de Teste",
    startDate: tomorrow.toISOString(),
    endDate: afterTomorrow.toISOString(),
    category: "sales",
    status: "active",
  };

  test("POST / - cria uma nova campanha válida", async () => {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCampaign),
    });

    expect(res.status).toBe(201);

    const body: Campaign = await res.json();
    expect(body.name).toBe(sampleCampaign.name);
    expect(body.category).toBe(sampleCampaign.category);
    expect(body.status).toBe(sampleCampaign.status);
    expect(typeof body.id).toBe("string");
    expect(typeof body.createdAt).toBe("string");
  });

  test("POST / - retorna erro com dados inválidos", async () => {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }), // inválido
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toBeDefined();
  });

  test("GET / - retorna lista de campanhas (não deletadas)", async () => {
    const res = await fetch(baseUrl);
    expect(res.status).toBe(200);

    const body: Campaign[] = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty("name");
    expect(typeof body[0].id).toBe("string");
  });

  test("GET /:id - retorna uma campanha existente", async () => {
    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCampaign),
    });

    const created: Campaign = await createRes.json();

    const res = await fetch(`${baseUrl}/${created.id}`);
    expect(res.status).toBe(200);

    const body: Campaign = await res.json();
    expect(body.id).toBe(created.id);
  });

  test("GET /:id - retorna 404 se campanha não existir", async () => {
    const fakeId = uuidv4();
    const res = await fetch(`${baseUrl}/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test("PUT /:id - atualiza campanha existente", async () => {
    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCampaign),
    });

    const created: Campaign = await createRes.json();

    const updatePayload = {
      name: "Atualizada",
      category: "sales" as CampaignCategory,
    };

    const res = await fetch(`${baseUrl}/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    expect(res.status).toBe(200);
    const updated: Campaign = await res.json();
    expect(updated.name).toBe("Atualizada");
    expect(updated.category).toBe("sales");
  });

  test("PUT /:id - retorna 404 ao tentar atualizar campanha inexistente", async () => {
    const fakeId = uuidv4();

    const res = await fetch(`${baseUrl}/${fakeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Atualizada" }),
    });

    expect(res.status).toBe(404);
  });

  test("DELETE /:id - realiza soft delete", async () => {
    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCampaign),
    });

    const created: Campaign = await createRes.json();

    const deleteRes = await fetch(`${baseUrl}/${created.id}`, {
      method: "DELETE",
    });

    expect(deleteRes.status).toBe(200);

    const getRes = await fetch(`${baseUrl}/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  test("DELETE /:id - retorna 404 se já deletada", async () => {
    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCampaign),
    });

    const created: Campaign = await createRes.json();

    await fetch(`${baseUrl}/${created.id}`, { method: "DELETE" });
    const secondDelete = await fetch(`${baseUrl}/${created.id}`, {
      method: "DELETE",
    });

    expect(secondDelete.status).toBe(404);
  });
});
