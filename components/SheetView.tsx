"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleProblem, toggleSaveProblem, updateProblemNote } from '@/app/actions';
import { Check, ChevronRight, ExternalLink, Hash, Layout, Circle, CheckCircle2, Star, StickyNote, Send, X, Search, Shuffle, Filter, Bookmark } from 'lucide-react';
import styles from './SheetView.module.css';

interface Problem {
    _id: string;
    id: number;
    title: string;
    url: string;
    yt_url?: string;
    difficulty: string;
    isCompleted: boolean;
    isSaved: boolean;
    note?: string;
}

interface Pattern {
    title: string;
    problems: Problem[];
}

interface Section {
    title: string;
    patterns: Pattern[];
}

export default function SheetView({ data, userName, sheetName, author }: { data: Section[], userName: string, sheetName: string, author?: { name: string, url: string } }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [view, setView] = useState<"home" | "steps">("home");
    const [isHydrated, setIsHydrated] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "revision" | "search">("all");
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

    // PERSISTENCE: Restore navigation state from localStorage on mount
    React.useEffect(() => {
        const savedView = localStorage.getItem(`dsa_view_${sheetName}`);
        const savedIdx = localStorage.getItem(`dsa_idx_${sheetName}`);

        if (savedView === "home" || savedView === "steps") {
            setView(savedView);
        }
        if (savedIdx !== null) {
            const idx = parseInt(savedIdx);
            if (!isNaN(idx) && idx >= 0 && idx < data.length) {
                setActiveIdx(idx);
            }
        }
        setIsHydrated(true);
    }, [data.length, sheetName]);

    // PERSISTENCE: Save navigation state on change
    React.useEffect(() => {
        if (!isHydrated) return;
        localStorage.setItem(`dsa_view_${sheetName}`, view);
        localStorage.setItem(`dsa_idx_${sheetName}`, activeIdx.toString());
    }, [view, activeIdx, sheetName, isHydrated]);

    // OPTIMISTIC UI: Track completed IDs locally for instant progress bar updates
    const [optimisticCompleted, setOptimisticCompleted] = useState<Set<string>>(() => {
        const completed = new Set<string>();
        data.forEach(sec => sec.patterns.forEach(pat => pat.problems.forEach(p => {
            if (p.isCompleted) completed.add(p._id);
        })));
        return completed;
    });

    // Sync optimistic state when data from server changes
    React.useEffect(() => {
        const completed = new Set<string>();
        data.forEach(sec => sec.patterns.forEach(pat => pat.problems.forEach(p => {
            if (p.isCompleted) completed.add(p._id);
        })));
        setOptimisticCompleted(completed);
    }, [data]);

    const handleToggleOptimistic = (problemId: string, isCompleted: boolean) => {
        setOptimisticCompleted(prev => {
            const next = new Set(prev);
            if (isCompleted) next.add(problemId);
            else next.delete(problemId);
            return next;
        });
    };

    const totalProblems = data.reduce((acc, sec) => acc + sec.patterns.reduce((pAcc, pat) => pAcc + pat.problems.length, 0), 0);
    const completedProblems = optimisticCompleted.size;
    const progress = totalProblems === 0 ? 0 : (completedProblems / totalProblems) * 100;

    // Flatten all problems for "All Problems" view or Search
    const allProblemsList = data.flatMap(sec => sec.patterns.flatMap(pat => pat.problems.map(p => ({ ...p, sectionTitle: sec.title, patternTitle: pat.title }))));
    const savedProblemsList = allProblemsList.filter(p => p.isSaved);

    const filteredProblems = () => {
        let list = allProblemsList;
        if (filter === "revision") list = savedProblemsList;
        if (searchQuery) {
            list = list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (difficultyFilter) {
            list = list.filter(p => p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase());
        }
        return list;
    };

    const handleRandomProblem = () => {
        const lcList = allProblemsList.filter(p => p.url?.toLowerCase().includes("leetcode.com"));
        if (lcList.length === 0) return;
        const random = lcList[Math.floor(Math.random() * lcList.length)];
        if (random) window.open(random.url, '_blank');
    };

    // Difficulty stats derived from optimistic state
    const diffStats = {
        easy: { total: 0, completed: 0 },
        medium: { total: 0, completed: 0 },
        hard: { total: 0, completed: 0 },
        dsa: { total: 0, completed: 0 }
    };

    data.forEach(sec => sec.patterns.forEach(pat => pat.problems.forEach(p => {
        const d = p.difficulty?.toLowerCase() || 'medium';
        const isCompleted = optimisticCompleted.has(p._id);
        if (d === 'easy') { diffStats.easy.total++; if (isCompleted) diffStats.easy.completed++; }
        else if (d === 'hard') { diffStats.hard.total++; if (isCompleted) diffStats.hard.completed++; }
        else if (d === 'dsa') { diffStats.dsa.total++; if (isCompleted) diffStats.dsa.completed++; }
        else { diffStats.medium.total++; if (isCompleted) diffStats.medium.completed++; }
    })));

    // Intelligent title cleaner for a professional sidebar
    const cleanStr = (str: string) => {
        if (!str) return "";
        return str
            .replace(/\\u0026/g, '&')               // Handle Unicode Ampersand
            .replace(/&amp;/g, '&')                 // Handle HTML Ampersand
            .replace(/Step\s*\d+[:.-]?/i, '')        // Step 1:
            .replace(/^[IVXLC]+\.?\s+/i, '')        // I. II. 
            .replace(/\[.*?\]/g, '')                // [Easy -> Hard]
            .replace(/Solve Problems on\s+/i, '')    // Solve Problems on 
            .replace(/Learn Important\s+/i, '')      // Learn Important
            .replace(/Important\s+/i, '')           // Important
            .replace(/Techniques/i, '')             // Techniques
            .replace(/-\u003e/g, '')                // Unicode arrows
            .replace(/->/g, '')                     // Standard arrows
            .trim();
    };

    if (!isHydrated) return <div className={styles.dashboardContainer} />;

    return (
        <div className={styles.dashboardContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader} onClick={() => setView("home")} style={{ cursor: 'pointer' }}>
                    <div className={styles.iconBox}>
                        <Layout size={24} />
                    </div>
                    <div className={styles.sheetMeta}>
                        <span className={styles.sheetTitleText}>{sheetName}</span>
                    </div>
                </div>

                <div className={styles.navScroll}>
                    {data.map((section, idx) => {
                        const isActive = view === "steps" && activeIdx === idx;
                        const totalSec = section.patterns.reduce((acc, p) => acc + p.problems.length, 0);
                        const completedSec = section.patterns.reduce((acc, p) => acc + p.problems.filter(pr => pr.isCompleted).length, 0);
                        const isFull = totalSec > 0 && totalSec === completedSec;

                        return (
                            <button
                                key={idx}
                                onClick={() => { setActiveIdx(idx); setView("steps"); }}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''} ${isFull ? styles.navItemCompleted : ''}`}
                            >
                                <div className={styles.navContent}>
                                    <span className={styles.navText}>{cleanStr(section.title)}</span>
                                    {isFull && <CheckCircle2 size={16} className={styles.completedIcon} />}
                                    <ChevronRight size={14} className={styles.navArrow} />
                                </div>
                                {isActive && <motion.div layoutId="activeInd" className={styles.activeIndicator} />}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainArea}>

                {/* Compact Header (Dashboard/Section) */}
                <div className={styles.compactHeader}>
                    <div className={styles.headerFlex}>
                        <div className={styles.titleArea}>
                            <h1>{view === "home" ? "DSA Dashboard" : cleanStr(data[activeIdx].title)}</h1>
                            <p className={styles.headerSubtext}>
                                {view === "home"
                                    ? "Overview of your coding progress and mastery."
                                    : "Step through these problems to master this topic."}
                            </p>
                        </div>

                        {view === "steps" && (
                            <div className={styles.headerStatsSide}>
                                <div className={styles.statValue}>
                                    <span className={styles.countNum}>
                                        {data[activeIdx].patterns.reduce((acc, p) => acc + p.problems.filter(pr => optimisticCompleted.has(pr._id)).length, 0)}
                                    </span>
                                    <span className={styles.countTotal}>
                                        / {data[activeIdx].patterns.reduce((acc, p) => acc + p.problems.length, 0)} Mastered
                                    </span>
                                </div>
                                <div className={styles.headerMiniBar}>
                                    <motion.div
                                        className={styles.headerMiniBarFill}
                                        initial={false}
                                        animate={{ width: `${(data[activeIdx].patterns.reduce((acc, p) => acc + p.problems.filter(pr => optimisticCompleted.has(pr._id)).length, 0) / (data[activeIdx].patterns.reduce((acc, p) => acc + p.problems.length, 0) || 1)) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Active Content Area */}
                <div className={styles.contentWrapper}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={view + filter + searchQuery + activeIdx + (difficultyFilter || "")}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {view === "home" ? (
                                <>
                                    {/* Dashboard Hero */}
                                    <div className={styles.dashboardHero}>
                                        <div className={styles.welcomeSection}>
                                            <h1>Welcome Back, <span className="text-gradient">{userName}</span></h1>
                                            <p>Let's continue your journey to mastery.</p>
                                        </div>

                                        <div className={styles.progressRingWrapper}>
                                            <div className={styles.difficultyStats}>
                                                <div className={styles.diffItem}>
                                                    <div className={styles.diffLabel}>
                                                        <span>DSA Problems</span>
                                                        <span>{diffStats.dsa.completed}/{diffStats.dsa.total}</span>
                                                    </div>
                                                    <div className={styles.progressBar}><div className={styles.barFillDsa} style={{ width: `${(diffStats.dsa.completed / (diffStats.dsa.total || 1)) * 100}%` }} /></div>
                                                </div>
                                                <div className={styles.diffItem}>
                                                    <div className={styles.diffLabel}>
                                                        <span>Easy</span>
                                                        <span>{diffStats.easy.completed}/{diffStats.easy.total}</span>
                                                    </div>
                                                    <div className={styles.progressBar}><div className={styles.barFillEasy} style={{ width: `${(diffStats.easy.completed / (diffStats.easy.total || 1)) * 100}%` }} /></div>
                                                </div>
                                                <div className={styles.diffItem}>
                                                    <div className={styles.diffLabel}>
                                                        <span>Medium</span>
                                                        <span>{diffStats.medium.completed}/{diffStats.medium.total}</span>
                                                    </div>
                                                    <div className={styles.progressBar}><div className={styles.barFillMedium} style={{ width: `${(diffStats.medium.completed / (diffStats.medium.total || 1)) * 100}%` }} /></div>
                                                </div>
                                                <div className={styles.diffItem}>
                                                    <div className={styles.diffLabel}>
                                                        <span>Hard</span>
                                                        <span>{diffStats.hard.completed}/{diffStats.hard.total}</span>
                                                    </div>
                                                    <div className={styles.progressBar}><div className={styles.barFillHard} style={{ width: `${(diffStats.hard.completed / (diffStats.hard.total || 1)) * 100}%` }} /></div>
                                                </div>
                                            </div>

                                            <div className={styles.ringContainer}>
                                                <svg className={styles.progressSvg} viewBox="0 0 100 100">
                                                    <circle className={styles.bgCircle} cx="50" cy="50" r="45" />
                                                    <circle
                                                        className={styles.fgCircle}
                                                        cx="50" cy="50" r="45"
                                                        strokeDasharray={`${progress * 2.83} 283`}
                                                    />
                                                </svg>
                                                <div className={styles.ringText}>
                                                    <span className={styles.percentText}>{Math.round(progress)}%</span>
                                                    <span className={styles.solvedText}>{completedProblems}/{totalProblems}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Filters & Search */}
                                    <div className={styles.controlsBar}>
                                        <div className={styles.filterTabs}>
                                            <button
                                                className={`${styles.tabBtn} ${filter === 'all' ? styles.tabActive : ''}`}
                                                onClick={() => { setFilter('all'); setDifficultyFilter(null); }}
                                            >
                                                <Layout size={16} /> All Problems
                                            </button>
                                            <button
                                                className={`${styles.tabBtn} ${filter === 'revision' ? styles.tabActive : ''}`}
                                                onClick={() => setFilter('revision')}
                                            >
                                                <Star size={16} /> Revision
                                            </button>
                                            <button
                                                className={styles.tabBtn}
                                                onClick={handleRandomProblem}
                                            >
                                                <Shuffle size={16} /> Random
                                            </button>
                                        </div>

                                        <div className={styles.searchAndDiff}>
                                            <div className={styles.difficultySelect}>
                                                <button
                                                    className={`${styles.diffFilterBtn} ${difficultyFilter === 'DSA' ? styles.diffActiveDsa : ''}`}
                                                    onClick={() => setDifficultyFilter(difficultyFilter === 'DSA' ? null : 'DSA')}
                                                >
                                                    DSA
                                                </button>
                                                <button
                                                    className={`${styles.diffFilterBtn} ${difficultyFilter === 'Easy' ? styles.diffActiveEasy : ''}`}
                                                    onClick={() => setDifficultyFilter(difficultyFilter === 'Easy' ? null : 'Easy')}
                                                >
                                                    Easy
                                                </button>
                                                <button
                                                    className={`${styles.diffFilterBtn} ${difficultyFilter === 'Medium' ? styles.diffActiveMedium : ''}`}
                                                    onClick={() => setDifficultyFilter(difficultyFilter === 'Medium' ? null : 'Medium')}
                                                >
                                                    Medium
                                                </button>
                                                <button
                                                    className={`${styles.diffFilterBtn} ${difficultyFilter === 'Hard' ? styles.diffActiveHard : ''}`}
                                                    onClick={() => setDifficultyFilter(difficultyFilter === 'Hard' ? null : 'Hard')}
                                                >
                                                    Hard
                                                </button>
                                            </div>
                                            <div className={styles.searchWrapper}>
                                                <Search size={18} className={styles.searchIcon} />
                                                <input
                                                    type="text"
                                                    placeholder="Search problems..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className={styles.searchInput}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Global List in Home View */}
                                    <div className={styles.filteredListView}>
                                        <div className={styles.filteredListHeader}>
                                            <h2>
                                                {searchQuery ? "Search Results" :
                                                    filter === 'revision' ? "Saved for Revision" :
                                                        difficultyFilter ? `${difficultyFilter} Problems` : "DSA Master List"}
                                            </h2>
                                            <span className={styles.countTag}>{filteredProblems().length} Problems</span>
                                        </div>
                                        <div className={styles.globalProblemsList}>
                                            {filteredProblems().map(prob => (
                                                <ProblemRow
                                                    key={prob._id}
                                                    problem={prob}
                                                    onToggleCompletion={handleToggleOptimistic}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <SectionView
                                    section={data[activeIdx]}
                                    cleaner={cleanStr}
                                    optimisticCompleted={optimisticCompleted}
                                    onToggleCompletion={handleToggleOptimistic}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function SectionView({ section, cleaner, optimisticCompleted, onToggleCompletion }: { section: Section, cleaner: (s: string) => string, optimisticCompleted: Set<string>, onToggleCompletion: (id: string, state: boolean) => void }) {
    return (
        <div className={styles.sectionContainer}>
            <div className={styles.patternsGrid}>
                {section.patterns.map((pattern, idx) => {
                    const patTotal = pattern.problems.length;
                    const patComp = pattern.problems.filter(p => optimisticCompleted.has(p._id)).length;
                    const patPerc = patTotal === 0 ? 0 : (patComp / patTotal) * 100;

                    return (
                        <div key={idx} className={styles.patternCard}>
                            <div className={styles.patternHeader}>
                                <h3 className={styles.patternTitle}>{cleaner(pattern.title)}</h3>
                                <div className={styles.subtopicProgress}>
                                    <span className={styles.subtopicCount}>{patComp} / {patTotal} Mastered</span>
                                    <div className={styles.subtopicBar}>
                                        <motion.div
                                            className={styles.subtopicBarFill}
                                            initial={false}
                                            animate={{ width: `${patPerc}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.problemsList}>
                                {pattern.problems.map(prob => (
                                    <ProblemRow
                                        key={prob._id}
                                        problem={prob}
                                        onToggleCompletion={onToggleCompletion}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ProblemRow({ problem, onToggleCompletion }: { problem: Problem, onToggleCompletion: (id: string, state: boolean) => void }) {
    const [completed, setCompleted] = useState(problem.isCompleted);
    const [saved, setSaved] = useState(problem.isSaved);
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [note, setNote] = useState(problem.note || "");
    const [tempNote, setTempNote] = useState(problem.note || "");
    const [isLoading, setIsLoading] = useState(false);

    // Sync state if props change (important for real-time updates via revalidatePath)
    React.useEffect(() => {
        setCompleted(problem.isCompleted);
    }, [problem.isCompleted]);

    React.useEffect(() => {
        setSaved(problem.isSaved);
    }, [problem.isSaved]);

    React.useEffect(() => {
        setNote(problem.note || "");
        setTempNote(problem.note || "");
    }, [problem.note]);

    const handleToggle = async () => {
        if (isLoading) return;
        setIsLoading(true);
        const newState = !completed;

        // INSTANT UPDATE: Update local and global optimistic state immediately
        setCompleted(newState);
        onToggleCompletion(problem._id, newState);

        const res = await toggleProblem(problem._id, newState);
        if (!res.success) {
            // Revert on failure
            setCompleted(!newState);
            onToggleCompletion(problem._id, !newState);
        }
        setIsLoading(false);
    };

    const handleToggleSave = async () => {
        if (isLoading) return;
        setIsLoading(true);
        const newState = !saved;
        setSaved(newState);
        const res = await toggleSaveProblem(problem._id, newState);
        if (!res.success) setSaved(!newState);
        setIsLoading(false);
    };

    const handleSaveNote = async () => {
        setIsLoading(true);
        const res = await updateProblemNote(problem._id, tempNote);
        if (res.success) {
            setNote(tempNote);
            setShowNoteInput(false);
        }
        setIsLoading(false);
    };

    // Sanitize common URL issues
    const fixUrl = (url: string) => {
        if (!url) return "#";
        let fixed = url.trim();
        if (fixed.includes("leetcode.com")) {
            fixed = fixed.replace("/twosum", "/two-sum").replace(/\/$/, "");
        }
        return fixed;
    };

    const getMeta = (title: string, url: string, dbId?: number) => {
        const platform = url.includes("leetcode.com") ? "LeetCode" :
            url.includes("geeksforgeeks.org") ? "GFG" :
                url.includes("codingninjas.com") ? "CN" : null;
        let num: string | number | null = (dbId && dbId !== 0) ? dbId : null;
        if (!num) {
            const numMatch = title.match(/^(\d+)[.:\s]/);
            num = numMatch ? numMatch[1] : null;
        }
        if (!platform) return null;
        return num ? `${platform} #${num}` : platform;
    };

    const getPlatformIcon = (url: string) => {
        if (url.includes("leetcode.com")) {
            return (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className={styles.platformIconLc}>
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-2.04 2.04a1.001 1.001 0 0 1 1.414 1.414l2.04-2.04L13.483 0zM6.79 5.613c-.495 0-.949.221-1.264.576l-5.301 5.962a1.536 1.536 0 0 0 0 2.042l5.301 5.961c.315.355.769.576 1.264.576h10.42c.495 0 .949-.221 1.264-.576l5.301-5.961a1.536 1.536 0 0 0 0-2.042l-5.301-5.962c-.315-.355-.769-.576-1.264-.576H6.79zm.19 2.016h10.04a.276.276 0 0 1 .226.103l4.412 4.965a.276.276 0 0 1 0 .367l-4.412 4.965a.276.276 0 0 1-.226.103H6.98a.276.276 0 0 1-.226-.103l-4.412-4.965a.276.276 0 0 1 0-.367l4.412-4.965a.276.276 0 0 1 .226-.103zm2.597 1.218l-1.414 1.414 2.357 2.357-2.357 2.357 1.414 1.414 3.771-3.771-3.771-3.771z" />
                </svg>
            );
        }
        if (url.includes("geeksforgeeks.org")) return <div className={styles.platformIconGfg}>G</div>;
        if (url.includes("takeuforward.org")) return <div className={styles.platformIconTuf}>T</div>;
        return <ExternalLink size={16} />;
    };

    const sanitizedUrl = fixUrl(problem.url);
    const meta = getMeta(problem.title, sanitizedUrl, problem.id);

    return (
        <div className={styles.problemRowContainer}>
            <div className={`${styles.problemRow} ${completed ? styles.completed : ''}`}>
                <div className={styles.leftGroup}>
                    <button
                        onClick={handleToggle}
                        className={`${styles.checkbox} ${completed ? styles.checked : ''}`}
                        disabled={isLoading}
                    >
                        {completed && <Check size={14} strokeWidth={4} />}
                    </button>
                    <div className={styles.titleWrapper}>
                        <a href={sanitizedUrl} target="_blank" rel="noreferrer" className={styles.problemTitleLink}>
                            {problem.title.replace(/^\d+[.:\s]+/, '')}
                        </a>
                        {meta && <span className={styles.platformTag}>({meta})</span>}
                    </div>
                </div>

                <div className={styles.rightGroup}>
                    {problem.yt_url && (
                        <a href={problem.yt_url} target="_blank" rel="noreferrer" className={styles.ytBtn} title="Video Tutorial">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                        </a>
                    )}

                    <a href={sanitizedUrl} target="_blank" rel="noreferrer" className={styles.platformActionBtn} title="Solve Problem">
                        {getPlatformIcon(sanitizedUrl)}
                    </a>

                    <div className={styles.rightGroupActions}>
                        <button
                            onClick={handleToggleSave}
                            className={`${styles.starBtn} ${saved ? styles.starSaved : ''}`}
                            title="Save for Revision"
                        >
                            <Star size={16} fill={saved ? "#f59e0b" : "none"} />
                        </button>
                        <button
                            onClick={() => setShowNoteInput(!showNoteInput)}
                            className={`${styles.noteBtn} ${note ? styles.hasNote : ''}`}
                            title="Add/Edit Note"
                        >
                            <StickyNote size={16} />
                        </button>
                    </div>

                    <span className={`${styles.badge} ${styles[problem.difficulty?.toLowerCase() || 'medium']}`}>
                        {problem.difficulty || 'Easy'}
                    </span>
                </div>
            </div>

            {showNoteInput && (
                <div className={styles.noteArea}>
                    <div className={styles.noteInputContainer}>
                        <textarea
                            className={styles.noteInput}
                            placeholder="Write your revision notes or key concepts here..."
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.noteActions}>
                            <button className={styles.noteCancelBtn} onClick={() => setShowNoteInput(false)}>Cancel</button>
                            <button className={styles.noteSaveBtn} onClick={handleSaveNote} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Note"}
                            </button>
                        </div>

                        {note && (
                            <div className={styles.existingNotePreview}>
                                <strong>Current Note:</strong>
                                <p>{note}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}


        </div>
    );
}
