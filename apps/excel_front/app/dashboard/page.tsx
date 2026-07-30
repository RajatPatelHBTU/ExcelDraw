"use client";

import { Plus, PenTool, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { RoomCard } from "@/components/ui/room-card";
import { Input, ButtonB } from "@/components/ui/form-elements";
import Link from "next/link";
import { toast } from "sonner";
import ParticleBackground from "@/components/cinematic/ParticleBackground";
import { motion } from "framer-motion";

interface Room {
  id: number;
  slug: string;
  createdAt: string;
}

// Reusable animated flower component
function AnimatedFlower() {
  return (
    <div className="absolute right-10 bottom-20 opacity-30 pointer-events-none mix-blend-screen animate-[spin_20s_linear_infinite]">
      <svg width="300" height="300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10C50 10 60 30 50 50C40 30 50 10 50 10Z" fill="url(#paint0_linear)"/>
        <path d="M90 50C90 50 70 60 50 50C70 40 90 50 90 50Z" fill="url(#paint1_linear)"/>
        <path d="M50 90C50 90 40 70 50 50C60 70 50 90 50 90Z" fill="url(#paint2_linear)"/>
        <path d="M10 50C10 50 30 40 50 50C30 60 10 50 10 50Z" fill="url(#paint3_linear)"/>
        <path d="M78.2843 21.7157C78.2843 21.7157 71.2132 42.9289 50 50C64.1421 35.8579 78.2843 21.7157 78.2843 21.7157Z" fill="url(#paint4_linear)"/>
        <path d="M78.2843 78.2843C78.2843 78.2843 57.0711 71.2132 50 50C64.1421 64.1421 78.2843 78.2843 78.2843 78.2843Z" fill="url(#paint5_linear)"/>
        <path d="M21.7157 78.2843C21.7157 78.2843 28.7868 57.0711 50 50C35.8579 64.1421 21.7157 78.2843 21.7157 78.2843Z" fill="url(#paint6_linear)"/>
        <path d="M21.7157 21.7157C21.7157 21.7157 42.9289 28.7868 50 50C35.8579 35.8579 21.7157 21.7157 21.7157 21.7157Z" fill="url(#paint7_linear)"/>
        <circle cx="50" cy="50" r="6" fill="#3B82F6"/>
        <defs>
          <linearGradient id="paint0_linear" x1="50" y1="10" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
          <linearGradient id="paint1_linear" x1="90" y1="50" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
          <linearGradient id="paint2_linear" x1="50" y1="90" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
          <linearGradient id="paint3_linear" x1="10" y1="50" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
          <linearGradient id="paint4_linear" x1="78.2843" y1="21.7157" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
          <linearGradient id="paint5_linear" x1="78.2843" y1="78.2843" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
          <linearGradient id="paint6_linear" x1="21.7157" y1="78.2843" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
          <linearGradient id="paint7_linear" x1="21.7157" y1="21.7157" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Bloading, setBLoading] = useState(false);
  const [slug, setSlug] = useState("");
  const router = useRouter();
  const token = Cookies.get("token");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!token) router.push('/auth');
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${HTTP_BACKEND}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(response.data.rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to fetch rooms.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBLoading(true);

    try {
      const response = await axios.post(`${HTTP_BACKEND}/room`, {
        name: slug
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.roomId !== undefined) {
        toast.success("Room created successfully!");
        router.push(`/canvas/${response.data.roomId}`);
      } else {
        toast.error("Room currently unavailable. Please try again.");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-[#010101] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <ParticleBackground />
      <AnimatedFlower />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 md:px-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <PenTool className="h-4 w-4 text-black" />
          </span>
          <span className="text-xl font-bold tracking-tight">exceldraw</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Dashboard</span>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto pt-16 px-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tight mb-2">
              Your Workspace
            </h1>
            <p className="text-gray-400">Select a room to start collaborating</p>
          </div>
        </motion.div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton Loading
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))
          ) : (
            rooms.map((room: Room, i: number) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/canvas/${room.id}`}>
                  <Card
                    className="group h-44 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-blue-500/20 bg-black/40 border-white/10 hover:border-white/20 backdrop-blur-md"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-20 p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <PenTool className="w-4 h-4 text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                            {room.slug}
                          </h3>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant="outline"
                          className="bg-white/5 border-white/10 text-gray-400 group-hover:text-gray-300 group-hover:border-white/20"
                        >
                          {new Date(room.createdAt).toLocaleDateString()}
                        </Badge>
                        <span className="text-sm font-medium text-gray-500 group-hover:text-white transition-colors flex items-center gap-1">
                          Open <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
        
        {!loading && rooms.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <LayoutDashboard className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">Create your first room to start drawing and collaborating with your team.</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8">
              Create a Room
            </Button>
          </motion.div>
        )}
      </main>

      {/* Create Room FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Button
          className="w-16 h-16 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.3)] bg-blue-600 hover:bg-blue-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all duration-300"
          size="icon"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </motion.div>

      <RoomCard isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-2 text-white">Create New Room</h2>
          <p className="text-gray-400 text-sm mb-6">Give your new collaborative space a name.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                placeholder="e.g. Brainstorming Session"
                aria-label="Room name"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 transition-colors"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSlug(event.target.value);
                }}
              />
            </div>
            <ButtonB 
              type="submit" 
              Bloading={Bloading}
              className="w-full bg-white text-black hover:bg-gray-200 transition-colors font-semibold py-6 rounded-lg"
            >
              {Bloading ? "Creating..." : "Create Room"}
            </ButtonB>
          </form>
        </div>
      </RoomCard>
    </div>
  );
}