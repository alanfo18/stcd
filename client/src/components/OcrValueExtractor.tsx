import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Tesseract from "tesseract.js";

interface OcrValueExtractorProps {
  onValueExtracted: (value: number) => void;
  disabled?: boolean;
}

export function OcrValueExtractor({ onValueExtracted, disabled = false }: OcrValueExtractorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedValue, setExtractedValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const extractValueFromImage = async (file: File) => {
    setIsProcessing(true);
    setError("");
    setExtractedValue("");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string;
          
          // Usar Tesseract para extrair texto da imagem
          const { data: { text } } = await Tesseract.recognize(imageData, "por");
          
          // Procurar por padrões de valores monetários (R$ XXX,XX ou XXX.XXX,XX)
          const valuePatterns = [
            /R\$\s*(\d+[.,]\d{2})/gi,
            /(\d+[.,]\d{2})\s*(?:reais|R\$)?/gi,
            /valor:\s*(\d+[.,]\d{2})/gi,
            /total:\s*(\d+[.,]\d{2})/gi,
          ];

          let foundValue = "";
          for (const pattern of valuePatterns) {
            const match = text.match(pattern);
            if (match) {
              foundValue = match[0];
              break;
            }
          }

          if (foundValue) {
            // Converter formato brasileiro (1.234,56) para número
            const cleanValue = foundValue
              .replace(/[^\d,]/g, "")
              .replace(".", "")
              .replace(",", ".");
            
            const numericValue = parseFloat(cleanValue);
            if (!isNaN(numericValue)) {
              setExtractedValue(numericValue.toFixed(2));
              onValueExtracted(numericValue);
            } else {
              setError("Não foi possível extrair um valor válido da imagem");
            }
          } else {
            setError("Nenhum valor monetário encontrado na imagem. Digite manualmente.");
          }
        } catch (err) {
          setError("Erro ao processar a imagem. Tente novamente.");
          console.error("OCR Error:", err);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Erro ao ler o arquivo");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Extrair Valor do Comprovante (OCR)</Label>
      <div className="flex gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              extractValueFromImage(e.target.files[0]);
            }
          }}
          disabled={isProcessing || disabled}
          className="flex-1"
        />
        {isProcessing && (
          <Button disabled className="w-32">
            Processando...
          </Button>
        )}
      </div>
      
      {extractedValue && (
        <div className="p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            ✅ Valor extraído: <strong>R$ {extractedValue}</strong>
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ {error}
          </p>
        </div>
      )}
    </div>
  );
}

