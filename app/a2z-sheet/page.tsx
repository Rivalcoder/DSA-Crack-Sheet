import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SheetView from "@/components/SheetView";
import { getSheetData } from "@/lib/data";
import { Zap, TreePine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function A2ZSheetPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div style={{ width: '100%', overflow: 'hidden' }}>
                <div className="landing-container" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '2rem' }}>
                    <div className="hero-content" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1000px', width: '100%' }}>
                        <h1 className="hero-title">
                            <span className="text-gradient">Striver's A2Z Sheet</span>
                        </h1>
                        <p className="hero-subtitle">
                            Master DSA with the most comprehensive sheet by Striver.
                        </p>
                        <div className="hero-actions">
                            <Link href="/login" className="btn-primary">
                                <Zap size={20} className="mr-2" />
                                Login to Track Progress
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const data = await getSheetData(session.user.id, 'Striver A2Z');

    return (
        <SheetView
            data={data}
            userName={session.user.name || "Coder"}
            sheetName="Striver A2Z"
            author={{ name: "Striver", url: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z" }}
        />
    );
}
