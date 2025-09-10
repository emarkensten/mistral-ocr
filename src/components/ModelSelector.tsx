"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Brain } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  {
    id: "gpt-5-mini-2025-08-07",
    name: "GPT-5 Mini",
    description: "Snabb och kostnadseffektiv"
  },
  {
    id: "gpt-5-2025-08-07", 
    name: "GPT-5",
    description: "Högsta prestanda"
  },
  {
    id: "gpt-5-nano-2025-08-07",
    name: "GPT-5 Nano", 
    description: "Snabbast och billigast"
  },
  {
    id: "gpt-4o-mini-2024-07-18",
    name: "GPT-4o Mini",
    description: "Balanserad prestanda"
  },
  {
    id: "chatgpt-4o-latest",
    name: "ChatGPT-4o Latest",
    description: "Senaste versionen"
  }
];

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const selectedModelInfo = models.find(m => m.id === selectedModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Brain className="h-3 w-3" />
          {selectedModelInfo?.name || "Välj modell"}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>AI-modell</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex flex-col items-start gap-1"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{model.name}</span>
              {selectedModel === model.id && (
                <span className="text-xs text-muted-foreground">(vald)</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {model.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
