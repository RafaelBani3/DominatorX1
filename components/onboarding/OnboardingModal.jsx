"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MultiStepForm from "@/components/onboarding/MultiStepForm";

export default function OnboardingModal({ open, onOpenChange, settings = {} }) {
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (open) setFormKey((k) => k + 1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="flex max-h-[min(92vh,900px)] w-full max-w-[calc(100%-1.25rem)] flex-col gap-0 overflow-hidden border border-border bg-white p-0 text-foreground shadow-2xl sm:max-w-3xl sm:rounded-2xl"
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border bg-white px-5 py-4 pr-12 text-left sm:px-6">
          <DialogTitle className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-foreground">
            Pendaftaran Member Baru
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lengkapi form di bawah ini untuk bergabung dengan Dominator XI.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 py-4 sm:px-6 sm:py-5">
          <MultiStepForm
            key={formKey}
            settings={settings}
            embedded
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
