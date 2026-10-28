import { Suspense } from "react";
import MenuData from "@/app/menu-data";

type HomeProps = {
  searchParams: Promise<{
    qr?: string | string[];
  }>;
};

export default function Home({ searchParams }: HomeProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p>Memuat menu...</p>
        </main>
      }
    >
      <MenuData searchParams={searchParams} />
    </Suspense>
  );
}
