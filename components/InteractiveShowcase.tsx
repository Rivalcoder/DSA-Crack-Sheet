"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./InteractiveShowcase.module.css";

export const InteractiveShowcase = () => {
    const [activeTab, setActiveTab] = useState(0);

    // Auto switch tabs
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const codeSnippets = [
        {
            title: "Track Arrays",
            lang: "javascript",
            code: `const twoSum = (nums, target) => {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
};`,
            output: "Success: Runtime 58ms"
        },
        {
            title: "Master Trees",
            lang: "python",
            code: `def invertTree(root):
    if not root:
        return None
    root.left, root.right = \\
        invertTree(root.right), \\
        invertTree(root.left)
    return root`,
            output: "Success: Memory 14.2MB"
        },
        {
            title: "Graph Theory",
            lang: "java",
            code: `public boolean canFinish(numCourses, prerequisites) {
    // Build adjacency list
    ArrayList<Integer>[] G = new ArrayList[numCourses];
    // Check for cycles...
    // Topological sort...
    return true;
}`,
            output: "Success: Beats 99.5%"
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.flexContainer}>
                    {/* Left Text Content */}
                    <div className={styles.contentSide}>
                        <motion.h2
                            className={styles.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Learn by <span className={styles.textGradient}>Doing</span>
                        </motion.h2>
                        <motion.p
                            className={styles.description}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Immerse yourself in a distraction-free environment designed for coding interviews.
                            Track patterns, not just problems. Our intelligent system adapts to your pace.
                        </motion.p>

                        <div className={styles.tabContainer}>
                            {codeSnippets.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`${styles.tabBtn} ${activeTab === index ? styles.activeTab : styles.inactiveTab}`}
                                >
                                    {item.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Interactive Code Window */}
                    <div className={styles.demoSide}>
                        <motion.div
                            className={styles.codeWindow}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            {/* Editor Header */}
                            <div className={styles.windowHeader}>
                                <div className={styles.windowControls}>
                                    <div className={`${styles.dot} ${styles.dotRed}`} />
                                    <div className={`${styles.dot} ${styles.dotYellow}`} />
                                    <div className={`${styles.dot} ${styles.dotGreen}`} />
                                </div>
                                <div className={styles.fileName}>
                                    {codeSnippets[activeTab].title.toLowerCase().replace(" ", "_")}.{codeSnippets[activeTab].lang === 'python' ? 'py' : codeSnippets[activeTab].lang === 'java' ? 'java' : 'js'}
                                </div>
                            </div>

                            {/* Code Area */}
                            <div className={styles.codeArea}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className={styles.codeBlockShell}
                                    >
                                        <pre className={styles.codeBlock}>
                                            <code>{codeSnippets[activeTab].code}</code>
                                        </pre>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Terminal Output */}
                            <div className={styles.terminal}>
                                <div className={styles.terminalHeader}>
                                    <span className={styles.terminalPrompt}>➜</span>
                                    <span>~</span>
                                    <span>running tests...</span>
                                </div>
                                <motion.div
                                    key={`output-${activeTab}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className={styles.terminalOutput}
                                >
                                    {codeSnippets[activeTab].output}
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Background Glows */}
                <div className={styles.glowBg} />
            </div>
        </section>
    );
};
