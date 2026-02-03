import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SheetView from "@/components/SheetView";
import { InteractiveShowcase } from "@/components/InteractiveShowcase";
import Problem from "@/models/Problem";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { BrainCircuit, TrendingUp, CirclePile, TreePine, ShieldCheck, ArrowRight, Sparkles, Zap } from "lucide-react";

interface SheetData {
  title: string;
  patterns: {
    title: string;
    problems: any[];
  }[];
}

async function getData(userId: string): Promise<SheetData[]> {
  try {
    await dbConnect();
    const problems = await Problem.find({}).sort({ problemId: 1 }).lean();
    const user = await User.findById(userId).select("completedProblems").lean();

    const sections: any = {};
    const userCompleted = (user?.completedProblems || []).map((id: any) => id.toString());

    problems.forEach((p: any) => {
      const secTitle = p.section || "General";
      const patTitle = p.pattern || "General";

      if (!sections[secTitle]) {
        sections[secTitle] = { title: secTitle, patterns: {} };
      }
      if (!sections[secTitle].patterns[patTitle]) {
        sections[secTitle].patterns[patTitle] = { title: patTitle, problems: [] };
      }
      sections[secTitle].patterns[patTitle].problems.push({
        _id: p._id.toString(),
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        isCompleted: userCompleted.includes(p._id.toString())
      });
    });

    return Object.values(sections).map((sec: any) => ({
      ...sec,
      patterns: Object.values(sec.patterns)
    }));
  } catch (error) {
    console.error("DB Fetch Error:", error);
    return [];
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div style={{ width: '100%', overflow: 'hidden' }}>

        {/* HERO SECTION - Full Viewport Height */}
        <div className="landing-container" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '2rem' }}>

          {/* Animated Background Blobs */}
          <div className="pt-32 hero-blob blob-left animate-float"></div>
          <div className="hero-blob blob-right animate-float delay-200"></div>

          <div className="hero-content" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1000px', width: '100%' }}>

            {/* 3D Animated Icon Area */}
            <div className="mb-10 mt-10 relative animate-float" style={{ marginTop: '3rem' }}>
              <div className="absolute inset-0 bg-amber-500/20 blur-[50px] rounded-full"></div>
              <div className="relative z-10 p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <TreePine size={64} color="indigo" className="text-gray-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse" />
              </div>
            </div>

            <h1 className="hero-title animate-slideUp" style={{ marginTop: '2rem' }}>
              <span className="text-gradient">DSA Interview Crack</span>
            </h1>

            <p className="hero-subtitle animate-slideUp delay-100">
              Master Data Structures and Algorithms with a{" "}
              <span className="hero-highlight">premium, interactive experience</span>.
              Track your progress, visualize your growth, and ace your coding interviews.
            </p>

            <div className="hero-actions animate-slideUp delay-200">
              <Link href="/login" className="btn-primary">
                <Zap size={20} className="mr-2" />
                Start Tracking Now
              </Link>
              <Link href="/register" className="btn-secondary">
                Create an Account
              </Link>
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div style={{ padding: '0 2rem 5rem', position: 'relative', zIndex: 1 }}>
          <div className="features-grid animate-slideUp delay-300" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass-card">
              <div className="icon-box icon-indigo">
                <TrendingUp size={28} />
              </div>
              <h3 className="card-title">Track Progress</h3>
              <p className="card-desc">Visual indicators and progress bars to keep you motivated and on track.</p>
            </div>

            <div className="glass-card">
              <div className="icon-box icon-secondary">
                <BrainCircuit size={28} />
              </div>
              <h3 className="card-title">Algorithm Mastery</h3>
              <p className="card-desc">Curated list of problems designed to help you crack coding interviews.</p>
            </div>

            <div className="glass-card">
              <div className="icon-box icon-cyan">
                <ShieldCheck size={28} />
              </div>
              <h3 className="card-title">Secure & Cloud</h3>
              <p className="card-desc">Your progress is saved securely and accessible from anywhere.</p>
            </div>
          </div>
        </div>

        {/* SHOWCASE SECTION */}
        <div style={{ marginTop: '0', paddingBottom: '5rem' }}>
          <InteractiveShowcase />
        </div>

      </div>
    );
  }

  const data = await getData(session.user.id);

  return (
    <div className="user-container">
      <div className="user-welcome animate-fadeIn">
        <h1>
          Welcome Back, <span className="text-gradient">{session.user.name || "Coder"}</span>
        </h1>
        <p>Let's continue your coding journey and conquer more problems.</p>
      </div>
      <div className="animate-slideUp delay-100">
        <SheetView data={data} />
      </div>
    </div>
  );
}
