"use client"
import dynamic from 'next/dynamic'

const OrchidGarden = dynamic(() => import('./components/OrchidScene'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
      Cargando...
    </div>
  )
})
export default function Home() {
  return (
    <OrchidGarden/>
  );
}
