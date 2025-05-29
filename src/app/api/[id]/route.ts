import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateCampaignSchema } from "@/lib/validations";
import { CampaignStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const campaign = await prisma.campaign.findUnique({
      where: { id, deletedAt: null },
    });

    if (!campaign) {
      return NextResponse.json(
        { message: "Campanha não encontrada." },
        { status: 404 }
      );
    }

    if (campaign.endDate < new Date() && campaign.status !== "expired") {
      return NextResponse.json({ ...campaign, status: CampaignStatus.expired });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Erro ao obter campanha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor.", error: error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = updateCampaignSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { message: "Campanha não encontrada." },
        { status: 404 }
      );
    }

    const { startDate, endDate, ...rest } = validatedData.data;

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : existingCampaign.startDate,
        endDate: endDate ? new Date(endDate) : existingCampaign.endDate,
      },
    });

    if (
      updatedCampaign.endDate < new Date() &&
      updatedCampaign.status !== "expired"
    ) {
      await prisma.campaign.update({
        where: { id },
        data: { status: CampaignStatus.expired },
      });
      return NextResponse.json({
        ...updatedCampaign,
        status: CampaignStatus.expired,
      });
    }

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Erro ao atualizar campanha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor.", error: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { message: "Campanha não encontrada ou já deletada." },
        { status: 404 }
      );
    }

    await prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Campanha excluída com sucesso (soft delete)." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir campanha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor.", error: error },
      { status: 500 }
    );
  }
}
