// app/topics/[topic]/page.tsx

import Navbar from "@/components/Navbar/Navbar";
import SingleTopic from "@/components/SubTopic/SingleTopic";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export default async function TopicPage({ params }: PageProps) {
  const { topic } = await params;
  return (
    <div className="w-full h-full flex items-center justify-center bg-background-light dark:bg-background-dark">
      <main className="w-full h-full flex items-center justify-center flex-col gap-10 py-32 px-16 bg-background-light dark:bg-background-dark ">
            <Navbar />
            <SingleTopic slug={topic} />
        </main>
    </div>
  )
}