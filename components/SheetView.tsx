"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleProblem } from '@/app/actions';
import { Check, ChevronRight, ExternalLink, Hash, Layout, Circle } from 'lucide-react';
import styles from './SheetView.module.css';

interface Problem {
    _id: string;
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
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveIdx(idx)}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            >
                                <span className={styles.navText}>{cleanStr(section.title)}</span>
                                {isActive && <motion.div layoutId="activeInd" className={styles.activeIndicator} />}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainArea}>

                {/* Dashboard Hero: Welcome & Progress */}
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

    return (
        <div className={`${styles.problemRow} ${completed ? styles.completed : ''} ${styles[problem.difficulty?.toLowerCase() || 'medium']}`}>
            <button
                onClick={handleToggle}
                className={`${styles.checkbox} ${completed ? styles.checked : ''}`}
                disabled={isLoading}
            >
                {completed && <Check size={14} strokeWidth={4} />}
            </button>

            <a href={problem.url} target="_blank" rel="noreferrer" className={styles.problemLink}>
                {problem.title}
            </a>

            <div className={styles.rowMeta}>
                <span className={styles.difficultyLabel}>{problem.difficulty || 'Medium'}</span>
                <ExternalLink size={14} className={styles.extIcon} />
            </div>
        </div>
    );
}

