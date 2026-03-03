import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SheetView from "@/components/SheetView";
import { getSheetData } from "@/lib/data";
import { Zap } from "lucide-react";
import { getSheetName, SHEETS_MAPPING } from "@/lib/sheets";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GenericSheetPage({ params }: { params: { sheetSlug: string } }) {
    const { sheetSlug } = await params;
    const sheetName = getSheetName(sheetSlug);

    if (!sheetName) {
        notFound();
    }

    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div style={{ width: '100%', overflow: 'hidden' }}>
                <div className="landing-container" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '2rem' }}>
                    <div className="hero-content" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1000px', width: '100%' }}>
                        <h1 className="hero-title">
                            <span className="text-gradient">{sheetName}</span>
                        </h1>
                        <p className="hero-subtitle">
                            Master your coding interview with the <span className="hero-highlight">{sheetName}</span>.
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

    const data = await getSheetData(session.user.id, sheetName);

    return (
        <SheetView
            data={data}
            userName={session.user.name || "Coder"}
            sheetName={sheetName}
            author={{ name: "Striver", url: `https://takeuforward.org/` }}
        />
    );
}
