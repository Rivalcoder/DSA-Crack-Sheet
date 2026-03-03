"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import styles from "./Navbar.module.css";
import { ThemeToggle } from "./ThemeToggle";
import { ChevronDown } from "lucide-react";
import { NAV_LINKS } from "@/lib/sheets";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <motion.nav
            className={styles.nav}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
        >
            <div className={styles.navInner}>
                <Link href="/" className={styles.logo}>
                    <span>DSA Q&A</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/byts-problems" className={styles.navLink}>Byts Problems</Link>
                    <Link href="/a2z-sheet" className={styles.navLink}>A2Z Sheet</Link>
                    <div className={styles.dropdown}>
                        <button className={styles.dropdownBtn}>
                            More <ChevronDown size={14} className={styles.chevron} />
                        </button>
                        <div className={styles.dropdownContent}>
                            {NAV_LINKS.filter(link => !['byts-problems', 'a2z-sheet'].includes(link.slug)).map(link => (
                                <Link key={link.slug} href={`/${link.slug}`} className={styles.dropdownLink}>
                                    {link.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.menu}>
                    <ThemeToggle />
                    {session ? (
                        <div className={styles.userMenu}>
                            <span className={styles.userEmail}>{session.user?.name || session.user?.email}</span>
                            <button onClick={() => signOut()} className={styles.logoutBtn}>Logout</button>
                        </div>
                    ) : (
                        <div className={styles.authContainer}>
                            <Link href="/login" className={styles.link}>Log In</Link>
                            <Link href="/register" className={styles.authBtn}>Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
