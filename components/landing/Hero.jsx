"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero({ onJoin }) {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-5 pb-16 pt-28 text-center md:px-8 md:pb-20 md:pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 md:mb-10"
        >
          <div className="relative mx-auto mb-5 h-28 w-28 md:h-36 md:w-36">
            <motion.div
              aria-hidden
              className="absolute -inset-4 rounded-full bg-emerald-400/20 blur-2xl"
              animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <Image
              src="/LOGO.png"
              alt="Dominator XI"
              fill
              priority
              sizes="(max-width: 768px) 112px, 144px"
              className="relative object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
            />
          </div>
          <p className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[0.08em] text-white md:text-6xl md:tracking-[0.1em]">
            DOMINATOR XI
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl"
        >
          Dominate the pitch.{" "}
          <span className="text-emerald-300">Together.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:mt-6 md:text-lg"
        >
          Komunitas FC Mobile paling kompetitif di Indonesia — tunjukkan skill,
          bangun squaddie, dan naik ke puncak.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
        >
          <Button
            size="lg"
            onClick={onJoin}
            className="h-12 rounded-xl bg-white px-8 text-sm font-semibold tracking-wide text-foreground hover:bg-white/90"
          >
            Gabung Sekarang
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-12 rounded-xl px-6 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Link href="#about">Pelajari lebih lanjut</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
