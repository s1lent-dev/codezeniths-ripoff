'use client'

import Navbar from "@/components/Navbar/Navbar";
import Sheets from "@/components/Sheet/Sheets";
import TopicsGrid from "@/components/Topic/Topics";

export default function Home() {
  return (
    <div className="w-full h-full bg-background-light dark:bg-background-dark">
      <main className="w-full h-full flex items-center justify-center flex-col gap-10 py-32 px-16 bg-background-light dark:bg-background-dark sm:items-start">
        <Navbar />
        <Sheets />   
        <TopicsGrid />   
      </main>
    </div>
  );
}
