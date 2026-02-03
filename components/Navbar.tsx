"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import styles from "./Navbar.module.css";
import { ThemeToggle } from "./ThemeToggle";

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
