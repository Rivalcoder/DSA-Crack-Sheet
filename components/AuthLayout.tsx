"use client";
import { motion } from "framer-motion";
import styles from "./AuthLayout.module.css";
import Link from "next/link";

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footerText: string;
    footerLinkText: string;
    footerLinkHref: string;
}

export default function AuthLayout({ title, subtitle, children, footerText, footerLinkText, footerLinkHref }: AuthLayoutProps) {
    return (
        <div className={styles.pageContainer}>
            {/* Graphic Side - Hidden on mobile, vibrant on desktop */}
            <div className={styles.graphicSide}>
                <div className={styles.gridPattern} />
                <div className={`${styles.orb} ${styles.orb1}`} />
                <div className={`${styles.orb} ${styles.orb2}`} />

                <motion.div
                    className={styles.graphicContent}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className={styles.graphicTitle}>Consistency is Key</h1>
                    <p className={styles.graphicText}>
                        "Success is not final, failure is not fatal: it is the courage to continue that counts."
                    </p>
                    {/* Abstract Interactive Element Simulation */}
                    <div style={{
                        marginTop: '2rem',
                        height: '10px',
                        width: '100%',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <motion.div
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                borderRadius: '999px'
                            }}
                            initial={{ width: "0%" }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Form Side */}
            <div className={styles.formSide}>
                <motion.div
                    className={styles.formCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                >
                    <div className="mb-0">
                        <h1 className={styles.title}>{title}</h1>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </div>

                    {children}

                    <div className={styles.footer}>
                        {footerText}
                        <Link href={footerLinkHref} className={styles.link}>{footerLinkText}</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
