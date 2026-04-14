import { useState } from "react";
import { Key, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyInputProps {
  onKeyChange: (key: string) => void;
  hasKey: boolean;
}

export const ApiKeyInput = ({ onKeyChange, hasKey }: ApiKeyInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed.startsWith("sk-ant-")) {
      onKeyChange(trimmed);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onKeyChange("");
    setInputValue("");
  };

  if (!isOpen && hasKey) {
    return (
      <button
        onClick={() => { setIsOpen(true); setInputValue("••••••••"); }}
        className="p-2 rounded-sm text-lavender-dim/60 hover:text-lavender-dim hover:bg-lavender/5 transition-all"
        title="Using your API key — click to change"
      >
        <Key className="w-4 h-4" />
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-sm text-lavender-dim/60 hover:text-lavender-dim hover:bg-lavender/5 transition-all"
        title="Use your own Anthropic API key"
      >
        <Key className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type={showKey ? "text" : "password"}
          placeholder="sk-ant-..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-64 px-3 py-1.5 text-xs font-mono bg-surface-container-low/50 border border-lavender/15 rounded-sm text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:border-lavender/40"
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      <Button size="sm" onClick={handleSave} className="px-3 py-1 h-7 text-xs bg-gradient-primary text-foreground rounded-sm">
        Save
      </Button>
      {hasKey && (
        <Button size="sm" variant="ghost" onClick={handleClear} className="px-3 py-1 h-7 text-xs text-lavender-dim hover:text-foreground">
          Clear
        </Button>
      )}
      <button
        onClick={() => setIsOpen(false)}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
