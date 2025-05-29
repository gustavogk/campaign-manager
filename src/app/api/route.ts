import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCampaignSchema } from "@/lib/validations";
import { CampaignStatus } from "@prisma/client";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        deletedAt: null,
      },
    });

    const updatedCampaigns = campaigns.map((campaign) => {
      if (campaign.endDate < new Date() && campaign.status !== "expired") {
        return { ...campaign, status: CampaignStatus.expired };
      }
      return campaign;
    });

    return NextResponse.json(updatedCampaigns);
  } catch (error) {
    console.error("Erro ao listar campanhas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor.", error: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCampaignSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, startDate, endDate, category, status } = validatedData.data;

    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category,
        status: status || CampaignStatus.active,
      },
    });

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar campanha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor.", error: error },
      { status: 500 }
    );
  }
}
