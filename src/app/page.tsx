import { Suspense } from "react";
import MenuData from "@/app/menu-data";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p>Memuat menu...</p>
        </main>
      }
    >
      <MenuData />
    </Suspense>
  );
}
