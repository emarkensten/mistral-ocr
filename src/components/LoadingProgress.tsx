"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, Brain, CheckCircle } from "lucide-react";

interface LoadingProgressProps {
  stage: string;
  model: string;
}

const stages = [
  { key: 'upload', label: 'Förbereder bild', icon: Zap },
  { key: 'optimize', label: 'Optimerar för OCR', icon: Zap },
  { key: 'api', label: 'Analyserar med AI', icon: Brain },
  { key: 'validate', label: 'Validerar resultat', icon: CheckCircle },
  { key: 'complete', label: 'Klar!', icon: CheckCircle }
];

export function LoadingProgress({ stage, model }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const stageIndex = stages.findIndex(s => stage.includes(s.key));
    if (stageIndex !== -1) {
      setCurrentStageIndex(stageIndex);
      setProgress((stageIndex + 1) * 20);
    }

    // Simulera progressiv laddning för AI-analys
    if (stage.includes('api')) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 80) return prev + 2;
          return prev;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [stage]);

  const getCurrentStage = () => {
    return stages[currentStageIndex] || stages[0];
  };

  const currentStage = getCurrentStage();
  const IconComponent = currentStage.icon;

  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <IconComponent className="h-6 w-6 text-primary" />
              {stage.includes('api') && (
                <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-primary" />
              )}
            </div>
            <div className="text-center">
              <p className="text-muted-foreground font-medium">{currentStage.label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Använder {model}
              </p>
            </div>
          </div>
          
          <Progress value={progress} className="w-full h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {stages.map((s, index) => (
              <div 
                key={s.key}
                className={`flex flex-col items-center ${
                  index <= currentStageIndex ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <s.icon className="h-3 w-3 mb-1" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded p-2">
            <p>⏱️ Detta kan ta upp till 60 sekunder för komplexa kvitton</p>
            <p className="mt-1">🧠 AI:n analyserar text, datum, belopp och kategorisering</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
