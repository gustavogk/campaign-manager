"use client";

import { Campaign } from "../../lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampanhaCardProps {
  campanha: Campaign;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export default function CampanhaCard({
  campanha,
  onEdit,
  onDelete,
  onView,
}: CampanhaCardProps) {
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{campanha.name}</CardTitle>
          <Badge className={getStatusColor(campanha.status)}>
            {getStatusText(campanha.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {campanha.category}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {formatarData(campanha.startDate)} -{" "}
            {formatarData(campanha.endDate)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-1" /> Ver
        </Button>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
