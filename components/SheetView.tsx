"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleProblem } from '@/app/actions';
import { Check, ChevronDown, ExternalLink, Activity, Layers, Folder } from 'lucide-react';
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

export default function SheetView({ data }: { data: Section[] }) {
    const totalProblems = data.reduce((acc, sec) => acc + sec.patterns.reduce((pAcc, pat) => pAcc + pat.problems.length, 0), 0);
    const completedProblems = data.reduce((acc, sec) => acc + sec.patterns.reduce((pAcc, pat) => pAcc + pat.problems.filter(p => p.isCompleted).length, 0), 0);
    const progress = totalProblems === 0 ? 0 : (completedProblems / totalProblems) * 100;

    return (
        <motion.div
            className={styles.wrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.progressCard}>
                <div className={styles.headerRow}>
                    <h2>Your Journey</h2>
                    <span className={styles.percentage}>{progress.toFixed(0)}%</span>
                </div>

                <div className={styles.track}>
                    <motion.div
                        className={styles.fill}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                    />
                </div>
                <div className={styles.stats}>
                    {completedProblems} of {totalProblems} problems conquered
                </div>
            </div>

            <div className={styles.list}>
                {data.map((section, idx) => (
                    <SectionView key={idx} section={section} index={idx} />
                ))}
            </div>
        </motion.div>
    );
}

function SectionView({ section, index }: { section: Section, index: number }) {
    const [isOpen, setIsOpen] = useState(index === 0); // Open first one by default

    return (
        <motion.div
            className={styles.section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.sectionHeader}
            >
                <div className={styles.sectionTitle}>
                    <div className={styles.iconBox}>
                        <Folder size={18} />
                    </div>
                    <span>{section.title}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} className="text-muted" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className={styles.sectionContent}>
                            {section.patterns.map((pattern, idx) => (
                                <PatternView key={idx} pattern={pattern} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function PatternView({ pattern }: { pattern: Pattern }) {
    if (pattern.problems.length === 0) return null;

    return (
        <div className={styles.patternBlock}>
            <h3 className={styles.patternTitle}>{pattern.title.replace('Pattern', '').replace(/^\d+:\s*/, '')}</h3>
            <div className={styles.problemsGrid}>
                {pattern.problems.map(prob => (
                    <ProblemCard key={prob._id} problem={prob} />
                ))}
            </div>
        </div>
    );
}

function ProblemCard({ problem }: { problem: Problem }) {
    const [completed, setCompleted] = useState(problem.isCompleted);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (isLoading) return;
        setIsLoading(true);
        // Optimistic UI
        const newState = !completed;
        setCompleted(newState);

        const res = await toggleProblem(problem._id, newState);
        if (!res.success) {
            setCompleted(!newState); // Revert
        }
        setIsLoading(false);
    };

    return (
        <div className={`${styles.problemCard} ${completed ? styles.completed : ''}`}>
            <button
                onClick={handleToggle}
                className={`${styles.checkBtn} ${completed ? styles.checked : ''}`}
                disabled={isLoading}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: completed ? 1 : 0 }}
                >
                    <Check size={16} strokeWidth={3} />
                </motion.div>
            </button>

            <div className={styles.cardContent}>
                <a href={problem.url} target="_blank" rel="noreferrer" className={styles.problemTitle} title={problem.title}>
                    {problem.title}
                </a>
                <div className={styles.meta}>
                    <span className={styles.badge}>{problem.difficulty || 'Medium'}</span>
                </div>
            </div>

            <a href={problem.url} target="_blank" rel="noreferrer" className={styles.linkIcon}>
                <ExternalLink size={14} />
            </a>
        </div>
    );
}
