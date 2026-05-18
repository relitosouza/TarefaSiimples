'use client';

import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

export function OpenReportButton() {
  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent('open-general-report'));
  };

  return (
    <Button 
      variant="outline"
      onClick={handleOpen}
      className="rounded-2xl border-primary/20 hover:border-primary px-4 py-2 flex items-center gap-2 transition-all shrink-0 font-bold text-xs md:text-sm uppercase tracking-wider"
      aria-label="Abrir Relatório Geral"
    >
      <ClipboardList className="h-4 w-4 text-primary" />
      <span>Relatório Geral</span>
    </Button>
  );
}
