"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleProblem } from '@/app/actions';
import { Check, ChevronRight, ExternalLink, Hash, Layout, Circle, CheckCircle2 } from 'lucide-react';
import styles from './SheetView.module.css';

interface Problem {
    _id: string;
    id: number;
    title: string;
    url: string;
    difficulty: string;
    isCompleted: boolean;
}

interface Pattern {
    title: string;
    problems: Problem[];
}

interface Section {
    title: string;
    patterns: Pattern[];
}

export default function SheetView({ data, userName }: { data: Section[], userName: string }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const totalProblems = data.reduce((acc, sec) => acc + sec.patterns.reduce((pAcc, pat) => pAcc + pat.problems.length, 0), 0);
    const completedProblems = data.reduce((acc, sec) => acc + sec.patterns.reduce((pAcc, pat) => pAcc + pat.problems.filter(p => p.isCompleted).length, 0), 0);
    const progress = totalProblems === 0 ? 0 : (completedProblems / totalProblems) * 100;

    // Improved title cleaner
    const cleanStr = (str: string) => str.replace(/^[\d\sIVXivx]+[:.]\s*/, '').replace(/^Pattern\s*\d*[:\s]*/i, '').trim();

    return (
        <div className={styles.dashboardContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.iconBox}>
                        <Layout size={20} />
                    </div>
                    <span>Course Roadmap</span>
                </div>

                <div className={styles.navScroll}>
                    {data.map((section, idx) => {
                        const isActive = activeIdx === idx;
                        const totalSec = section.patterns.reduce((acc, p) => acc + p.problems.length, 0);
                        const completedSec = section.patterns.reduce((acc, p) => acc + p.problems.filter(pr => pr.isCompleted).length, 0);
                        const isFull = totalSec > 0 && totalSec === completedSec;

                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveIdx(idx)}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            >
                                <div className={styles.navContent}>
                                    <span className={styles.navText}>{cleanStr(section.title)}</span>
                                    {isFull && <CheckCircle2 size={16} className={styles.completedIcon} />}
                                </div>
                                {isActive && <motion.div layoutId="activeInd" className={styles.activeIndicator} />}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainArea}>

                {/* Dashboard Hero */}
                <div className={styles.dashboardHero}>
                    <div className={styles.welcomeSection}>
                        <h1>Welcome Back, <span className="text-gradient">{userName}</span></h1>
                        <p>Let's continue your journey to mastery.</p>
                    </div>

                    <div className={styles.progressRingWrapper}>
                        <div className={styles.statItem}>
                            <span className={styles.statVal}>{completedProblems}</span>
                            <span className={styles.statLabel}>Solved</span>
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
                            </div>
                        </div>

                        <div className={styles.statItem}>
                            <span className={styles.statVal}>{totalProblems - completedProblems}</span>
                            <span className={styles.statLabel}>Remaining</span>
                        </div>
                    </div>
                </div>

                {/* Active Section Content */}
                <div className={styles.contentWrapper}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeIdx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SectionView section={data[activeIdx]} cleaner={cleanStr} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function SectionView({ section, cleaner }: { section: Section, cleaner: (s: string) => string }) {
    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div className={styles.titleGroup}>
                    <h2>{cleaner(section.title)}</h2>
                    <span className={styles.patternCount}>{section.patterns.length} Patterns</span>
                </div>
                <div className={styles.headerLine} />
            </div>

            <div className={styles.patternsGrid}>
                {section.patterns.map((pattern, idx) => (
                    <div key={idx} className={styles.patternCard}>
                        <div className={styles.patternHeader}>
                            <h3 className={styles.patternTitle}>{cleaner(pattern.title)}</h3>
                        </div>
                        <div className={styles.problemsList}>
                            {pattern.problems.map(prob => (
                                <ProblemRow key={prob._id} problem={prob} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProblemRow({ problem }: { problem: Problem }) {
    const [completed, setCompleted] = useState(problem.isCompleted);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (isLoading) return;
        setIsLoading(true);
        const newState = !completed;
        setCompleted(newState);

        const res = await toggleProblem(problem._id, newState);
        if (!res.success) {
            setCompleted(!newState);
        }
        setIsLoading(false);
    };

    // Sanitize common URL issues
    const fixUrl = (url: string) => {
        if (!url) return "#";
        let fixed = url.trim();

        // Specific LeetCode fixes
        if (fixed.includes("leetcode.com")) {
            // Fix twosum 404
            fixed = fixed.replace("/twosum", "/two-sum");
            // Remove trailing slashes for consistency
            fixed = fixed.replace(/\/$/, "");
        }
        return fixed;
    };

    // Extract platform and potentially problem number
    const getMeta = (title: string, url: string, dbId?: number) => {
        const platform = url.includes("leetcode.com") ? "LeetCode" :
            url.includes("geeksforgeeks.org") ? "GFG" :
                url.includes("codingninjas.com") ? "CN" : null;

        // Use ID from DB if exists and not 0, otherwise detect from title
        let num: string | number | null = (dbId && dbId !== 0) ? dbId : null;
        if (!num) {
            const numMatch = title.match(/^(\d+)[.:\s]/);
            num = numMatch ? numMatch[1] : null;
        }

        if (!platform) return null;
        return num ? `${platform} #${num}` : platform;
    };

    const sanitizedUrl = fixUrl(problem.url);
    const meta = getMeta(problem.title, sanitizedUrl, problem.id);

    return (
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
                    <a
                        href={sanitizedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.problemTitleLink}
                    >
                        {problem.title.replace(/^\d+[.:\s]+/, '')}
                    </a>
                    {meta && <span className={styles.platformTag}>({meta})</span>}
                </div>
            </div>

            <div className={styles.rightGroup}>
                <span className={`${styles.badge} ${styles[problem.difficulty?.toLowerCase() || 'Medium']}`}>
                    {/*{problem.difficulty || 'DSA'}*/}
                    {'DSA'}
                </span>

                <a href={sanitizedUrl} target="_blank" rel="noreferrer" className={styles.solveBtn}>
                    Solve <ExternalLink size={12} />
                </a>
            </div>
        </div>
    );
}
