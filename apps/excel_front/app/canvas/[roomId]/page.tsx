import { RoomCanvas } from "@/components/RoomCanvas"

async function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    return <RoomCanvas roomId={roomId} />;
}

export default CanvasPage
