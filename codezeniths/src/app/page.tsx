'use client'

import Navbar from "@/components/Navbar/Navbar";
import TopicsGrid from "@/components/Topic/Topics";
import { HeroSection } from "@/components/Hero/Hero";

export default function Home() {
  return (
    <div className="w-full h-full bg-background-light dark:bg-background-dark">
      <main className="w-full h-full flex items-center justify-center flex-col gap-10 py-32 px-16 bg-background-light dark:bg-background-dark sm:items-start">
        <Navbar />
        <HeroSection />
        <TopicsGrid />   
      </main>
    </div>
  );
}
